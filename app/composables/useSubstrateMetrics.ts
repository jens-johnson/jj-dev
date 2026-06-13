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
 * ████████████████████████████████████████████ #composables/useSubstrateMetrics.ts ████████████████████████████████████
 *
 * Shared live-metrics state for the Substrate widgets. One keyed fetch of /api/substrate/metrics, a 30s client poll,
 * and a 1s ticker that ages the "updated Ns ago" label between polls. Also exports small presentation helpers.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { SubstrateHealth, SubstrateMetricsState, SubstrateMetricsView } from '~/types/substrate-metrics';

interface StateVisual {
  label: string;
  dot: string;
  text: string;
  pulse: boolean;
}

/** Per-state visual treatment (Tailwind classes), shared by the banner / card / inspector. */
export const METRIC_STATE: Record<SubstrateMetricsState, StateVisual> = {
  live: { label: 'Live', dot: 'bg-accent-secondary', text: 'text-accent-secondary', pulse: true },
  stale: { label: 'Stale', dot: 'bg-terra-400', text: 'text-terra-400', pulse: false },
  offline: { label: 'Offline', dot: 'bg-ink-subtle', text: 'text-ink-subtle', pulse: false },
};

/** Visual treatment for the rolled-up fleet health, used by the aggregate status bar. */
export const METRIC_HEALTH: Record<SubstrateHealth, StateVisual> = {
  healthy: { label: 'Healthy', dot: 'bg-accent-secondary', text: 'text-accent-secondary', pulse: true },
  degraded: { label: 'Degraded', dot: 'bg-terra-400', text: 'text-terra-400', pulse: true },
  stale: { label: 'Stale', dot: 'bg-terra-400', text: 'text-terra-400', pulse: false },
  offline: { label: 'Offline', dot: 'bg-ink-subtle', text: 'text-ink-subtle', pulse: false },
};

/** A node is "hot" (degraded) when any pressure gauge crosses its threshold. */
const HOT_PCT = 92;

/** Seconds to a compact human uptime, e.g. "9d 14h". */
export function formatUptime(sec: number): string {
  const d = Math.floor(sec / 86_400);
  const h = Math.floor((sec % 86_400) / 3_600);
  const m = Math.floor((sec % 3_600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function useSubstrateMetrics() {
  const { data, refresh, status } = useFetch<SubstrateMetricsView>('/api/substrate/metrics', {
    key: 'substrate-metrics',
    // Live data: always fetch fresh on the client. The page is prerendered to static HTML, so there is no useful
    // server value to bake in — fetching client-side keeps the metrics current without a stale snapshot in the markup.
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

  const state = computed<SubstrateMetricsState>(() => data.value?.state ?? 'offline');

  const internet = computed(() => data.value?.internet ?? null);
  const history = computed(() => data.value?.history ?? []);
  const cpuSeries = computed(() => history.value.map((h) => h.cpu));
  const memSeries = computed(() => history.value.map((h) => h.mem));

  /** Count of nodes actively reporting telemetry (one hypervisor today; generalises as more nodes push). */
  const reportingCount = computed(() => (state.value !== 'offline' && data.value?.node ? 1 : 0));

  /** Rolled-up health: freshness first, then threshold pressure on the live node. */
  const health = computed<SubstrateHealth>(() => {
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

  /** Server age plus client seconds since the last fetch. */
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
