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

/** Rolled-up fleet health: freshness (offline/stale) blended with threshold checks (healthy/degraded). */
export type SubstrateHealth = 'healthy' | 'degraded' | 'stale' | 'offline';

export interface SubstrateMetricsNode {
  uptimeSec: number;
  cpuPct: number;
  loadAvg: [number, number, number];
  mem: { usedPct: number; totalGiB: number };
  swap?: { usedPct: number };
}

/** Live internet edge: reachability + a measured round-trip. Throughput is a static benchmark, not in the feed. */
export interface SubstrateInternet {
  reachable: boolean;
  latencyMs?: number;
}

/** One compact point in the rolling history, kept just for the sparklines (percentages + a timestamp). */
export interface SubstrateMetricsSample {
  t: number;
  cpu: number;
  mem: number;
}

export interface SubstrateMetricsView {
  state: SubstrateMetricsState;
  ageSec: number | null;
  ts: string | null;
  node: SubstrateMetricsNode | null;
  // Wire field stays `guests` (VMs + containers); surfaced to users as "Services".
  guests: { vms: number; cts: number; running: number } | null;
  storage: { usedPct: number } | null;
  internet: SubstrateInternet | null;
  history: SubstrateMetricsSample[];
}
