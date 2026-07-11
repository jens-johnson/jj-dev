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
 * ███████████████████████████████████████████ #shared/utils/units/utils.ts ████████████████████████████████████████████
 *
 * Shared unit-conversion helpers: the meter/foot/mile constants and pure converters used across the app and server.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { defineSymbol } from '../symbol';
import { FEET_PER_METER, METERS_PER_MILE } from './constants';

/**
 * Converts meters to feet, rounded to the nearest foot
 * @public
 * @function
 * @param meters - The distance or elevation in meters
 * @returns The equivalent in whole feet
 */
export function metersToFeet(meters: number): number {
  return Math.round(meters * FEET_PER_METER);
}

/**
 * Converts meters to miles, rounded to one decimal place
 * @public
 * @function
 * @param meters - The distance in meters
 * @returns The equivalent in miles, to a tenth
 */
export function metersToMiles(meters: number): number {
  return Math.round((meters / METERS_PER_MILE) * 10) / 10;
}

/* ─── Metadata ───────────────────────────────────────────────────────────────────────────────────────────────────── */

// Register readable names/descriptions so the unit suites can title their describe blocks from the source symbols
defineSymbol(metersToFeet, {
  name: 'Meters To Feet',
  description: 'Converts meters to feet, rounded to the nearest foot.',
});
defineSymbol(metersToMiles, {
  name: 'Meters To Miles',
  description: 'Converts meters to miles, rounded to one decimal place.',
});
