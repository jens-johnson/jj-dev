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
 * █████████████████████████████████████████ #types/substrate-metrics/types.ts █████████████████████████████████████████
 *
 * Client-side shape of the `/api/substrate/metrics` response, consumed by the useSubstrateMetrics composable and the
 * live widgets. Mirrors the server public read shape (kept here so app code does not import server-only utils).
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * A type representing the freshness state of the substrate metrics feed
 * @typedef
 */
export type TSubstrateMetricsState = 'live' | 'stale' | 'offline';

/**
 * A type representing the rolled-up fleet health: freshness (offline/stale) blended with threshold checks
 * (healthy/degraded)
 * @typedef
 */
export type TSubstrateHealth = 'healthy' | 'degraded' | 'stale' | 'offline';

/**
 * An interface representing the live compute-node sample in the metrics feed
 * @interface
 */
export interface ISubstrateMetricsNode {
  /* The node uptime in seconds */
  uptimeSec: number;

  /* The current CPU utilisation percentage */
  cpuPct: number;

  /* The 1/5/15-minute load averages */
  loadAvg: [number, number, number];

  /* The memory usage: used percentage and total capacity in GiB */
  mem: { usedPct: number; totalGiB: number };

  /* The optional swap usage percentage */
  swap?: { usedPct: number };
}

/**
 * An interface representing the live internet edge: reachability plus a measured round-trip; throughput is a static
 * benchmark, not in the feed
 * @interface
 */
export interface ISubstrateInternet {
  /* Whether the internet edge is currently reachable */
  reachable: boolean;

  /* The measured round-trip latency in milliseconds */
  latencyMs?: number;
}

/**
 * An interface representing one compact point in the rolling history, kept just for the sparklines (percentages plus a
 * timestamp)
 * @interface
 */
export interface ISubstrateMetricsSample {
  /* The sample timestamp (epoch milliseconds) */
  t: number;

  /* The CPU utilisation percentage at the sample time */
  cpu: number;

  /* The memory utilisation percentage at the sample time */
  mem: number;
}

/**
 * An interface representing the client-facing view of the substrate metrics feed
 * @interface
 */
export interface ISubstrateMetricsView {
  /* The freshness state of the feed */
  state: TSubstrateMetricsState;

  /* The age of the latest sample in seconds, or null when no sample has arrived */
  ageSec: number | null;

  /* The ISO timestamp of the latest sample, or null when none */
  ts: string | null;

  /* The latest compute-node sample, or null when none */
  node: ISubstrateMetricsNode | null;

  /* The guest counts; the wire field stays "guests" (VMs + containers) but surfaces to users as "Services" */
  guests: { vms: number; cts: number; running: number } | null;

  /* The storage usage percentage, or null when none */
  storage: { usedPct: number } | null;

  /* The internet-edge sample, or null when none */
  internet: ISubstrateInternet | null;

  /* The rolling sample history backing the sparklines */
  history: ISubstrateMetricsSample[];
}
