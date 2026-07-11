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
 * ████████████████████████████████████████████ #shared/utils/date/utils.ts ████████████████████████████████████████████
 *
 * Shared date pure helpers: the ISO-string type guard used to validate untrusted timestamp inputs.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * Reports whether an unknown value is a parseable ISO date string, narrowing it for downstream use. The check accepts
 * anything Date.parse understands, which covers the ISO 8601 forms the app exchanges
 * @public
 * @function
 * @param value - The untrusted value to test
 * @returns Whether the value is a string that parses to a valid date
 */
export function isIsoString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}
