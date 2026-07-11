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
 * ███████████████████████████████████████ #server/plugins/jenscraft-dev-seed.ts ███████████████████████████████████████
 *
 * DEV ONLY. Seeds a mock jenscraft metrics snapshot (refreshed on an interval) so the service dashboard renders
 * real-looking live tiles in local dev before the real LXC publisher exists. Guarded by import.meta.dev; never runs in
 * production. Backs off the moment a real push arrives so a local publisher can take over.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { IJenscraftMetricsPayload, IStoredJenscraftMetrics } from '#utils/jenscraft-metrics';

/**
 * Rounds a number to one decimal place
 * @internal
 * @function
 * @param n - The number to round
 * @returns The rounded number
 */
const round1 = (n: number): number => Math.round(n * 10) / 10;

/**
 * Rounds a number to two decimal places
 * @internal
 * @function
 * @param n - The number to round
 * @returns The rounded number
 */
const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Builds a plausible mock Jenscraft metrics snapshot, lightly randomized so each reseed looks like fresh live data
 * @internal
 * @function
 * @returns The mock payload stamped with the current time
 */
function mockPayload(): IJenscraftMetricsPayload {
  const online: number = Math.floor(Math.random() * 6); // 0–5 players
  const bedrock: number = online === 0 ? 0 : Math.round(Math.random() * Math.min(2, online));
  return {
    v: 1,
    ts: new Date().toISOString(),
    players: {
      online,
      max: 20,
      java: online - bedrock,
      bedrock,
    },
    tps: round2(19.6 + Math.random() * 0.4),
    mspt: round2(2.4 + Math.random() * 3),
    uptimeSec: 3 * 86_400 + Math.floor((Date.now() / 1000) % 86_400),
    world: { exploredPct: round1(37 + Math.random() * 1.5) },
    mobs: { defeated: 12_840 + Math.floor((Date.now() / 1000) % 600) },
  };
}

export default defineNitroPlugin((): void => {
  if (!import.meta.dev) {
    return;
  }
  // Seed mock data, but back off as soon as a real push arrives so a local publisher can take over.
  const seedIfStale = async (): Promise<void> => {
    // Read the latest stored snapshot; a fresh real push (< ~100s old) means a local publisher owns the feed
    const latest: IStoredJenscraftMetrics | null = await readLatestJenscraftMetrics();
    if (latest && Date.now() - latest.receivedAt < 100_000) {
      return;
    }
    // Overwrite the stored snapshot with a fresh mock payload
    await writeLatestJenscraftMetrics(mockPayload());
  };
  void seedIfStale();
  setInterval((): void => void seedIfStale(), 20_000);
});
