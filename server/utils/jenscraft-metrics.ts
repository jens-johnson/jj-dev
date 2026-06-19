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
  players: { online: number; max: number; java: number; bedrock: number };
  tps: number;
  mspt: number;
  uptimeSec: number;
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

/**
 * Validate an untrusted body into a clean `JenscraftMetricsPayload`. Returns `{ ok: false }` on any shape/range
 * violation (the caller responds with a generic 422 — no detail leaked). The returned object is rebuilt from known
 * fields only, so any extra keys an attacker sends are silently dropped.
 */
export function validateJenscraftPayload(input: unknown): { ok: true; value: JenscraftMetricsPayload } | { ok: false } {
  if (!isObj(input) || !isNum(input.v) || typeof input.ts !== 'string' || input.ts.length > 40) return { ok: false };

  const players = input.players;
  if (!isObj(players)) return { ok: false };
  if (!isCount(players.online) || !isCount(players.max) || !isCount(players.java) || !isCount(players.bedrock)) {
    return { ok: false };
  }

  // Paper caps TPS at 20; MSPT is non-negative wall-clock per tick.
  if (!isNum(input.tps) || input.tps < 0 || input.tps > 20) return { ok: false };
  if (!isNum(input.mspt) || input.mspt < 0 || input.mspt > 60_000) return { ok: false };
  if (!isNum(input.uptimeSec) || input.uptimeSec < 0) return { ok: false };

  const value: JenscraftMetricsPayload = {
    v: input.v,
    ts: input.ts,
    players: { online: players.online, max: players.max, java: players.java, bedrock: players.bedrock },
    tps: Math.round(input.tps * 100) / 100,
    mspt: Math.round(input.mspt * 100) / 100,
    uptimeSec: Math.round(input.uptimeSec),
  };

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
