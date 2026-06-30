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
 * ██████████████████████████████████████ server/utils/substrate-metrics/types.ts ██████████████████████████████████████
 *
 * Type definitions for the substrate live-metrics server payload, storage record, and feed state.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An interface representing the validated, public-safe payload the lab publisher POSTs; counts and percentages only,
 * never identifiers
 * @interface
 */
export interface ISubstrateMetricsPayload {
  /* The payload schema version */
  v: number;

  /* The publisher-side timestamp (ISO string) */
  ts: string;

  /* The compute-node sample */
  node: {
    uptimeSec: number;
    cpuPct: number;
    loadAvg: [number, number, number];
    mem: { usedPct: number; totalGiB: number };
    swap?: { usedPct: number };
  };

  /* The guest counts (VMs + containers) */
  guests: { vms: number; cts: number; running: number };

  /* The storage usage percentage */
  storage?: { usedPct: number };

  /* The internet-edge reachability + latency */
  internet?: { reachable: boolean; latencyMs?: number };
}

/**
 * An interface representing the stored record, adding the server receive time (the source of truth for staleness)
 * @interface
 */
export interface IStoredSubstrateMetrics extends ISubstrateMetricsPayload {
  /* The server receive time (epoch milliseconds) */
  receivedAt: number;
}

/**
 * An interface representing one compact rolling-history point, kept just for the sparklines
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
 * A type representing the freshness state of the substrate metrics feed
 * @typedef
 */
export type TSubstrateMetricsState = 'live' | 'stale' | 'offline';
