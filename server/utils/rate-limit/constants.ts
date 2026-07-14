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
 * ███████████████████████████████████████ #server/utils/rate-limit/constants.ts ███████████████████████████████████████
 *
 * Constants for the ingest rate limiter: the request ceiling, the sliding window, and the fail-open timeout.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { Duration } from '@upstash/ratelimit';

/**
 * The maximum requests a single client may make within the rate-limit window
 * @public
 * @constant
 */
export const RATE_LIMIT_MAX: number = 12;

/**
 * The rate-limit window length in seconds; the single source the Upstash duration and the millisecond form derive from
 * @public
 * @constant
 */
export const RATE_LIMIT_WINDOW_SECONDS: number = 60;

/**
 * The rate-limit window as an Upstash duration string, used by the sliding-window limiter
 * @public
 * @constant
 */
export const RATE_LIMIT_WINDOW: Duration = `${RATE_LIMIT_WINDOW_SECONDS} s` as Duration;

/**
 * The rate-limit window in milliseconds, used by the in-memory dev fallback
 * @public
 * @constant
 */
export const RATE_LIMIT_WINDOW_MS: number = RATE_LIMIT_WINDOW_SECONDS * 1_000;

/**
 * The timeout, in milliseconds, after which a slow Upstash call fails open so a Redis hiccup never blocks ingestion
 * @public
 * @constant
 */
export const RATE_LIMIT_TIMEOUT_MS: number = 1_000;

/**
 * The maximum distinct keys the in-memory dev-fallback limiter tracks before evicting the oldest, bounding its map
 * @public
 * @constant
 */
export const RATE_LIMIT_MAX_TRACKED_KEYS: number = 10_000;
