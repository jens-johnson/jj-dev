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
 * ████████████████████████████████████ #composables/use-substrate-metrics/types.ts ████████████████████████████████████
 *
 * Type definitions for the substrate live-metrics composable: the per-state visual shape and the typed return surface.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { AsyncDataRequestStatus } from '#app';
import type {
  ISubstrateInternet,
  ISubstrateMetricsSample,
  ISubstrateMetricsView,
  TSubstrateHealth,
  TSubstrateMetricsState,
} from '~/types/substrate-metrics';

/**
 * An interface representing a per-state visual treatment (Tailwind class bundle) for the metrics UI
 * @interface
 */
export interface IStateVisual {
  /* The human-readable state label */
  label: string;

  /* The Tailwind background class for the status dot */
  dot: string;

  /* The Tailwind text-color class */
  text: string;

  /* Whether the dot should pulse */
  pulse: boolean;
}

/**
 * An interface representing the return value from the `useSubstrateMetrics` composable
 * @public
 * @interface
 */
export interface IUseSubstrateMetricsReturn {
  /* The raw metrics feed from the api route; undefined until the first client fetch resolves */
  readonly data: Ref<ISubstrateMetricsView | undefined>;

  /* The feed freshness state; offline until the publisher reports */
  readonly state: ComputedRef<TSubstrateMetricsState>;

  /* The rolled-up fleet health: freshness first, then threshold pressure on the live node */
  readonly health: ComputedRef<TSubstrateHealth>;

  /* The internet-edge sample; null until the feed reports one */
  readonly internet: ComputedRef<ISubstrateInternet | null>;

  /* The rolling sample history backing the sparklines */
  readonly history: ComputedRef<ISubstrateMetricsSample[]>;

  /* The CPU utilisation series extracted from the history */
  readonly cpuSeries: ComputedRef<number[]>;

  /* The memory utilisation series extracted from the history */
  readonly memSeries: ComputedRef<number[]>;

  /* The count of nodes actively reporting telemetry */
  readonly reportingCount: ComputedRef<number>;

  /* The sample age in seconds (server age plus client seconds since the last fetch); null until a sample arrives */
  readonly ageSec: ComputedRef<number | null>;

  /* The human-facing "updated Ns ago" label; null until a sample arrives */
  readonly updatedLabel: ComputedRef<string | null>;

  /* Re-fetches the feed on demand */
  readonly refresh: () => Promise<void>;

  /* The fetch status handle from useFetch */
  readonly status: Ref<AsyncDataRequestStatus>;
}
