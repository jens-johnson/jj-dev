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
 * ███████████████████████████████████ #components/widgets/metrics-card/constants.ts ███████████████████████████████████
 *
 * Constants for the metrics card widget: sparkline sizing shared by the GitHub and Strava weekly bars.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The number of trailing weeks each sparkline plots; the GitHub series is sliced to this to match the Strava series
 * @public
 * @constant
 */
export const SPARKLINE_WEEK_COUNT: number = 16;

/**
 * The tallest a sparkline bar can render, in pixels; the busiest week scales to this height
 * @public
 * @constant
 */
export const SPARKLINE_MAX_BAR_HEIGHT_PX: number = 52;

/**
 * The CSS height rendered for a zero-activity week; a baseline stub so empty weeks stay visible
 * @public
 * @constant
 */
export const SPARKLINE_EMPTY_BAR_HEIGHT: string = '3px';
