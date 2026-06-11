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
 * ██████████████████████████████████████ #server/plugins/substrate-dev-seed.ts █████████████████████████████████████████
 *
 * DEV ONLY. Seeds a mock metrics payload (and refreshes it on an interval) so the live widgets render real-looking,
 * "fresh" data in local dev before the real publisher exists. Guarded by import.meta.dev; never runs in production.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { SubstrateMetricsPayload } from '../utils/substrate-metrics';

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

function mockPayload(): SubstrateMetricsPayload {
  return {
    v: 1,
    ts: new Date().toISOString(),
    node: {
      uptimeSec: 9 * 86_400 + Math.floor((Date.now() / 1000) % 86_400),
      cpuPct: round1(5 + Math.random() * 12),
      loadAvg: [round2(0.15 + Math.random() * 0.35), 0.22, 0.19],
      mem: { usedPct: round1(35 + Math.random() * 8), totalGiB: 16 },
      swap: { usedPct: 0 },
    },
    guests: { vms: 2, cts: 5, running: 6 },
    storage: { usedPct: 22.5 },
  };
}

export default defineNitroPlugin(() => {
  if (!import.meta.dev) return;
  // Seed mock data, but back off as soon as a real push arrives so a local publisher can take over.
  const seedIfStale = async () => {
    const latest = await readLatestMetrics();
    if (latest && Date.now() - latest.receivedAt < 100_000) return;
    await writeLatestMetrics(mockPayload());
  };
  void seedIfStale();
  setInterval(() => void seedIfStale(), 20_000);
});
