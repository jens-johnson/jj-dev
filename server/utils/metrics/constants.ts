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
 * ████████████████████████████████████████ #server/utils/metrics/constants.ts █████████████████████████████████████████
 *
 * Constants for the about-page metrics route: the contribution/mileage window sizes, Strava page size, and response
 * cache TTL.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The number of trailing weeks of GitHub contributions to surface in the heatmap
 * @public
 * @constant
 */
export const CONTRIBUTION_WEEKS: number = 26;

/**
 * The number of trailing weeks of run mileage to surface in the sparkline
 * @public
 * @constant
 */
export const MILEAGE_WEEKS: number = 16;

/**
 * The maximum Strava activities to request for the weekly-mileage bucketing (the endpoint's page ceiling)
 * @public
 * @constant
 */
export const STRAVA_ACTIVITY_PAGE_SIZE: number = 200;

/**
 * How long, in seconds, to cache the aggregated metrics response before re-fetching the upstream APIs
 * @public
 * @constant
 */
export const CACHE_MAX_AGE_SECONDS: number = 60 * 60;
