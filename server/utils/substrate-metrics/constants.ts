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
 * ███████████████████████████████████ #server/utils/substrate-metrics/constants.ts ████████████████████████████████████
 *
 * Constants for the substrate live-metrics server module: the storage keys, history cap, and staleness thresholds.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The Nitro storage key for the latest substrate snapshot, under the `substrate` mount
 * @public
 * @constant
 */
export const SUBSTRATE_LATEST_KEY: string = 'metrics:latest';

/**
 * The Nitro storage key for the rolling sample history, under the `substrate` mount
 * @public
 * @constant
 */
export const SUBSTRATE_HISTORY_KEY: string = 'metrics:history';

/**
 * The maximum rolling-history points to retain (~30 min at a 30s push cadence); enough for a live sparkline, cheap to
 * store
 * @public
 * @constant
 */
export const SUBSTRATE_HISTORY_MAX: number = 60;

/**
 * The maximum sample age, in seconds, for the feed to read as `live`
 * @public
 * @constant
 */
export const SUBSTRATE_LIVE_MAX_AGE_S: number = 90;

/**
 * The maximum sample age, in seconds, for the feed to read as `stale` (older reads as `offline`)
 * @public
 * @constant
 */
export const SUBSTRATE_STALE_MAX_AGE_S: number = 600;
