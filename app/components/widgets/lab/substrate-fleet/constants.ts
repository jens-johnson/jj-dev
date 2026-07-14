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
 * ███████████████████████████████ #components/widgets/lab/substrate-fleet/constants.ts ████████████████████████████████
 *
 * Constants for the substrate fleet card: the gauge pressure threshold and the device-order sort fallback.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The utilization percentage at which gauges and sparklines warm from the live accent to terra
 * @public
 * @constant
 */
export const TONE_PRESSURE_THRESHOLD_PCT: number = 92;

/**
 * The sort weight assumed for devices that do not declare an order; sorts them after explicitly ordered peers
 * @public
 * @constant
 */
export const FALLBACK_DEVICE_ORDER: number = 100;
