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

import type { ISubstrateMetricsView, TSubstrateHealth, TSubstrateMetricsState } from '~/types/substrate-metrics';

// A node is "hot" (degraded) when any pressure gauge crosses its threshold.
const HOT_PCT = 92;

/**
 * A composable providing live substrate fleet metrics for the lab dashboard
 * @returns The raw feed data plus computed state, health, history series, freshness label, and refresh handles
 */
export function useSubstrateMetrics() {
  const { data, refresh, status } = useFetch<ISubstrateMetricsView>('/api/substrate/metrics', {
    key: 'substrate-metrics',
    // Live data: always fetch fresh on the client. The page is prerendered to static HTML, so there is no useful
    // server value to bake in; fetching client-side keeps the metrics current without a stale snapshot in the markup.
    server: false,
  });

  // Client-side clock so the "updated Ns ago" label keeps counting between 30s polls.
  const now = ref(Date.now());
  const fetchedAt = ref(Date.now());
  watch(data, () => {
    fetchedAt.value = Date.now();
  });

  onMounted(() => {
    const poll = setInterval(() => refresh(), 30_000);
    const ticker = setInterval(() => {
      now.value = Date.now();
    }, 1_000);
    onScopeDispose(() => {
      clearInterval(poll);
      clearInterval(ticker);
    });
  });

  const state = computed<TSubstrateMetricsState>(() => data.value?.state ?? 'offline');

  const internet = computed(() => data.value?.internet ?? null);
  const history = computed(() => data.value?.history ?? []);
  const cpuSeries = computed(() => history.value.map((h) => h.cpu));
  const memSeries = computed(() => history.value.map((h) => h.mem));

  // Count of nodes actively reporting telemetry (one hypervisor today; generalises as more nodes push).
  const reportingCount = computed(() => (state.value !== 'offline' && data.value?.node ? 1 : 0));

  // Rolled-up health: freshness first, then threshold pressure on the live node.
  const health = computed<TSubstrateHealth>(() => {
    if (state.value === 'offline') return 'offline';
    if (state.value === 'stale') return 'stale';
    const n = data.value?.node;
    if (!n) return 'stale';
    const hot =
      n.cpuPct >= HOT_PCT ||
      n.mem.usedPct >= HOT_PCT ||
      (data.value?.storage?.usedPct ?? 0) >= HOT_PCT ||
      (n.swap?.usedPct ?? 0) >= 50;
    return hot ? 'degraded' : 'healthy';
  });

  // Server age plus client seconds since the last fetch.
  const ageSec = computed<number | null>(() => {
    const base = data.value?.ageSec ?? null;
    if (base === null) return null;
    return base + Math.max(0, Math.floor((now.value - fetchedAt.value) / 1_000));
  });

  const updatedLabel = computed<string | null>(() => {
    const a = ageSec.value;
    if (a === null) return null;
    if (a < 5) return 'just now';
    if (a < 60) return `${a}s ago`;
    if (a < 3_600) return `${Math.floor(a / 60)}m ago`;
    return `${Math.floor(a / 3_600)}h ago`;
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
