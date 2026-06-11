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
 * ████████████████████████████████████████ #server/api/substrate/metrics.get.ts ███████████████████████████████████████
 *
 * Public read for the Substrate widgets. Returns the last-known payload plus a derived state (live | stale |
 * offline) and its age. Renders last-known stats when the lab is quiet; never reveals why it might be offline.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=5, s-maxage=15');

  const [stored, history] = await Promise.all([readLatestMetrics(), readHistory()]);
  if (!stored) {
    return {
      state: 'offline' as const,
      ageSec: null,
      ts: null,
      node: null,
      guests: null,
      storage: null,
      internet: null,
      history,
    };
  }

  const { state, ageSec } = metricsState(stored.receivedAt);
  return {
    state,
    ageSec,
    ts: stored.ts,
    node: stored.node,
    guests: stored.guests,
    storage: stored.storage ?? null,
    internet: stored.internet ?? null,
    history,
  };
});
