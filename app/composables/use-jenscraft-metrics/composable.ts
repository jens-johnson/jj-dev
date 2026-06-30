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

/**
 * A composable providing live Jenscraft metrics for the service dashboard
 * @param enabled - Whether to fetch and poll; pass false on pages where the feed should stay inert
 * @returns The raw feed data, the freshness state, a computed live-values map, and refresh/status handles
 */
export function useJenscraftMetrics(enabled = true) {
  const { data, refresh, status } = useFetch<IJenscraftMetricsView>('/api/services/jenscraft/metrics', {
    key: 'jenscraft-metrics',
    // Live data: the service page is prerendered, so there is no useful server value; fetch fresh on the client.
    server: false,
    immediate: enabled,
  });

  onMounted(() => {
    if (!enabled) return;
    const poll = setInterval(() => refresh(), 30_000);
    onScopeDispose(() => clearInterval(poll));
  });

  const state = computed<TJenscraftMetricsState>(() => data.value?.state ?? 'offline');

  // Live values keyed by the jenscraft.md tile keys; null until the publisher reports (offline).
  const live = computed<Record<string, string | number> | null>(() => {
    const d = data.value;
    if (!d || d.state === 'offline') return null;
    const out: Record<string, string | number> = {};
    if (d.players) out.players = `${d.players.online} / ${d.players.max}`;
    if (d.tps !== null) out.tps = d.tps;
    if (d.mspt !== null) out.mspt = d.mspt;
    if (d.uptimeSec !== null) out.uptime = formatUptime(d.uptimeSec);
    if (d.world) out.explored = d.world.exploredPct;
    if (d.mobs) out.mobs = d.mobs.defeated.toLocaleString();
    return Object.keys(out).length ? out : null;
  });

  return { data, state, live, refresh, status };
}
