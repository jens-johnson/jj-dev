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
 * █████████████████████████████████████████ #shared/utils/date/utils.test.ts ██████████████████████████████████████████
 *
 * Unit tests for the shared date helpers: the ISO-string guard's accept and reject branches.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { describe, expect, it } from 'vitest';

import { isIsoString } from './utils';

describe('isIsoString', () => {
  it('accepts full ISO timestamps and date-only strings', () => {
    expect(isIsoString('2026-07-10T16:30:00.000Z')).toBe(true);
    expect(isIsoString('2026-07-10')).toBe(true);
  });

  it('rejects unparseable strings and non-strings', () => {
    expect(isIsoString('not a date')).toBe(false);
    expect(isIsoString('')).toBe(false);
    expect(isIsoString(1752165000000)).toBe(false);
    expect(isIsoString(null)).toBe(false);
    expect(isIsoString(undefined)).toBe(false);
    expect(isIsoString(new Date())).toBe(false);
  });
});
