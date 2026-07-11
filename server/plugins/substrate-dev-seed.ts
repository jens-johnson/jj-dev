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
 * ██████████████████████████████████████ #server/plugins/substrate-dev-seed.ts █████████████████████████████████████████
 *
 * DEV ONLY. Seeds a mock metrics payload (and refreshes it on an interval) so the live widgets render real-looking,
 * "fresh" data in local dev before the real publisher exists. Guarded by import.meta.dev; never runs in production.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type {
  IStoredSubstrateMetrics,
  ISubstrateMetricsPayload,
  ISubstrateMetricsSample,
} from '#utils/substrate-metrics';

/**
 * Rounds a number to one decimal place
 * @internal
 * @function
 * @param value - The number to round
 * @returns The rounded number
 */
const round1 = (value: number): number => Math.round(value * 10) / 10;

/**
 * Rounds a number to two decimal places
 * @internal
 * @function
 * @param value - The number to round
 * @returns The rounded number
 */
const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * Builds a plausible mock Substrate metrics payload, lightly randomized so each reseed looks like fresh live data
 * @internal
 * @function
 * @returns The mock payload stamped with the current time
 */
function mockPayload(): ISubstrateMetricsPayload {
  return {
    v: 1,
    ts: new Date().toISOString(),
    node: {
      uptimeSec: 9 * 86_400 + Math.floor((Date.now() / 1000) % 86_400),
      cpuPct: round1(5 + Math.random() * 12),
      loadAvg: [round2(0.15 + Math.random() * 0.35), 0.22, 0.19],
      mem: { usedPct: round1(35 + Math.random() * 8), totalGiB: 16 },
      swap: { usedPct: 0 },
    },
    guests: {
      vms: 2,
      cts: 5,
      running: 6,
    },
    storage: { usedPct: 22.5 },
    internet: { reachable: true, latencyMs: Math.round(7 + Math.random() * 6) },
  };
}

/**
 * Builds a plausible ~15 min CPU/RAM history so the sparklines aren't empty on first paint in dev
 * @internal
 * @function
 * @param points - The number of samples to generate
 * @param stepMs - The spacing between samples in milliseconds
 * @returns The generated history samples, oldest first and anchored at now
 */
function mockHistory(points = 30, stepMs = 30_000): ISubstrateMetricsSample[] {
  // Anchor the series at now and walk backwards one step per point
  const now: number = Date.now();
  return Array.from(
    { length: points },
    (_, i: number): ISubstrateMetricsSample => ({
      t: now - (points - 1 - i) * stepMs,
      cpu: round1(8 + Math.sin(i / 3) * 4 + Math.random() * 3),
      mem: round1(36 + Math.sin(i / 6) * 5 + Math.random() * 2),
    }),
  );
}

export default defineNitroPlugin((): void => {
  if (!import.meta.dev) {
    return;
  }
  // Seed mock data, but back off as soon as a real push arrives so a local publisher can take over.
  const seedIfStale = async (): Promise<void> => {
    // Read the latest stored payload; a fresh real push (< ~100s old) means a local publisher owns the feed
    const latest: IStoredSubstrateMetrics | null = await readLatestMetrics();
    if (latest && Date.now() - latest.receivedAt < 100_000) {
      return;
    }
    // Overwrite the stored payload with a fresh mock snapshot
    await writeLatestMetrics(mockPayload());
  };
  // Pre-fill the rolling history once so sparklines render right away; real pushes append from there.
  const seedHistory = async (): Promise<void> => {
    // Skip when the history already holds enough points to draw the sparklines
    if ((await readHistory()).length >= 8) {
      return;
    }
    await setHistory(mockHistory());
  };
  void seedHistory();
  void seedIfStale();
  setInterval((): void => void seedIfStale(), 20_000);
});
