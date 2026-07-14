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
 * █████████████████████████████████████████ #shared/utils/units/constants.ts ██████████████████████████████████████████
 *
 * Shared unit-conversion helpers: the meter/foot/mile constants and pure converters used across the app and server.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The number of feet per meter
 * @public
 * @constant
 */
export const FEET_PER_METER: number = 3.28084;

/**
 * The number of meters per foot
 * @public
 * @constant
 */
export const METERS_PER_FOOT: number = 0.3048;

/**
 * The number of meters per statute mile
 * @public
 * @constant
 */
export const METERS_PER_MILE: number = 1609.344;
