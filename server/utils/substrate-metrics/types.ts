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
 * █████████████████████████████████████ #server/utils/substrate-metrics/types.ts ██████████████████████████████████████
 *
 * Type definitions for the substrate live-metrics server payload, storage record, and feed state.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { SubstrateMetricsState } from './enums';

/**
 * An interface representing the compute-node memory sample; utilisation percentage plus total capacity
 * @public
 * @interface
 */
export interface ISubstrateMemory {
  /* The memory utilisation percentage */
  usedPct: number;

  /* The total memory capacity in GiB */
  totalGiB: number;
}

/**
 * An interface representing the compute-node swap sample; utilisation percentage only
 * @public
 * @interface
 */
export interface ISubstrateSwap {
  /* The swap utilisation percentage */
  usedPct: number;
}

/**
 * An interface representing the compute-node sample; uptime, CPU, load average, memory, and optional swap
 * @public
 * @interface
 */
export interface ISubstrateComputeNode {
  /* The node uptime in seconds */
  uptimeSec: number;

  /* The CPU utilisation percentage */
  cpuPct: number;

  /* The 1/5/15-minute load average tuple */
  loadAvg: [number, number, number];

  /* The memory sample */
  mem: ISubstrateMemory;

  /* The swap sample; absent when the node reports no swap */
  swap?: ISubstrateSwap;
}

/**
 * An interface representing the guest counts (VMs + containers) and how many are running
 * @public
 * @interface
 */
export interface ISubstrateGuests {
  /* The number of virtual machines */
  vms: number;

  /* The number of containers */
  cts: number;

  /* The number of running guests */
  running: number;
}

/**
 * An interface representing the storage usage sample; utilisation percentage only
 * @public
 * @interface
 */
export interface ISubstrateStorage {
  /* The storage utilisation percentage */
  usedPct: number;
}

/**
 * An interface representing the internet-edge sample; reachability plus optional latency
 * @public
 * @interface
 */
export interface ISubstrateInternet {
  /* Whether the internet edge is reachable */
  reachable: boolean;

  /* The edge round-trip latency in milliseconds; absent when unreachable or unmeasured */
  latencyMs?: number;
}

/**
 * An interface representing the validated, public-safe payload the lab publisher POSTs; counts and percentages only,
 * never identifiers
 * @public
 * @interface
 */
export interface ISubstrateMetricsPayload {
  /* The payload schema version */
  v: number;

  /* The publisher-side timestamp (ISO string) */
  ts: string;

  /* The compute-node sample */
  node: ISubstrateComputeNode;

  /* The guest counts (VMs + containers) */
  guests: ISubstrateGuests;

  /* The storage usage percentage */
  storage?: ISubstrateStorage;

  /* The internet-edge reachability + latency */
  internet?: ISubstrateInternet;
}

/**
 * An interface representing the stored record, adding the server receive time (the source of truth for staleness)
 * @public
 * @interface
 */
export interface IStoredSubstrateMetrics extends ISubstrateMetricsPayload {
  /* The server receive time (epoch milliseconds) */
  receivedAt: number;
}

/**
 * An interface representing one compact rolling-history point, kept just for the sparklines
 * @public
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
 * A type representing the freshness state of the substrate metrics feed; one of {@link SubstrateMetricsState}
 * @public
 */
export type TSubstrateMetricsState = `${SubstrateMetricsState}`;

/**
 * An interface representing the public metrics response: the last-known payload fields plus the derived freshness
 * state, age, and the rolling sparkline history; the payload fields are null until a push has been stored
 * @public
 * @interface
 */
export interface ISubstrateMetricsResponse {
  /* The derived freshness state of the feed */
  state: TSubstrateMetricsState;

  /* The payload age in seconds; null when no payload has been stored */
  ageSec: number | null;

  /* The publisher-side timestamp (ISO string); null when no payload has been stored */
  ts: string | null;

  /* The compute-node sample; null when no payload has been stored */
  node: ISubstrateMetricsPayload['node'] | null;

  /* The guest counts; null when no payload has been stored */
  guests: ISubstrateMetricsPayload['guests'] | null;

  /* The storage usage percentage; null when absent */
  storage: NonNullable<ISubstrateMetricsPayload['storage']> | null;

  /* The internet-edge reachability + latency; null when absent */
  internet: NonNullable<ISubstrateMetricsPayload['internet']> | null;

  /* The rolling CPU/memory history for the sparklines (empty when none) */
  history: ISubstrateMetricsSample[];
}
