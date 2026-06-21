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
 * ████████████████████████████████████████████ #types/jenscraft-metrics.ts ████████████████████████████████████████████
 *
 * Client-side shape of the `/api/services/jenscraft/metrics` response, consumed by the Jenscraft service dashboard.
 * Mirrors the server's public read shape (kept here so app code doesn't import server-only utils).
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

export type JenscraftMetricsState = 'live' | 'stale' | 'offline';

export interface JenscraftPlayers {
  online: number;
  max: number;
  java: number;
  bedrock: number;
}

export interface JenscraftMetricsView {
  state: JenscraftMetricsState;
  ageSec: number | null;
  ts: string | null;
  players: JenscraftPlayers | null;
  tps: number | null;
  mspt: number | null;
  uptimeSec: number | null;
  world: { exploredPct: number } | null;
  mobs: { defeated: number } | null;
}
