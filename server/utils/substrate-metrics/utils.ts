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
 * █████████████████████████████████████ #server/utils/substrate-metrics/utils.ts ██████████████████████████████████████
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

import {
  SUBSTRATE_HISTORY_KEY,
  SUBSTRATE_HISTORY_MAX,
  SUBSTRATE_LATEST_KEY,
  SUBSTRATE_LIVE_MAX_AGE_S,
  SUBSTRATE_STALE_MAX_AGE_S,
} from './constants';
import type {
  IStoredSubstrateMetrics,
  ISubstrateMetricsPayload,
  ISubstrateMetricsSample,
  TSubstrateMetricsState,
  TSubstrateMetricsValidation,
} from './types';

/* ─── Validation (no external deps; unknown keys are dropped by construction) ──────────────────────────────────────── */

/**
 * A type guard for a finite number
 * @internal
 * @function
 * @param value - The value to test
 * @returns True when the value is a finite number
 */
function isNum(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * A type guard for a percentage (a finite number in the 0..100 range)
 * @internal
 * @function
 * @param value - The value to test
 * @returns True when the value is a number within 0..100
 */
function isPct(value: unknown): value is number {
  return isNum(value) && value >= 0 && value <= 100;
}

/**
 * A type guard for a non-negative integer count (capped at 100,000 to reject absurd values)
 * @internal
 * @function
 * @param value - The value to test
 * @returns True when the value is an integer within 0..100,000
 */
function isCount(value: unknown): value is number {
  return isNum(value) && Number.isInteger(value) && value >= 0 && value <= 100_000;
}

/**
 * A type guard for a plain (non-array, non-null) object
 * @internal
 * @function
 * @param value - The value to test
 * @returns True when the value is a plain object
 */
function isObj(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates an untrusted body into a clean payload. The returned object is rebuilt from known fields only, so any
 * extra keys an attacker sends are silently dropped
 * @public
 * @function
 * @param input - The untrusted request body
 * @returns An ok result with the clean value, or `{ ok: false }` on any shape/range violation
 */
export function validateMetricsPayload(input: unknown): TSubstrateMetricsValidation {
  // Reject anything without the envelope fields: an object, a numeric version, and a bounded timestamp string
  if (!isObj(input) || !isNum(input.v) || typeof input.ts !== 'string' || input.ts.length > 40) {
    return { ok: false };
  }

  // The node and guests blocks are required objects
  const node: unknown = input.node;
  const guests: unknown = input.guests;
  if (!isObj(node) || !isObj(guests)) {
    return { ok: false };
  }

  // The node block must carry a memory object and a three-element numeric load average
  const mem: unknown = node.mem;
  const loadAvg: unknown = node.loadAvg;
  if (!isObj(mem) || !Array.isArray(loadAvg) || loadAvg.length !== 3 || !loadAvg.every(isNum)) {
    return { ok: false };
  }

  // Range-check the node scalars and the memory figures
  if (!isNum(node.uptimeSec) || node.uptimeSec < 0 || !isPct(node.cpuPct)) {
    return { ok: false };
  }
  if (!isPct(mem.usedPct) || !isNum(mem.totalGiB) || mem.totalGiB <= 0) {
    return { ok: false };
  }

  // The guest counts must all be bounded non-negative integers
  if (!isCount(guests.vms) || !isCount(guests.cts) || !isCount(guests.running)) {
    return { ok: false };
  }

  // Rebuild the required surface from validated fields only; unknown keys never make it into the result
  const value: ISubstrateMetricsPayload = {
    v: input.v,
    ts: input.ts,
    node: {
      uptimeSec: node.uptimeSec,
      cpuPct: node.cpuPct,
      loadAvg: [Number(loadAvg[0]), Number(loadAvg[1]), Number(loadAvg[2])],
      mem: { usedPct: mem.usedPct, totalGiB: mem.totalGiB },
    },
    guests: {
      vms: guests.vms,
      cts: guests.cts,
      running: guests.running,
    },
  };

  // Attach the optional blocks only when present and in range
  if (isObj(node.swap) && isPct(node.swap.usedPct)) {
    value.node.swap = { usedPct: node.swap.usedPct };
  }
  if (isObj(input.storage) && isPct(input.storage.usedPct)) {
    value.storage = { usedPct: input.storage.usedPct };
  }

  const net: unknown = input.internet;
  if (isObj(net) && typeof net.reachable === 'boolean') {
    value.internet = { reachable: net.reachable };
    if (isNum(net.latencyMs) && net.latencyMs >= 0 && net.latencyMs <= 60_000) {
      value.internet.latencyMs = Math.round(net.latencyMs);
    }
  }

  return { ok: true, value };
}

/* ─── Storage (Nitro useStorage: memory in dev; the `substrate` mount points at Upstash for prod) ──────────────────── */

/**
 * Persists the latest snapshot and appends a compact point to the rolling history (for the sparklines)
 * @public
 * @function
 * @param payload - The validated payload to store
 * @returns A promise that resolves once the snapshot and history have been written
 */
export async function writeLatestMetrics(payload: ISubstrateMetricsPayload): Promise<void> {
  const store: ReturnType<typeof useStorage> = useStorage('substrate');
  const receivedAt: number = Date.now();

  // Store the snapshot, stamping the server receive time that drives staleness
  await store.setItem(SUBSTRATE_LATEST_KEY, { ...payload, receivedAt } satisfies IStoredSubstrateMetrics);

  // Append a compact CPU/memory sample to the rolling history, trimmed to the retention cap
  const prev: ISubstrateMetricsSample[] = (await store.getItem<ISubstrateMetricsSample[]>(SUBSTRATE_HISTORY_KEY)) ?? [];
  const next: ISubstrateMetricsSample[] = [
    ...prev,
    {
      t: receivedAt,
      cpu: payload.node.cpuPct,
      mem: payload.node.mem.usedPct,
    },
  ].slice(-SUBSTRATE_HISTORY_MAX);
  await store.setItem(SUBSTRATE_HISTORY_KEY, next);
}

/**
 * Reads the latest stored snapshot
 * @public
 * @function
 * @returns The stored record, or null when none has been written
 */
export async function readLatestMetrics(): Promise<IStoredSubstrateMetrics | null> {
  return (await useStorage('substrate').getItem<IStoredSubstrateMetrics>(SUBSTRATE_LATEST_KEY)) ?? null;
}

/**
 * Reads the rolling sample history
 * @public
 * @function
 * @returns The stored history samples, or an empty array when none
 */
export async function readHistory(): Promise<ISubstrateMetricsSample[]> {
  return (await useStorage('substrate').getItem<ISubstrateMetricsSample[]>(SUBSTRATE_HISTORY_KEY)) ?? [];
}

/**
 * Replaces the rolling history outright; used by the dev seed to pre-populate the sparklines
 * @public
 * @function
 * @param samples - The samples to store (trimmed to the history cap)
 * @returns A promise that resolves once the history has been replaced
 */
export async function setHistory(samples: ISubstrateMetricsSample[]): Promise<void> {
  await useStorage('substrate').setItem(SUBSTRATE_HISTORY_KEY, samples.slice(-SUBSTRATE_HISTORY_MAX));
}

/* ─── Staleness ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Computes the feed freshness state and sample age from a receive time
 * @public
 * @function
 * @param receivedAt - The server receive time (epoch milliseconds)
 * @param now - The current time (epoch milliseconds), defaulting to now
 * @returns The freshness state and the sample age in seconds
 */
export function metricsState(
  receivedAt: number,
  now: number = Date.now(),
): { state: TSubstrateMetricsState; ageSec: number } {
  const ageSec: number = Math.max(0, Math.round((now - receivedAt) / 1000));
  const state: TSubstrateMetricsState =
    ageSec <= SUBSTRATE_LIVE_MAX_AGE_S ? 'live' : ageSec <= SUBSTRATE_STALE_MAX_AGE_S ? 'stale' : 'offline';
  return { state, ageSec };
}

/* ─── Dev-grade in-memory rate limit (per-process; Phase B replaces with Upstash Ratelimit) ───────────────────────── */

/**
 * The per-process rate-limit buckets, keyed by client, holding the timestamps of recent requests
 * @internal
 * @constant
 */
const hits: Map<string, number[]> = new Map<string, number[]>();

/**
 * Dev-grade in-memory rate limiter (per-process)
 * @public
 * @function
 * @param key - The bucket key (e.g. the client IP)
 * @param limit - The maximum requests allowed within the window
 * @param windowMs - The rolling window length in milliseconds
 * @param now - The current time (epoch milliseconds), defaulting to now
 * @returns True when the request is allowed, false when the bucket is exhausted
 */
export function allowRequest(
  key: string,
  limit: number = 12,
  windowMs: number = 60_000,
  now: number = Date.now(),
): boolean {
  const recent: number[] = (hits.get(key) ?? []).filter((timestamp: number): boolean => now - timestamp < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
