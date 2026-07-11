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
 * █████████████████████████████████████ #server/utils/jenscraft-metrics/utils.ts ██████████████████████████████████████
 *
 * Server-side helpers for the Jenscraft live-metrics feed: a dependency-free validator for the public payload and the
 * Nitro storage read/write. Staleness (metricsState) and the rate limiter (allowRequest) are reused from the substrate
 * metrics util. Auto-imported into the jenscraft server routes.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • docs/project-planning/substrate-metrics-feed.md; the shared push to ingest design + payload contract
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { IJenscraftMetricsPayload, IStoredJenscraftMetrics } from './types';

/* ─── Validation (no external deps; unknown keys are dropped by construction) ──────────────────────────────────────── */

const isNum = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isPct = (value: unknown): value is number => isNum(value) && value >= 0 && value <= 100;
const isCount = (value: unknown): value is number =>
  isNum(value) && Number.isInteger(value) && value >= 0 && value <= 100_000;
const isBigCount = (value: unknown): value is number =>
  isNum(value) && Number.isInteger(value) && value >= 0 && value <= 1_000_000_000;
const isObj = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const inRange = (value: unknown, low: number, high: number): value is number =>
  isNum(value) && value >= low && value <= high;

/**
 * Validates the optional players block, rebuilding it from the four known count fields only
 * @internal
 * @function
 * @param value - The untrusted players value from the request body
 * @returns The clean players object, or null when the block is present but malformed
 */
function cleanPlayers(value: unknown): { online: number; max: number; java: number; bedrock: number } | null {
  if (
    !isObj(value) ||
    !isCount(value.online) ||
    !isCount(value.max) ||
    !isCount(value.java) ||
    !isCount(value.bedrock)
  ) {
    return null;
  }
  return {
    online: value.online,
    max: value.max,
    java: value.java,
    bedrock: value.bedrock,
  };
}

/**
 * Validates and rounds the optional spark/uptime numbers (tps, mspt, uptimeSec) onto the clean payload
 * @internal
 * @function
 * @param input - The untrusted request body
 * @param value - The clean payload being built; validated numbers are written onto it in place
 * @returns True when every present field is in range; false rejects the whole snapshot
 */
function applyNumbers(input: Record<string, unknown>, value: IJenscraftMetricsPayload): boolean {
  if (input.tps !== undefined) {
    if (!inRange(input.tps, 0, 20)) {
      return false;
    } // Paper caps TPS at 20
    value.tps = Math.round(input.tps * 100) / 100;
  }
  if (input.mspt !== undefined) {
    if (!inRange(input.mspt, 0, 60_000)) {
      return false;
    }
    value.mspt = Math.round(input.mspt * 100) / 100;
  }
  if (input.uptimeSec !== undefined) {
    if (!inRange(input.uptimeSec, 0, Number.MAX_SAFE_INTEGER)) {
      return false;
    }
    value.uptimeSec = Math.round(input.uptimeSec);
  }
  return true;
}

/**
 * Validates an untrusted body into a clean payload. The returned object is rebuilt from known fields only, so any
 * extra keys an attacker sends are silently dropped
 * @param input - The untrusted request body
 * @returns An ok result with the clean value, or `{ ok: false }` on any shape/range violation
 */
export function validateJenscraftPayload(
  input: unknown,
): { ok: true; value: IJenscraftMetricsPayload } | { ok: false } {
  if (!isObj(input) || !isNum(input.v) || typeof input.ts !== 'string' || input.ts.length > 40) {
    return { ok: false };
  }

  const value: IJenscraftMetricsPayload = { v: input.v, ts: input.ts };

  // Every metric is optional; the publisher sends whatever it could gather, so a cold start or a missing spark
  // reading just shows a placeholder on that one tile instead of dropping the whole snapshot.
  if (input.players !== undefined) {
    const players = cleanPlayers(input.players);
    if (!players) {
      return { ok: false };
    }
    value.players = players;
  }
  if (!applyNumbers(input, value)) {
    return { ok: false };
  }

  if (isObj(input.world) && isPct(input.world.exploredPct)) {
    value.world = { exploredPct: Math.round(input.world.exploredPct * 10) / 10 };
  }
  if (isObj(input.mobs) && isBigCount(input.mobs.defeated)) {
    value.mobs = { defeated: input.mobs.defeated };
  }

  return { ok: true, value };
}

/* ─── Storage (Nitro useStorage: memory in dev; the `jenscraft` mount points at Upstash in prod) ──────────────────── */

const KEY = 'metrics:latest';

/**
 * Persists the latest snapshot, stamping the server receive time used for staleness
 * @param payload - The validated payload to store
 */
export async function writeLatestJenscraftMetrics(payload: IJenscraftMetricsPayload): Promise<void> {
  await useStorage('jenscraft').setItem(KEY, { ...payload, receivedAt: Date.now() } satisfies IStoredJenscraftMetrics);
}

/**
 * Reads the latest stored snapshot
 * @returns The stored record, or null when none has been written
 */
export async function readLatestJenscraftMetrics(): Promise<IStoredJenscraftMetrics | null> {
  return (await useStorage('jenscraft').getItem<IStoredJenscraftMetrics>(KEY)) ?? null;
}
