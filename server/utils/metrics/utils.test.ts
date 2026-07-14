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
 * ████████████████████████████████████████ #server/utils/metrics/utils.test.ts ████████████████████████████████████████
 *
 * Unit tests for the metrics pure cores: contribution-week grouping and weekly-mileage bucketing.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { getTestFileName } from '@jens-johnson/style-guide/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { symbolName } from '#shared/utils/symbol';

import type { IGhContribution, IStravaActivitySummary } from './types';
import { buildWeeklyMiles, groupIntoWeeks } from './utils';

/* ─── Fixtures ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Fourteen days of contributions (two full weeks), counts 0..13 so the grouping is checkable by index
 * @internal
 * @constant
 */
const fourteenDays: IGhContribution[] = Array.from(
  { length: 14 },
  (_: unknown, dayIndex: number): IGhContribution => ({
    date: `2026-06-${String(dayIndex + 1).padStart(2, '0')}`,
    count: dayIndex,
    level: (dayIndex % 5) as 0 | 1 | 2 | 3 | 4,
  }),
);

/**
 * The fixed "now" the mileage bucketing is tested against, so the activity ages are deterministic
 * @internal
 * @constant
 */
const NOW: string = '2026-07-13T00:00:00.000Z';

/**
 * Run and non-run activities at known week offsets from NOW: a run this week, a run two weeks back, a non-run, a run
 * outside the four-week window, and a future-dated run (negative week index) that the guard must drop
 * @internal
 * @constant
 */
const activities: IStravaActivitySummary[] = [
  {
    id: 1,
    name: 'This week',
    type: 'Run',
    start_date: '2026-07-12T00:00:00.000Z',
    distance: 1609.344,
    moving_time: 600,
  },
  {
    id: 2,
    name: 'Two weeks',
    type: 'Run',
    start_date: '2026-06-28T00:00:00.000Z',
    distance: 3218.688,
    moving_time: 1200,
  },
  {
    id: 3,
    name: 'A ride',
    type: 'Ride',
    start_date: '2026-07-12T00:00:00.000Z',
    distance: 8046.72,
    moving_time: 900,
  },
  {
    id: 4,
    name: 'Too old',
    type: 'Run',
    start_date: '2026-06-01T00:00:00.000Z',
    distance: 1609.344,
    moving_time: 600,
  },
  {
    id: 5,
    name: 'Future dated',
    type: 'Run',
    start_date: '2026-07-20T00:00:00.000Z',
    distance: 1609.344,
    moving_time: 600,
  },
];

/* ─── Tests ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

describe(getTestFileName(import.meta.url), (): void => {
  describe(symbolName(groupIntoWeeks), (): void => {
    it('chunks the trailing days into fixed seven-day weeks, oldest week first', (): void => {
      const weeks = groupIntoWeeks(fourteenDays, 2);
      expect(weeks).toHaveLength(2);
      expect(weeks[0]?.days.map((day) => day.count)).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(weeks[1]?.days.map((day) => day.count)).toEqual([7, 8, 9, 10, 11, 12, 13]);
    });

    it('maps each day onto its count and intensity level', (): void => {
      const [firstDay] = groupIntoWeeks(fourteenDays, 2)[0]?.days ?? [];
      expect(firstDay).toEqual({ count: 0, level: 0 });
    });

    it('keeps only the trailing weeks when given more days than requested', (): void => {
      // 14 days but only 1 week requested → keeps the last 7 days (counts 7..13)
      expect(groupIntoWeeks(fourteenDays, 1)[0]?.days.map((day) => day.count)).toEqual([7, 8, 9, 10, 11, 12, 13]);
    });
  });

  describe(symbolName(buildWeeklyMiles), (): void => {
    beforeEach((): void => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(NOW));
    });

    afterEach((): void => {
      vi.useRealTimers();
    });

    it('buckets run mileage by week, oldest week first, ignoring non-runs, out-of-window, and future activities', (): void => {
      // 1609.344 m = 1.0 mi this week (bucket 3); 3218.688 m = 2.0 mi two weeks back (bucket 1); ride, old run, and
      // the future-dated run are all dropped, so the series stays exactly numWeeks long
      expect(buildWeeklyMiles(activities, 4)).toEqual([0, 2, 0, 1]);
    });

    it('returns an all-zero series when no runs fall in the window', (): void => {
      expect(buildWeeklyMiles([activities[2]!], 4)).toEqual([0, 0, 0, 0]);
    });
  });
});
