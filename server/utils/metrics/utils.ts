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
 * ██████████████████████████████████████████ #server/utils/metrics/utils.ts ███████████████████████████████████████████
 *
 * Pure cores for the about-page metrics route: contribution-week grouping and Strava weekly-mileage bucketing.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { defineSymbol } from '#shared/utils/symbol';
import { metersToMiles } from '#shared/utils/units';

import type { IGhContribution, IMetricsDay, IMetricsWeek, IStravaActivitySummary } from './types';

/**
 * The number of days in a week; the fixed row width the contribution heatmap chunks days into
 * @internal
 * @constant
 */
const DAYS_PER_WEEK: number = 7;

/**
 * The number of milliseconds in a week; the bucket width for the weekly-mileage series
 * @internal
 * @constant
 */
const MS_PER_WEEK: number = DAYS_PER_WEEK * 24 * 60 * 60 * 1000;

/**
 * Groups a flat array of daily contributions into the trailing weeks, newest last, each a fixed seven-day row
 * @public
 * @function
 * @param contributions - The per-day contribution list, oldest first
 * @param numWeeks - The number of trailing weeks to keep
 * @returns The trailing weeks, each with seven days of counts and intensity levels
 */
export function groupIntoWeeks(contributions: IGhContribution[], numWeeks: number): IMetricsWeek[] {
  // Keep only the trailing numWeeks weeks of days, then chunk them into fixed seven-day rows
  const days: IGhContribution[] = contributions.slice(-(numWeeks * DAYS_PER_WEEK));

  return Array.from(
    { length: numWeeks },
    (_: unknown, weekIndex: number): IMetricsWeek => ({
      days: days
        .slice(weekIndex * DAYS_PER_WEEK, weekIndex * DAYS_PER_WEEK + DAYS_PER_WEEK)
        .map(
          (contribution: IGhContribution): IMetricsDay => ({ count: contribution.count, level: contribution.level }),
        ),
    }),
  );
}

/**
 * Buckets raw Strava activities into total run miles per week for the trailing weeks, oldest week first
 * @public
 * @function
 * @param activities - The raw Strava activity summaries, newest first
 * @param numWeeks - The number of trailing weeks to bucket
 * @returns The total run miles per week, oldest week first, rounded to one decimal
 */
export function buildWeeklyMiles(activities: IStravaActivitySummary[], numWeeks: number): number[] {
  const now: number = Date.now();

  // Reduce the run activities into per-week mileage buckets, indexed oldest week first
  const buckets: number[] = activities.reduce<number[]>((acc: number[], activity: IStravaActivitySummary): number[] => {
    // Skip non-runs and activities outside the window; the rest add their miles to their week's bucket. A negative
    // index (a future-dated activity, e.g. clock skew) is rejected so it cannot write past the end of the buckets.
    const weekIndex: number = Math.floor((now - new Date(activity.start_date).getTime()) / MS_PER_WEEK);
    if (activity.type !== 'Run' || weekIndex < 0 || weekIndex >= numWeeks) {
      return acc;
    }
    const bucketIndex: number = numWeeks - 1 - weekIndex;
    acc[bucketIndex] = (acc[bucketIndex] ?? 0) + metersToMiles(activity.distance);
    return acc;
  }, Array<number>(numWeeks).fill(0));

  return buckets.map((miles: number): number => Math.round(miles * 10) / 10);
}

/* ─── Metadata ───────────────────────────────────────────────────────────────────────────────────────────────────── */

// Register readable names so the unit suites can title their describe blocks from the source symbols
defineSymbol(groupIntoWeeks, {
  name: 'Group Into Weeks',
  description: 'Chunks a flat contribution list into trailing seven-day weeks.',
});
defineSymbol(buildWeeklyMiles, {
  name: 'Build Weekly Miles',
  description: 'Buckets Strava run activities into trailing per-week mileage.',
});
