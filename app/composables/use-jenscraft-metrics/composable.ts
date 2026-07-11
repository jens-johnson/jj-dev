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
 * █████████████████████████████████ #composables/use-jenscraft-metrics/composable.ts ██████████████████████████████████
 *
 * Live Jenscraft metrics for the service dashboard. A client-only fetch (the page is prerendered), a 30s poll, and a
 * computed `live` map keyed by the jenscraft.md tile keys. Pass `enabled = false` on other service pages so it stays
 * inert (no fetch). `live` is null until the publisher reports (offline).
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { IJenscraftMetricsView, TJenscraftMetricsState } from '~/types/jenscraft-metrics';

import type { IUseJenscraftMetricsReturn } from './types';
import { buildJenscraftLiveMetrics } from './utils';

/**
 * A composable providing live Jenscraft metrics for the service dashboard
 * @public
 * @function
 * @param enabled - Whether to fetch and poll; pass false on pages where the feed should stay inert
 * @returns The raw feed data, the freshness state, a computed live-values map, and refresh/status handles
 */
export function useJenscraftMetrics(enabled: boolean = true): IUseJenscraftMetricsReturn {
  /* ─── Setup ────────────────────────────────────────────────────────────────────────────────────────────────────── */

  // Fetch the feed client-side only; the service page is prerendered, so there is no useful server value
  const { data, refresh, status } = useFetch<IJenscraftMetricsView>('/api/services/jenscraft/metrics', {
    key: 'jenscraft-metrics',
    server: false,
    immediate: enabled,
  });

  /* ─── Lifecycle ────────────────────────────────────────────────────────────────────────────────────────────────── */

  // Poll every 30 seconds while the consuming page is mounted; scope disposal tears the interval down
  onMounted((): void => {
    if (!enabled) {
      return;
    }
    const poll: ReturnType<typeof setInterval> = setInterval((): void => {
      void refresh();
    }, 30_000);
    onScopeDispose((): void => clearInterval(poll));
  });

  /* ─── Computed ─────────────────────────────────────────────────────────────────────────────────────────────────── */

  /**
   * The feed freshness state; offline until the publisher reports
   * @internal
   * @constant
   */
  const state: ComputedRef<TJenscraftMetricsState> = computed(
    (): TJenscraftMetricsState => data.value?.state ?? 'offline',
  );

  /**
   * Live values keyed by the jenscraft.md tile keys; null until the publisher reports (offline). The mapping itself
   * is the pure core in ./utils, exercised directly by the unit tests
   * @internal
   * @constant
   */
  const live: ComputedRef<Record<string, string | number> | null> = computed(
    (): Record<string, string | number> | null => buildJenscraftLiveMetrics(data.value),
  );

  /* ─── Return ───────────────────────────────────────────────────────────────────────────────────────────────────── */

  return {
    data,
    state,
    live,
    refresh,
    status,
  };
}
