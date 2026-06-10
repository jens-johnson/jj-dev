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
 * █████████████████████████████████████████████ #types/substrate-metrics.ts ███████████████████████████████████████████
 *
 * Client-side shape of the `/api/substrate/metrics` response, consumed by the useSubstrateMetrics composable and the
 * live widgets. Mirrors the server's public read shape (kept here so app code doesn't import server-only utils).
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

export type SubstrateMetricsState = 'live' | 'stale' | 'offline';

export interface SubstrateMetricsNode {
  uptimeSec: number;
  cpuPct: number;
  loadAvg: [number, number, number];
  mem: { usedPct: number; totalGiB: number };
  swap?: { usedPct: number };
}

export interface SubstrateMetricsView {
  state: SubstrateMetricsState;
  ageSec: number | null;
  ts: string | null;
  node: SubstrateMetricsNode | null;
  guests: { vms: number; cts: number; running: number } | null;
  storage: { usedPct: number } | null;
}
