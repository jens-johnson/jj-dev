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
 * ████████████████████████████████████ #composables/use-jenscraft-metrics/utils.ts ████████████████████████████████████
 *
 * Pure core for the jenscraft-metrics composable: maps a raw feed view onto the jenscraft.md tile keys.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { IJenscraftMetricsView } from '~/types/jenscraft-metrics';

import { formatUptime } from '../use-substrate-metrics/utils';

/**
 * Builds the live tile-value map from a metrics feed view, keyed by the jenscraft.md tile keys. A pure core: the
 * composable wraps this in a computed, and tests exercise it directly
 * @public
 * @function
 * @param view - The raw feed view, or null/undefined before the first fetch resolves
 * @returns The live values keyed by tile key, or null when the feed is offline or has nothing to report
 */
export function buildJenscraftLiveMetrics(
  view: IJenscraftMetricsView | null | undefined,
): Record<string, string | number> | null {
  // An absent or offline feed surfaces as null so tiles fall back to their static frontmatter values
  if (!view || view.state === 'offline') {
    return null;
  }

  // Map each reported metric onto its tile key, formatting the human-facing values
  const live: Record<string, string | number> = {};
  if (view.players) {
    live.players = `${view.players.online} / ${view.players.max}`;
  }
  if (view.tps !== null) {
    live.tps = view.tps;
  }
  if (view.mspt !== null) {
    live.mspt = view.mspt;
  }
  if (view.uptimeSec !== null) {
    live.uptime = formatUptime(view.uptimeSec);
  }
  if (view.world) {
    live.explored = view.world.exploredPct;
  }
  if (view.mobs) {
    live.mobs = view.mobs.defeated.toLocaleString();
  }

  // A reporting feed with no recognized metrics still reads as offline for the tiles
  return Object.keys(live).length ? live : null;
}
