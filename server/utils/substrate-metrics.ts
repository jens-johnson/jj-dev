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
 * ███████████████████████████████████████████ #server/utils/substrate-metrics.ts ██████████████████████████████████████
 *
 * Server-side helpers for the Substrate live-metrics feed: a dependency-free validator for the public payload, the
 * Nitro storage read/write, staleness computation, and a dev-grade rate limiter. Auto-imported into the substrate
 * server routes and the dev-seed plugin.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • docs/project-planning/substrate-metrics-feed.md — the design + payload contract
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/** The validated, public-safe payload the lab publisher POSTs. Counts and percentages only; never identifiers. */
export interface SubstrateMetricsPayload {
  v: number;
  ts: string;
  node: {
    uptimeSec: number;
    cpuPct: number;
    loadAvg: [number, number, number];
    mem: { usedPct: number; totalGiB: number };
    swap?: { usedPct: number };
  };
  guests: { vms: number; cts: number; running: number };
  storage?: { usedPct: number };
}

/** Stored record adds the server's receive time, the source of truth for staleness. */
export interface StoredSubstrateMetrics extends SubstrateMetricsPayload {
  receivedAt: number;
}

export type SubstrateMetricsState = 'live' | 'stale' | 'offline';

/* ─── Validation (no external deps; unknown keys are dropped by construction) ──────────────────────────────────────── */

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isPct = (x: unknown): x is number => isNum(x) && x >= 0 && x <= 100;
const isCount = (x: unknown): x is number => isNum(x) && Number.isInteger(x) && x >= 0 && x <= 100_000;
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

/**
 * Validate an untrusted body into a clean `SubstrateMetricsPayload`. Returns `{ ok: false }` on any shape/range
 * violation (the caller responds with a generic 422 — no detail is leaked). The returned object is rebuilt from
 * known fields only, so any extra keys an attacker sends are silently dropped.
 */
export function validateMetricsPayload(input: unknown): { ok: true; value: SubstrateMetricsPayload } | { ok: false } {
  if (!isObj(input) || !isNum(input.v) || typeof input.ts !== 'string' || input.ts.length > 40) return { ok: false };

  const node = input.node;
  const guests = input.guests;
  if (!isObj(node) || !isObj(guests)) return { ok: false };

  const mem = node.mem;
  const la = node.loadAvg;
  if (!isObj(mem) || !Array.isArray(la) || la.length !== 3 || !la.every(isNum)) return { ok: false };
  if (!isNum(node.uptimeSec) || node.uptimeSec < 0 || !isPct(node.cpuPct)) return { ok: false };
  if (!isPct(mem.usedPct) || !isNum(mem.totalGiB) || mem.totalGiB <= 0) return { ok: false };
  if (!isCount(guests.vms) || !isCount(guests.cts) || !isCount(guests.running)) return { ok: false };

  const value: SubstrateMetricsPayload = {
    v: input.v,
    ts: input.ts,
    node: {
      uptimeSec: node.uptimeSec,
      cpuPct: node.cpuPct,
      loadAvg: [Number(la[0]), Number(la[1]), Number(la[2])],
      mem: { usedPct: mem.usedPct, totalGiB: mem.totalGiB },
    },
    guests: { vms: guests.vms, cts: guests.cts, running: guests.running },
  };

  if (isObj(node.swap) && isPct(node.swap.usedPct)) value.node.swap = { usedPct: node.swap.usedPct };
  if (isObj(input.storage) && isPct(input.storage.usedPct)) value.storage = { usedPct: input.storage.usedPct };

  return { ok: true, value };
}

/* ─── Storage (Nitro useStorage: memory in dev; point the `substrate` mount at Upstash for prod in Phase B) ────────── */

const KEY = 'metrics:latest';

export async function writeLatestMetrics(p: SubstrateMetricsPayload): Promise<void> {
  await useStorage('substrate').setItem(KEY, { ...p, receivedAt: Date.now() } satisfies StoredSubstrateMetrics);
}

export async function readLatestMetrics(): Promise<StoredSubstrateMetrics | null> {
  return (await useStorage('substrate').getItem<StoredSubstrateMetrics>(KEY)) ?? null;
}

/* ─── Staleness ───────────────────────────────────────────────────────────────────────────────────────────────────── */

const LIVE_MAX_AGE_S = 90;
const STALE_MAX_AGE_S = 600;

export function metricsState(receivedAt: number, now = Date.now()): { state: SubstrateMetricsState; ageSec: number } {
  const ageSec = Math.max(0, Math.round((now - receivedAt) / 1000));
  const state: SubstrateMetricsState =
    ageSec <= LIVE_MAX_AGE_S ? 'live' : ageSec <= STALE_MAX_AGE_S ? 'stale' : 'offline';
  return { state, ageSec };
}

/* ─── Dev-grade in-memory rate limit (per-process; Phase B replaces with Upstash Ratelimit) ───────────────────────── */

const hits = new Map<string, number[]>();

export function allowRequest(key: string, limit = 12, windowMs = 60_000, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
