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
 * █████████████████████████████████ #composables/use-substrate-metrics/composable.ts ██████████████████████████████████
 *
 * Live substrate fleet metrics for the lab dashboard. A client-only fetch (the page is prerendered), a 30s poll, a
 * client clock for the "updated Ns ago" label, and a rolled-up health computed from freshness plus threshold pressure
 * on the live node.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type {
  ISubstrateInternet,
  ISubstrateMetricsNode,
  ISubstrateMetricsSample,
  ISubstrateMetricsView,
  TSubstrateHealth,
  TSubstrateMetricsState,
} from '~/types/substrate-metrics';

import type { IUseSubstrateMetricsReturn } from './types';

// A node is "hot" (degraded) when a pressure gauge crosses its threshold; swap tolerates more before it counts.
const HOT_PCT: number = 92;
const SWAP_HOT_PCT: number = 50;

/**
 * A composable providing live substrate fleet metrics for the lab dashboard
 * @public
 * @function
 * @returns The raw feed data plus computed state, health, history series, freshness label, and refresh handles
 */
export function useSubstrateMetrics(): IUseSubstrateMetricsReturn {
  // Fetch the feed client-side only; the page is prerendered to static HTML, so there is no useful server value to
  // bake in, and fetching on the client keeps the metrics current without a stale snapshot in the markup
  const { data, refresh, status } = useFetch<ISubstrateMetricsView>('/api/substrate/metrics', {
    key: 'substrate-metrics',
    server: false,
  });

  /**
   * The client-side clock so the "updated Ns ago" label keeps counting between 30s polls
   * @internal
   * @constant
   */
  const now: Ref<number> = ref(Date.now());

  /**
   * The client timestamp of the last resolved fetch; the label's baseline
   * @internal
   * @constant
   */
  const fetchedAt: Ref<number> = ref(Date.now());

  // Re-stamp the fetch baseline whenever fresh feed data lands
  watch(data, (): void => {
    fetchedAt.value = Date.now();
  });

  // Poll every 30 seconds and tick the clock every second while the consuming page is mounted; scope disposal tears
  // both intervals down
  onMounted((): void => {
    const poll: ReturnType<typeof setInterval> = setInterval((): void => {
      void refresh();
    }, 30_000);
    const ticker: ReturnType<typeof setInterval> = setInterval((): void => {
      now.value = Date.now();
    }, 1_000);
    onScopeDispose((): void => {
      clearInterval(poll);
      clearInterval(ticker);
    });
  });

  /**
   * The feed freshness state; offline until the publisher reports
   * @internal
   * @constant
   */
  const state: ComputedRef<TSubstrateMetricsState> = computed(
    (): TSubstrateMetricsState => data.value?.state ?? 'offline',
  );

  /**
   * The internet-edge sample; null until the feed reports one
   * @internal
   * @constant
   */
  const internet: ComputedRef<ISubstrateInternet | null> = computed(
    (): ISubstrateInternet | null => data.value?.internet ?? null,
  );

  /**
   * The rolling sample history backing the sparklines
   * @internal
   * @constant
   */
  const history: ComputedRef<ISubstrateMetricsSample[]> = computed(
    (): ISubstrateMetricsSample[] => data.value?.history ?? [],
  );

  /**
   * The CPU utilization series extracted from the history
   * @internal
   * @constant
   */
  const cpuSeries: ComputedRef<number[]> = computed((): number[] =>
    history.value.map((sample: ISubstrateMetricsSample): number => sample.cpu),
  );

  /**
   * The memory utilization series extracted from the history
   * @internal
   * @constant
   */
  const memSeries: ComputedRef<number[]> = computed((): number[] =>
    history.value.map((sample: ISubstrateMetricsSample): number => sample.mem),
  );

  /**
   * The count of nodes actively reporting telemetry (one hypervisor today; generalises as more nodes push)
   * @internal
   * @constant
   */
  const reportingCount: ComputedRef<number> = computed((): number =>
    state.value !== 'offline' && data.value?.node ? 1 : 0,
  );

  /**
   * The rolled-up health: freshness first, then threshold pressure on the live node
   * @internal
   * @constant
   */
  const health: ComputedRef<TSubstrateHealth> = computed((): TSubstrateHealth => {
    // Freshness short-circuits: an offline or stale feed rolls up as-is
    if (state.value === 'offline') {
      return 'offline';
    }
    if (state.value === 'stale') {
      return 'stale';
    }

    // A live feed without a node sample still reads as stale
    const node: ISubstrateMetricsNode | null | undefined = data.value?.node;
    if (!node) {
      return 'stale';
    }

    // Any pressure gauge crossing its threshold marks the fleet degraded
    const hot: boolean =
      node.cpuPct >= HOT_PCT ||
      node.mem.usedPct >= HOT_PCT ||
      (data.value?.storage?.usedPct ?? 0) >= HOT_PCT ||
      (node.swap?.usedPct ?? 0) >= SWAP_HOT_PCT;
    return hot ? 'degraded' : 'healthy';
  });

  /**
   * The sample age in seconds: the server-reported age plus the client seconds since the last fetch
   * @internal
   * @constant
   */
  const ageSec: ComputedRef<number | null> = computed((): number | null => {
    // The server-reported age; null until a sample has arrived
    const base: number | null = data.value?.ageSec ?? null;
    if (base === null) {
      return null;
    }

    // Add the client seconds elapsed since the last fetch so the age keeps counting between polls
    return base + Math.max(0, Math.floor((now.value - fetchedAt.value) / 1_000));
  });

  /**
   * The human-facing "updated Ns ago" label; null until a sample has arrived
   * @internal
   * @constant
   */
  const updatedLabel: ComputedRef<string | null> = computed((): string | null => {
    // No age yet means nothing to label
    const age: number | null = ageSec.value;
    if (age === null) {
      return null;
    }

    // Bucket the age into the friendliest unit
    if (age < 5) {
      return 'just now';
    }
    if (age < 60) {
      return `${age}s ago`;
    }
    if (age < 3_600) {
      return `${Math.floor(age / 60)}m ago`;
    }
    return `${Math.floor(age / 3_600)}h ago`;
  });

  return {
    data,
    state,
    health,
    internet,
    history,
    cpuSeries,
    memSeries,
    reportingCount,
    ageSec,
    updatedLabel,
    refresh,
    status,
  };
}
