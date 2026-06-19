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
 * ███████████████████████████████████ #server/api/services/jenscraft/metrics.get.ts ███████████████████████████████████
 *
 * Public read for the Jenscraft service dashboard. Returns the last-known snapshot plus a derived state (live | stale |
 * offline) and its age. Renders last-known values when the server is quiet; never reveals why it might be offline.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=5, s-maxage=15');

  const stored = await readLatestJenscraftMetrics();
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

  const { state, ageSec } = metricsState(stored.receivedAt);
  return {
    state,
    ageSec,
    ts: stored.ts,
    players: stored.players,
    tps: stored.tps,
    mspt: stored.mspt,
    uptimeSec: stored.uptimeSec,
    world: stored.world ?? null,
    mobs: stored.mobs ?? null,
  };
});
