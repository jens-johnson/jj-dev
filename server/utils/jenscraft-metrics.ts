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
 * ████████████████████████████████████████ #server/utils/jenscraft-metrics.ts █████████████████████████████████████████
 *
 * Server-side helpers for the Jenscraft live-metrics feed: a dependency-free validator for the public payload and the
 * Nitro storage read/write. Staleness (`metricsState`) and the rate limiter (`allowRequest`) are reused from the
 * substrate metrics util. Auto-imported into the jenscraft server routes.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • docs/project-planning/substrate-metrics-feed.md — the shared push→ingest design + payload contract
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/** The validated, public-safe payload the Jenscraft LXC publisher POSTs. Counts/percentages only; never identifiers. */
export interface JenscraftMetricsPayload {
  v: number;
  ts: string;
  players?: { online: number; max: number; java: number; bedrock: number };
  tps?: number;
  mspt?: number;
  uptimeSec?: number;
  world?: { exploredPct: number };
  mobs?: { defeated: number };
}

/** Stored record adds the server's receive time, the source of truth for staleness. */
export interface StoredJenscraftMetrics extends JenscraftMetricsPayload {
  receivedAt: number;
}

/* ─── Validation (no external deps; unknown keys are dropped by construction) ──────────────────────────────────────── */

const isNum = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const isPct = (x: unknown): x is number => isNum(x) && x >= 0 && x <= 100;
const isCount = (x: unknown): x is number => isNum(x) && Number.isInteger(x) && x >= 0 && x <= 100_000;
const isBigCount = (x: unknown): x is number => isNum(x) && Number.isInteger(x) && x >= 0 && x <= 1_000_000_000;
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const inRange = (x: unknown, lo: number, hi: number): x is number => isNum(x) && x >= lo && x <= hi;

/** Validate the optional players block; returns the clean object, or null if it's present but malformed. */
function cleanPlayers(p: unknown): { online: number; max: number; java: number; bedrock: number } | null {
  if (!isObj(p) || !isCount(p.online) || !isCount(p.max) || !isCount(p.java) || !isCount(p.bedrock)) return null;
  return { online: p.online, max: p.max, java: p.java, bedrock: p.bedrock };
}

/** Validate + round the optional spark/uptime numbers onto `value`. Returns false if any present field is out of range. */
function applyNumbers(input: Record<string, unknown>, value: JenscraftMetricsPayload): boolean {
  if (input.tps !== undefined) {
    if (!inRange(input.tps, 0, 20)) return false; // Paper caps TPS at 20
    value.tps = Math.round(input.tps * 100) / 100;
  }
  if (input.mspt !== undefined) {
    if (!inRange(input.mspt, 0, 60_000)) return false;
    value.mspt = Math.round(input.mspt * 100) / 100;
  }
  if (input.uptimeSec !== undefined) {
    if (!inRange(input.uptimeSec, 0, Number.MAX_SAFE_INTEGER)) return false;
    value.uptimeSec = Math.round(input.uptimeSec);
  }
  return true;
}

/**
 * Validate an untrusted body into a clean `JenscraftMetricsPayload`. Returns `{ ok: false }` on any shape/range
 * violation (the caller responds with a generic 422 — no detail leaked). The returned object is rebuilt from known
 * fields only, so any extra keys an attacker sends are silently dropped.
 */
export function validateJenscraftPayload(input: unknown): { ok: true; value: JenscraftMetricsPayload } | { ok: false } {
  if (!isObj(input) || !isNum(input.v) || typeof input.ts !== 'string' || input.ts.length > 40) return { ok: false };

  const value: JenscraftMetricsPayload = { v: input.v, ts: input.ts };

  // Every metric is optional — the publisher sends whatever it could gather, so a cold start or a missing spark
  // reading just shows "—" on that one tile instead of dropping the whole snapshot.
  if (input.players !== undefined) {
    const players = cleanPlayers(input.players);
    if (!players) return { ok: false };
    value.players = players;
  }
  if (!applyNumbers(input, value)) return { ok: false };

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

/** Persist the latest snapshot, stamping the server receive time used for staleness. */
export async function writeLatestJenscraftMetrics(p: JenscraftMetricsPayload): Promise<void> {
  await useStorage('jenscraft').setItem(KEY, { ...p, receivedAt: Date.now() } satisfies StoredJenscraftMetrics);
}

export async function readLatestJenscraftMetrics(): Promise<StoredJenscraftMetrics | null> {
  return (await useStorage('jenscraft').getItem<StoredJenscraftMetrics>(KEY)) ?? null;
}
