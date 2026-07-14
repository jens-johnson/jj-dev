/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                 ██        ██                     ▄▄
 *                                 ▀▀        ▀▀                     ██
 *                               ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                 ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                 ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                 ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                 ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                              ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * ████████████████████████████████████ #composables/use-jenscraft-metrics/types.ts ████████████████████████████████████
 *
 * Type definitions for the jenscraft-metrics composable: the typed return surface.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { AsyncDataRequestStatus } from '#app';
import type { IJenscraftMetricsView, TJenscraftMetricsState } from '~/types/jenscraft-metrics';

/**
 * An interface representing the return value from the `useJenscraftMetrics` composable
 * @public
 * @interface
 */
export interface IUseJenscraftMetricsReturn {
  /* The raw metrics feed from the api route; undefined until the first client fetch resolves */
  readonly data: Ref<IJenscraftMetricsView | undefined>;

  /* The feed freshness state; offline until the publisher reports */
  readonly state: ComputedRef<TJenscraftMetricsState>;

  /* Live tile values keyed by the jenscraft.md tile keys; null while the feed is offline */
  readonly live: ComputedRef<Record<string, string | number> | null>;

  /* Re-fetches the feed on demand */
  readonly refresh: () => Promise<void>;

  /* The fetch status handle from useFetch */
  readonly status: Ref<AsyncDataRequestStatus>;
}
