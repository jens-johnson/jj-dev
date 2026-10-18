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
 * █████████████████████████████████ #utils/neighborhood-explorer/format/utils.test.ts █████████████████████████████████
 *
 * Unit tests for the neighborhood explorer value formatter.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { getTestFileName } from '@jens-johnson/style-guide/test-utils';
import { describe, expect, it } from 'vitest';

import { symbolName } from '#shared/utils/symbol';

import { formatNeighborhoodValue } from './utils';

/* ─── Tests ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

describe(getTestFileName(import.meta.url), (): void => {
  describe(symbolName(formatNeighborhoodValue), (): void => {
    it('abbreviates dollars by magnitude', (): void => {
      expect(formatNeighborhoodValue('usd', 1850)).toBe('$1,850');
      expect(formatNeighborhoodValue('usd', 98_400)).toBe('$98k');
      expect(formatNeighborhoodValue('usd', 1_250_000)).toBe('$1.3M');
    });

    it('formats shares, years, and plain numbers', (): void => {
      expect(formatNeighborhoodValue('percent', 0.426)).toBe('43%');
      expect(formatNeighborhoodValue('year', 1972.4)).toBe('1972');
      expect(formatNeighborhoodValue('number', 2.468)).toBe('2.5');
      expect(formatNeighborhoodValue('count', 11.6)).toBe('12');
    });

    it('formats climate units', (): void => {
      expect(formatNeighborhoodValue('temperature', 64.6)).toBe('65°F');
      expect(formatNeighborhoodValue('inches', 0.42)).toBe('0.4 in');
      expect(formatNeighborhoodValue('inches', 56.5)).toBe('57 in');
      expect(formatNeighborhoodValue('days', 3.5)).toBe('4 days');
    });

    it('rounds density to the nearest hundred', (): void => {
      expect(formatNeighborhoodValue('density', 12_345)).toBe('12,300 / sq mi');
    });

    it('renders missing values as a dash', (): void => {
      expect(formatNeighborhoodValue('usd', null)).toBe('—');
      expect(formatNeighborhoodValue('percent', Number.NaN)).toBe('—');
    });
  });
});
