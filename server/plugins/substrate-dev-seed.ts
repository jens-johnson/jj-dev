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

import type { ISubstrateMetricsPayload, ISubstrateMetricsSample } from '../utils/substrate-metrics';

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

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
    guests: { vms: 2, cts: 5, running: 6 },
    storage: { usedPct: 22.5 },
    internet: { reachable: true, latencyMs: Math.round(7 + Math.random() * 6) },
  };
}

/** A plausible ~15 min CPU/RAM history so the sparklines aren't empty on first paint in dev. */
function mockHistory(points = 30, stepMs = 30_000): ISubstrateMetricsSample[] {
  const now = Date.now();
  return Array.from({ length: points }, (_, i) => ({
    t: now - (points - 1 - i) * stepMs,
    cpu: round1(8 + Math.sin(i / 3) * 4 + Math.random() * 3),
    mem: round1(36 + Math.sin(i / 6) * 5 + Math.random() * 2),
  }));
}

export default defineNitroPlugin(() => {
  if (!import.meta.dev) return;
  // Seed mock data, but back off as soon as a real push arrives so a local publisher can take over.
  const seedIfStale = async () => {
    const latest = await readLatestMetrics();
    if (latest && Date.now() - latest.receivedAt < 100_000) return;
    await writeLatestMetrics(mockPayload());
  };
  // Pre-fill the rolling history once so sparklines render right away; real pushes append from there.
  const seedHistory = async () => {
    if ((await readHistory()).length >= 8) return;
    await setHistory(mockHistory());
  };
  void seedHistory();
  void seedIfStale();
  setInterval(() => void seedIfStale(), 20_000);
});
