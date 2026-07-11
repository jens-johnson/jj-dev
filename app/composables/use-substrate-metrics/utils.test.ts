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
 * █████████████████████████████████ #composables/use-substrate-metrics/utils.test.ts ██████████████████████████████████
 *
 * Unit tests for the substrate-metrics pure core: the compact human uptime formatter across the day, hour, and minute
 * buckets.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { describe, expect, it } from 'vitest';

import { formatUptime } from './utils';

describe('formatUptime', () => {
  it('renders days and hours once the duration crosses a full day', () => {
    // 90,000 seconds = 1 day 1 hour; the minutes remainder is dropped at day scale
    expect(formatUptime(90_000)).toBe('1d 1h');
  });

  it('keeps a zeroed hour segment on an exact-day boundary', () => {
    expect(formatUptime(86_400)).toBe('1d 0h');
  });

  it('renders hours and minutes when under a day', () => {
    // 5 hours 30 minutes
    expect(formatUptime(19_800)).toBe('5h 30m');
  });

  it('renders minutes alone when under an hour', () => {
    expect(formatUptime(2_700)).toBe('45m');
  });

  it('renders a zero duration as minutes', () => {
    expect(formatUptime(0)).toBe('0m');
  });
});
