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
 * █████████████████████████████████████████ #shared/utils/units/utils.test.ts █████████████████████████████████████████
 *
 * Shared unit-conversion helpers: the meter/foot/mile constants and pure converters used across the app and server.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { getTestFileName } from '@jens-johnson/style-guide/test-utils';
import { describe, expect, it } from 'vitest';

import { symbolName } from '#shared/utils/symbol';

import { metersToFeet, metersToMiles } from './utils';

describe(getTestFileName(import.meta.url), (): void => {
  describe(symbolName(metersToFeet), (): void => {
    it('converts and rounds to the nearest foot', (): void => {
      // 100m x 3.28084 = 328.084, rounded down
      expect(metersToFeet(100)).toBe(328);
      expect(metersToFeet(0)).toBe(0);
    });
  });

  describe(symbolName(metersToMiles), (): void => {
    it('converts and rounds to a tenth of a mile', (): void => {
      // A 5k is 3.10686 miles, rounded to 3.1
      expect(metersToMiles(5000)).toBe(3.1);
      expect(metersToMiles(1609.344)).toBe(1);
    });
  });
});
