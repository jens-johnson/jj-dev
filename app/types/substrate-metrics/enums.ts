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
 * ███████████████████████████████████████ app/types/substrate-metrics/enums.ts ████████████████████████████████████████
 *
 * The freshness-state and fleet-health enumerations for the substrate live-metrics feed.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An enumeration of the freshness states of the substrate metrics feed
 * @public
 * @enum
 */
export enum SubstrateMetricsState {
  /* The feed is reporting fresh samples */
  live = 'live',

  /* The latest sample has aged past the freshness window */
  stale = 'stale',

  /* No sample has arrived; the publisher is down */
  offline = 'offline',
}

/**
 * An enumeration of the rolled-up fleet health states: freshness (offline/stale) blended with threshold checks
 * (healthy/degraded)
 * @public
 * @enum
 */
export enum SubstrateHealth {
  /* All threshold checks pass and the feed is fresh */
  healthy = 'healthy',

  /* A threshold check is failing while the feed is fresh */
  degraded = 'degraded',

  /* The latest sample has aged past the freshness window */
  stale = 'stale',

  /* No sample has arrived; the publisher is down */
  offline = 'offline',
}
