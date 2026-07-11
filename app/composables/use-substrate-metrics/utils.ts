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
 * ████████████████████████████████████ #composables/use-substrate-metrics/utils.ts ████████████████████████████████████
 *
 * Formatting helpers for the substrate live-metrics composable.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { defineSymbol } from '#shared/utils/symbol';

/**
 * Formats a duration in seconds to a compact human uptime, e.g. "9d 14h"
 * @param sec - The duration in seconds
 * @returns The compact uptime label
 */
export function formatUptime(sec: number): string {
  const days: number = Math.floor(sec / 86_400);
  const hours: number = Math.floor((sec % 86_400) / 3_600);
  const minutes: number = Math.floor((sec % 3_600) / 60);
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/* ─── Metadata ───────────────────────────────────────────────────────────────────────────────────────────────────── */

// Register a readable name/description so the unit suites can title their describe blocks from the source symbol
defineSymbol(formatUptime, {
  name: 'Format Uptime',
  description: 'Formats a duration in seconds into a compact human uptime label.',
});
