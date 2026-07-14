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
 * █████████████████████████████████████████ #server/utils/validation/utils.ts █████████████████████████████████████████
 *
 * Shared, dependency-free type guards for validating untrusted metrics payloads: numbers, percentages, counts, objects,
 * ranges.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * A type guard for a finite number
 * @public
 * @function
 * @param value - The value to test
 * @returns True when the value is a finite number
 */
export function isNum(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * A type guard for a percentage (a finite number in the 0..100 range)
 * @public
 * @function
 * @param value - The value to test
 * @returns True when the value is a number within 0..100
 */
export function isPct(value: unknown): value is number {
  return isNum(value) && value >= 0 && value <= 100;
}

/**
 * A type guard for a non-negative integer count (capped at 100,000 to reject absurd values)
 * @public
 * @function
 * @param value - The value to test
 * @returns True when the value is an integer within 0..100,000
 */
export function isCount(value: unknown): value is number {
  return isNum(value) && Number.isInteger(value) && value >= 0 && value <= 100_000;
}

/**
 * A type guard for a large non-negative integer count (capped at 1,000,000,000 to reject absurd values)
 * @public
 * @function
 * @param value - The value to test
 * @returns True when the value is an integer within 0..1,000,000,000
 */
export function isBigCount(value: unknown): value is number {
  return isNum(value) && Number.isInteger(value) && value >= 0 && value <= 1_000_000_000;
}

/**
 * A type guard for a plain (non-array, non-null) object
 * @public
 * @function
 * @param value - The value to test
 * @returns True when the value is a plain object
 */
export function isObj(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * A type guard for a finite number within an inclusive range
 * @public
 * @function
 * @param value - The value to test
 * @param low - The inclusive lower bound
 * @param high - The inclusive upper bound
 * @returns True when the value is a number within low..high
 */
export function inRange(value: unknown, low: number, high: number): value is number {
  return isNum(value) && value >= low && value <= high;
}
