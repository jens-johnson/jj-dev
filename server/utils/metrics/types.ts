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
 * ██████████████████████████████████████████ #server/utils/metrics/types.ts ███████████████████████████████████████████
 *
 * Type definitions for the about-page metrics route: GitHub contribution and Strava run-stats shapes plus the
 * aggregated response.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An interface representing a single day of GitHub contribution activity from the contributions API
 * @public
 * @interface
 */
export interface IGhContribution {
  /* The calendar day (ISO YYYY-MM-DD) */
  date: string;

  /* The contribution count on that day */
  count: number;

  /* The GitHub heatmap intensity level for that day */
  level: 0 | 1 | 2 | 3 | 4;
}

/**
 * An interface representing the response shape of the GitHub contributions API; per-year totals plus the per-day list
 * @public
 * @interface
 */
export interface IGhContributionsResponse {
  /* The contribution totals keyed by year */
  total: Record<string, number>;

  /* The per-day contribution list, oldest first */
  contributions: IGhContribution[];
}

/**
 * An interface representing the response shape of the Strava OAuth refresh-token exchange
 * @public
 * @interface
 */
export interface IStravaTokenResponse {
  /* The short-lived access token to authorise subsequent Strava API calls */
  access_token: string;

  /* The authenticated athlete, carrying the id used for the stats lookup */
  athlete: { id: number };
}

/**
 * An interface representing an aggregate run-totals block from the Strava athlete stats endpoint
 * @public
 * @interface
 */
export interface IStravaTotals {
  /* The number of runs in the block */
  count: number;

  /* The total distance, in metres */
  distance: number;

  /* The total moving time, in seconds */
  moving_time: number;

  /* The total elapsed time, in seconds */
  elapsed_time: number;

  /* The total elevation gain, in metres */
  elevation_gain: number;
}

/**
 * An interface representing the Strava athlete stats response; recent, year-to-date, and all-time run totals
 * @public
 * @interface
 */
export interface IStravaStatsResponse {
  /* The year-to-date run totals */
  ytd_run_totals: IStravaTotals;

  /* The all-time run totals */
  all_run_totals: IStravaTotals;

  /* The recent (trailing four weeks) run totals */
  recent_run_totals: IStravaTotals;
}

/**
 * An interface representing a Strava activity summary; only the fields the weekly-mileage bucketing reads
 * @public
 * @interface
 */
export interface IStravaActivitySummary {
  /* The Strava activity id */
  id: number;

  /* The activity name */
  name: string;

  /* The activity type (only 'Run' is bucketed into weekly mileage) */
  type: string;

  /* The activity start time (ISO string) */
  start_date: string;

  /* The activity distance, in metres */
  distance: number;

  /* The activity moving time, in seconds */
  moving_time: number;
}

/**
 * An interface representing one day of the contribution heatmap; a count and its intensity level
 * @public
 * @interface
 */
export interface IMetricsDay {
  /* The contribution count for the day */
  count: number;

  /* The GitHub heatmap intensity level for the day */
  level: 0 | 1 | 2 | 3 | 4;
}

/**
 * An interface representing one week of GitHub contribution activity; seven days of counts and intensity levels
 * @public
 * @interface
 */
export interface IMetricsWeek {
  /* The seven days of the week, Monday first */
  days: IMetricsDay[];
}

/**
 * An interface representing the GitHub block of the metrics payload; the total and the trailing contribution weeks
 * @public
 * @interface
 */
export interface IMetricsGithub {
  /* The total contributions for the current calendar year */
  totalContributions: number;

  /* The trailing 26 weeks of contribution activity, each with seven days */
  weeks: IMetricsWeek[];
}

/**
 * An interface representing the Strava block of the metrics payload; year-to-date run totals and the weekly series
 * @public
 * @interface
 */
export interface IMetricsStrava {
  /* The year-to-date run distance, in miles */
  ytdMiles: number;

  /* The year-to-date run count */
  ytdRuns: number;

  /* The year-to-date elevation gain, in feet */
  ytdElevationFt: number;

  /* The trailing 16 weeks of run mileage, oldest first, for the sparkline */
  weeklyMiles: number[];
}

/**
 * An interface representing the aggregated payload the metrics route returns; GitHub weeks plus Strava run stats
 * @public
 * @interface
 */
export interface IMetricsResponse {
  /* The GitHub contribution block */
  github: IMetricsGithub;

  /* The Strava run-stats block */
  strava: IMetricsStrava;
}
