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
 * ██████████████████████████████████████ server/utils/substrate-metrics/enums.ts ██████████████████████████████████████
 *
 * The freshness-state enumeration for the substrate live-metrics feed.
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
