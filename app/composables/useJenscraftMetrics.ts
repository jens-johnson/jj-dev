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
 * ████████████████████████████████████████ #composables/useJenscraftMetrics.ts ████████████████████████████████████████
 *
 * Live-metrics state for the Jenscraft service dashboard. One keyed, client-only fetch of the public read route plus a
 * 30s poll, mapped to the frontmatter tile keys (players/tps/mspt/uptime/explored/mobs) so it drops straight into the
 * generic service-metrics widget. Mirrors useSubstrateMetrics; uptime formatting is reused from it.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { JenscraftMetricsState, JenscraftMetricsView } from '~/types/jenscraft-metrics';

/**
 * Live Jenscraft metrics for the service dashboard. Client-only fetch (the page is prerendered), a 30s poll, and a
 * computed `live` map keyed by the jenscraft.md tile keys. Pass `enabled = false` on other service pages so it stays
 * inert (no fetch). `live` is null until the publisher reports (offline).
 */
export function useJenscraftMetrics(enabled = true) {
  const { data, refresh, status } = useFetch<JenscraftMetricsView>('/api/services/jenscraft/metrics', {
    key: 'jenscraft-metrics',
    // Live data: the service page is prerendered, so there's no useful server value — fetch fresh on the client.
    server: false,
    immediate: enabled,
  });

  onMounted(() => {
    if (!enabled) return;
    const poll = setInterval(() => refresh(), 30_000);
    onScopeDispose(() => clearInterval(poll));
  });

  const state = computed<JenscraftMetricsState>(() => data.value?.state ?? 'offline');

  /** Live values keyed by the jenscraft.md tile keys; null until the publisher reports (offline). */
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
