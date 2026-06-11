/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                ██        ██                     ▄▄
 *                                ▀▀        ▀▀                     ██
 *                              ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                             ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * ██████████████████████████████████████████ scripts/substrate-publisher.mjs ██████████████████████████████████████████
 *
 * Lab-side metrics publisher for Substrate. Reads the Proxmox node /status, /qemu and /lxc endpoints (a read-only
 * PVEAuditor token), measures a TCP-connect latency to a public host, and POSTs a scrubbed counts-and-percentages
 * payload to the site's ingest route. The lab dials outward; nothing here is publicly reachable and no identifiers
 * (IPs, hostnames, MACs) ever leave the LAN. Loops forever — intended to run on the lab side (a Mac, or an LXC).
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   PVE_HOST=https://<pve-host>:8006 PVE_NODE=pve PVE_TOKEN='<user>@pam!<token-id>=<uuid>' \
 *   INGEST_URL=https://<site>/api/substrate/ingest INGEST_SECRET=<secret> node scripts/substrate-publisher.mjs
 *
 *   Optional: INTERVAL_S (push cadence, default 60) · PING_HOST (latency target, default 1.1.1.1).
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/* eslint-disable no-console -- this is a CLI script; stdout/stderr is its interface. */

import net from 'node:net';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Proxmox self-signed cert on the LAN

const {
  PVE_HOST,
  PVE_NODE,
  PVE_TOKEN,
  INGEST_URL,
  INGEST_SECRET,
  INTERVAL_S = '60',
  PING_HOST = '1.1.1.1',
} = process.env;

for (const [k, v] of Object.entries({ PVE_HOST, PVE_NODE, PVE_TOKEN, INGEST_URL, INGEST_SECRET }))
  if (!v) {
    console.error(`Missing env: ${k}`);
    process.exit(1);
  }

const r1 = (n) => Math.round(n * 10) / 10;

const pve = async (p) => {
  const res = await fetch(`${PVE_HOST}/api2/json${p}`, { headers: { Authorization: `PVEAPIToken=${PVE_TOKEN}` } });
  if (!res.ok) throw new Error(`PVE ${p} -> ${res.status}`);
  return (await res.json()).data;
};

// TCP-connect round-trip to a public anycast host — a ping-like latency without raw ICMP sockets. null on failure.
const tcpPing = (host, port = 443, timeoutMs = 3000) =>
  new Promise((resolve) => {
    const start = performance.now();
    const sock = net.connect({ host, port });
    let settled = false;
    const finish = (ms) => {
      if (settled) return;
      settled = true;
      sock.destroy();
      resolve(ms);
    };
    sock.setTimeout(timeoutMs);
    sock.once('connect', () => finish(Math.round(performance.now() - start)));
    sock.once('timeout', () => finish(null));
    sock.once('error', () => finish(null));
  });

async function push() {
  const [s, vms, cts, ping] = await Promise.all([
    pve(`/nodes/${PVE_NODE}/status`),
    pve(`/nodes/${PVE_NODE}/qemu`).catch(() => []),
    pve(`/nodes/${PVE_NODE}/lxc`).catch(() => []),
    tcpPing(PING_HOST),
  ]);
  const running = [...vms, ...cts].filter((g) => g.status === 'running').length;
  const payload = {
    v: 1,
    ts: new Date().toISOString(),
    node: {
      uptimeSec: Math.round(s.uptime),
      cpuPct: r1(s.cpu * 100),
      loadAvg: (s.loadavg ?? [0, 0, 0]).map(Number),
      mem: { usedPct: r1((s.memory.used / s.memory.total) * 100), totalGiB: Math.round(s.memory.total / 1024 ** 3) },
      ...(s.swap?.total ? { swap: { usedPct: r1((s.swap.used / s.swap.total) * 100) } } : {}),
    },
    guests: { vms: vms.length, cts: cts.length, running },
    ...(s.rootfs?.total ? { storage: { usedPct: r1((s.rootfs.used / s.rootfs.total) * 100) } } : {}),
    internet: { reachable: ping !== null, ...(ping !== null ? { latencyMs: ping } : {}) },
  };
  const res = await fetch(INGEST_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${INGEST_SECRET}` },
    body: JSON.stringify(payload),
  });
  console.log(
    new Date().toISOString(),
    `cpu=${payload.node.cpuPct}% mem=${payload.node.mem.usedPct}% net=${ping ?? 'x'}ms ->`,
    res.status,
  );
}

await push().catch((e) => console.error('error:', e.message));
setInterval(() => push().catch((e) => console.error('error:', e.message)), Number(INTERVAL_S) * 1000);
