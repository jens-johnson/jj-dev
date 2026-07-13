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
 * Nitro storage read/write. Staleness (metricsState) is reused from the substrate module, and rate limiting
 * (checkRateLimit) from the rate-limit module. Auto-imported into the jenscraft server routes.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • docs/project-planning/substrate-metrics-feed.md; the shared push to ingest design + payload contract
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { JENSCRAFT_LATEST_KEY } from './constants';
import type { IJenscraftMetricsPayload, IStoredJenscraftMetrics, TJenscraftMetricsValidation } from './types';

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
 * A type guard for a large non-negative integer count (capped at 1,000,000,000 to reject absurd values)
 * @internal
 * @function
 * @param value - The value to test
 * @returns True when the value is an integer within 0..1,000,000,000
 */
function isBigCount(value: unknown): value is number {
  return isNum(value) && Number.isInteger(value) && value >= 0 && value <= 1_000_000_000;
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
 * A type guard for a finite number within an inclusive range
 * @internal
 * @function
 * @param value - The value to test
 * @param low - The inclusive lower bound
 * @param high - The inclusive upper bound
 * @returns True when the value is a number within low..high
 */
function inRange(value: unknown, low: number, high: number): value is number {
  return isNum(value) && value >= low && value <= high;
}

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
 * @public
 * @function
 * @param input - The untrusted request body
 * @returns An ok result with the clean value, or `{ ok: false }` on any shape/range violation
 */
export function validateJenscraftPayload(input: unknown): TJenscraftMetricsValidation {
  // Reject anything without the envelope fields: an object, a numeric version, and a bounded timestamp string
  if (!isObj(input) || !isNum(input.v) || typeof input.ts !== 'string' || input.ts.length > 40) {
    return { ok: false };
  }

  // Seed the clean payload with the validated envelope; every metric block is attached below only when it checks out
  const value: IJenscraftMetricsPayload = { v: input.v, ts: input.ts };

  // Every metric is optional; the publisher sends whatever it could gather, so a cold start or a missing spark
  // reading just shows a placeholder on that one tile instead of dropping the whole snapshot.
  if (input.players !== undefined) {
    // The players block, when present, must rebuild cleanly from its four count fields
    const players: ReturnType<typeof cleanPlayers> = cleanPlayers(input.players);
    if (!players) {
      return { ok: false };
    }
    value.players = players;
  }

  // Validate and round the optional spark/uptime numbers onto the payload; a present-but-out-of-range field rejects
  if (!applyNumbers(input, value)) {
    return { ok: false };
  }

  // Attach the remaining optional blocks only when present and in range
  if (isObj(input.world) && isPct(input.world.exploredPct)) {
    value.world = { exploredPct: Math.round(input.world.exploredPct * 10) / 10 };
  }
  if (isObj(input.mobs) && isBigCount(input.mobs.defeated)) {
    value.mobs = { defeated: input.mobs.defeated };
  }

  return { ok: true, value };
}

/* ─── Storage (Nitro useStorage: memory in dev; the `jenscraft` mount points at Upstash in prod) ──────────────────── */

/**
 * Persists the latest snapshot, stamping the server receive time used for staleness
 * @public
 * @function
 * @param payload - The validated payload to store
 * @returns A promise that resolves once the snapshot has been written
 */
export async function writeLatestJenscraftMetrics(payload: IJenscraftMetricsPayload): Promise<void> {
  await useStorage('jenscraft').setItem(JENSCRAFT_LATEST_KEY, {
    ...payload,
    receivedAt: Date.now(),
  } satisfies IStoredJenscraftMetrics);
}

/**
 * Reads the latest stored snapshot
 * @public
 * @function
 * @returns The stored record, or null when none has been written
 */
export async function readLatestJenscraftMetrics(): Promise<IStoredJenscraftMetrics | null> {
  return (await useStorage('jenscraft').getItem<IStoredJenscraftMetrics>(JENSCRAFT_LATEST_KEY)) ?? null;
}
