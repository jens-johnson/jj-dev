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
 * The rate-limit window as an Upstash duration string, used by the sliding-window limiter
 * @public
 * @constant
 */
export const RATE_LIMIT_WINDOW: Duration = '60 s';

/**
 * The rate-limit window in milliseconds, used by the in-memory dev fallback
 * @public
 * @constant
 */
export const RATE_LIMIT_WINDOW_MS: number = 60_000;

/**
 * The timeout, in milliseconds, after which a slow Upstash call fails open so a Redis hiccup never blocks ingestion
 * @public
 * @constant
 */
export const RATE_LIMIT_TIMEOUT_MS: number = 1_000;
