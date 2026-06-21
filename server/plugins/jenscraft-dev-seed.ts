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

import type { JenscraftMetricsPayload } from '../utils/jenscraft-metrics';

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

function mockPayload(): JenscraftMetricsPayload {
  const online = Math.floor(Math.random() * 6); // 0–5 players
  const bedrock = online === 0 ? 0 : Math.round(Math.random() * Math.min(2, online));
  return {
    v: 1,
    ts: new Date().toISOString(),
    players: { online, max: 20, java: online - bedrock, bedrock },
    tps: round2(19.6 + Math.random() * 0.4),
    mspt: round2(2.4 + Math.random() * 3),
    uptimeSec: 3 * 86_400 + Math.floor((Date.now() / 1000) % 86_400),
    world: { exploredPct: round1(37 + Math.random() * 1.5) },
    mobs: { defeated: 12_840 + Math.floor((Date.now() / 1000) % 600) },
  };
}

export default defineNitroPlugin(() => {
  if (!import.meta.dev) return;
  // Seed mock data, but back off as soon as a real push arrives so a local publisher can take over.
  const seedIfStale = async () => {
    const latest = await readLatestJenscraftMetrics();
    if (latest && Date.now() - latest.receivedAt < 100_000) return;
    await writeLatestJenscraftMetrics(mockPayload());
  };
  void seedIfStale();
  setInterval(() => void seedIfStale(), 20_000);
});
