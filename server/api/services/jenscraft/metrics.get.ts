/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                 ██        ██                     ▄▄
 *                                 ▀▀        ▀▀                     ██
 *                               ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                 ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                 ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                 ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                 ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                              ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * ███████████████████████████████████ #server/api/services/jenscraft/metrics.get.ts ███████████████████████████████████
 *
 * Public read for the Jenscraft service dashboard. Returns the last-known snapshot plus a derived state (live | stale |
 * offline) and its age. Renders last-known values when the server is quiet; never reveals why it might be offline.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * GET /api/services/jenscraft/metrics
 *
 * ─── RETURNS ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • The last-known snapshot (players, tps, mspt, uptimeSec, world, mobs) plus the derived freshness state and age
 *   • An all-null snapshot with state 'offline' when nothing has been stored yet
 *
 * ─── THROWS ──────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • 502 when reading the stored snapshot fails
 *
 * ─── SIDE EFFECTS ────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • Sets a short-lived Cache-Control header (public, max-age=5, s-maxage=15)
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { H3Event } from 'h3';

import type { IJenscraftMetricsResponse, IStoredJenscraftMetrics } from '#utils/jenscraft-metrics';
import type { TSubstrateMetricsState } from '#utils/substrate-metrics';

/**
 * Serves the public Jenscraft metrics read: the last-known snapshot plus a derived freshness state (live | stale |
 * offline) and its age, falling back to an all-null offline shape when nothing has been stored yet
 * @public
 * @default
 * @function
 * @param event - The incoming request event
 * @throws 502 when reading the stored snapshot fails
 * @returns The last-known snapshot fields plus the derived freshness state and age
 */
export default defineEventHandler(async (event: H3Event): Promise<IJenscraftMetricsResponse> => {
  // Cache briefly at the edge; the feed only refreshes on the publisher's push cadence anyway
  setResponseHeader(event, 'Cache-Control', 'public, max-age=5, s-maxage=15');

  // Read the last-known snapshot; an empty store renders as offline with every metric nulled
  const stored: IStoredJenscraftMetrics | null = await runUpstream(
    readLatestJenscraftMetrics(),
    'Reading the Jenscraft snapshot failed.',
  );
  if (!stored) {
    return {
      state: 'offline' as const,
      ageSec: null,
      ts: null,
      players: null,
      tps: null,
      mspt: null,
      uptimeSec: null,
      world: null,
      mobs: null,
    };
  }

  // Derive freshness from the server receive time, then surface the snapshot with absent metrics nulled
  const { state, ageSec }: { state: TSubstrateMetricsState; ageSec: number } = metricsState(stored.receivedAt);
  return {
    state,
    ageSec,
    ts: stored.ts,
    players: stored.players ?? null,
    tps: stored.tps ?? null,
    mspt: stored.mspt ?? null,
    uptimeSec: stored.uptimeSec ?? null,
    world: stored.world ?? null,
    mobs: stored.mobs ?? null,
  };
});
