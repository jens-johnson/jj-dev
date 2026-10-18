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
 * ███████████████████████████████████ #utils/neighborhood-explorer/format/utils.ts ████████████████████████████████████
 *
 * Formats raw neighborhood feature values (dollars, shares, climate units, density) for display.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { TNeighborhoodFeatureFormat } from '#shared/neighborhood-explorer';
import { defineSymbol } from '#shared/utils/symbol';

/**
 * Formats a raw neighborhood feature value for display, by the feature's format
 * @public
 * @function
 * @param format - The feature's display format
 * @param value - The raw value, or null when the source had no estimate
 * @returns The display string; an em-width dash for missing values
 */
export function formatNeighborhoodValue(format: TNeighborhoodFeatureFormat, value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return '—';
  }

  switch (format) {
    case 'usd':
      if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(1)}M`;
      }
      return value >= 10_000 ? `$${Math.round(value / 1000)}k` : `$${Math.round(value).toLocaleString('en-US')}`;
    case 'percent':
      return `${Math.round(value * 100)}%`;
    case 'number':
      return value.toFixed(1);
    case 'year':
      return String(Math.round(value));
    case 'temperature':
      return `${Math.round(value)}°F`;
    case 'inches':
      return `${value < 1 ? value.toFixed(1) : Math.round(value)} in`;
    case 'days':
      return `${Math.round(value)} days`;
    case 'density':
      return `${(Math.round(value / 100) * 100).toLocaleString('en-US')} / sq mi`;
    case 'count':
      return String(Math.round(value));
  }
}

/* ─── Metadata ───────────────────────────────────────────────────────────────────────────────────────────────────── */

// Register a readable name/description so the unit suites can title their describe blocks from the source symbol
defineSymbol(formatNeighborhoodValue, {
  name: 'Format Neighborhood Value',
  description: 'Formats a raw neighborhood feature value for display.',
});
