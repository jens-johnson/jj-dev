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
 * ██████████████████████████████████████ server/utils/substrate-metrics/utils.ts ██████████████████████████████████████
 *
 * Server-side helpers for the Substrate live-metrics feed: a dependency-free validator for the public payload, the
 * Nitro storage read/write, staleness computation, and a dev-grade rate limiter. Auto-imported into the substrate
 * server routes and the dev-seed plugin.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • docs/project-planning/substrate-metrics-feed.md; the design + payload contract
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type {
  IStoredSubstrateMetrics,
  ISubstrateMetricsPayload,
  ISubstrateMetricsSample,
  TSubstrateMetricsState,
} from './types';

/* ─── Validation (no external deps; unknown keys are dropped by construction) ──────────────────────────────────────── */

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isPct = (x: unknown): x is number => isNum(x) && x >= 0 && x <= 100;
const isCount = (x: unknown): x is number => isNum(x) && Number.isInteger(x) && x >= 0 && x <= 100_000;
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

/**
 * Validates an untrusted body into a clean payload. The returned object is rebuilt from known fields only, so any
 * extra keys an attacker sends are silently dropped
 * @param input - The untrusted request body
 * @returns An ok result with the clean value, or `{ ok: false }` on any shape/range violation
 */
export function validateMetricsPayload(input: unknown): { ok: true; value: ISubstrateMetricsPayload } | { ok: false } {
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

  const value: ISubstrateMetricsPayload = {
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

  const net = input.internet;
  if (isObj(net) && typeof net.reachable === 'boolean') {
    value.internet = { reachable: net.reachable };
    if (isNum(net.latencyMs) && net.latencyMs >= 0 && net.latencyMs <= 60_000) {
      value.internet.latencyMs = Math.round(net.latencyMs);
    }
  }

  return { ok: true, value };
}

/* ─── Storage (Nitro useStorage: memory in dev; point the `substrate` mount at Upstash for prod in Phase B) ────────── */

const KEY = 'metrics:latest';
const HISTORY_KEY = 'metrics:history';
const HISTORY_MAX = 60; // ~30 min at a 30s push cadence; enough for a live sparkline, cheap to store.

/**
 * Persists the latest snapshot and appends a compact point to the rolling history (for the sparklines)
 * @param p - The validated payload to store
 */
export async function writeLatestMetrics(p: ISubstrateMetricsPayload): Promise<void> {
  const store = useStorage('substrate');
  const receivedAt = Date.now();
  await store.setItem(KEY, { ...p, receivedAt } satisfies IStoredSubstrateMetrics);

  const prev = (await store.getItem<ISubstrateMetricsSample[]>(HISTORY_KEY)) ?? [];
  const next = [...prev, { t: receivedAt, cpu: p.node.cpuPct, mem: p.node.mem.usedPct }].slice(-HISTORY_MAX);
  await store.setItem(HISTORY_KEY, next);
}

/**
 * Reads the latest stored snapshot
 * @returns The stored record, or null when none has been written
 */
export async function readLatestMetrics(): Promise<IStoredSubstrateMetrics | null> {
  return (await useStorage('substrate').getItem<IStoredSubstrateMetrics>(KEY)) ?? null;
}

/**
 * Reads the rolling sample history
 * @returns The stored history samples, or an empty array when none
 */
export async function readHistory(): Promise<ISubstrateMetricsSample[]> {
  return (await useStorage('substrate').getItem<ISubstrateMetricsSample[]>(HISTORY_KEY)) ?? [];
}

/**
 * Replaces the rolling history outright; used by the dev seed to pre-populate the sparklines
 * @param samples - The samples to store (trimmed to the history cap)
 */
export async function setHistory(samples: ISubstrateMetricsSample[]): Promise<void> {
  await useStorage('substrate').setItem(HISTORY_KEY, samples.slice(-HISTORY_MAX));
}

/* ─── Staleness ───────────────────────────────────────────────────────────────────────────────────────────────────── */

const LIVE_MAX_AGE_S = 90;
const STALE_MAX_AGE_S = 600;

/**
 * Computes the feed freshness state and sample age from a receive time
 * @param receivedAt - The server receive time (epoch milliseconds)
 * @param now - The current time (epoch milliseconds), defaulting to now
 * @returns The freshness state and the sample age in seconds
 */
export function metricsState(receivedAt: number, now = Date.now()): { state: TSubstrateMetricsState; ageSec: number } {
  const ageSec = Math.max(0, Math.round((now - receivedAt) / 1000));
  const state: TSubstrateMetricsState =
    ageSec <= LIVE_MAX_AGE_S ? 'live' : ageSec <= STALE_MAX_AGE_S ? 'stale' : 'offline';
  return { state, ageSec };
}

/* ─── Dev-grade in-memory rate limit (per-process; Phase B replaces with Upstash Ratelimit) ───────────────────────── */

const hits = new Map<string, number[]>();

/**
 * Dev-grade in-memory rate limiter (per-process)
 * @param key - The bucket key (e.g. the client IP)
 * @param limit - The maximum requests allowed within the window
 * @param windowMs - The rolling window length in milliseconds
 * @param now - The current time (epoch milliseconds), defaulting to now
 * @returns True when the request is allowed, false when the bucket is exhausted
 */
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
