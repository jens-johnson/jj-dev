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

import { getTestFileName } from '@jens-johnson/style-guide/test-utils';
import { describe, expect, it } from 'vitest';

import { symbolName } from '#shared/utils/symbol';

import { isIsoString } from './utils';

describe(getTestFileName(import.meta.url), (): void => {
  describe(symbolName(isIsoString), (): void => {
    it('accepts full ISO timestamps and date-only strings', (): void => {
      expect(isIsoString('2026-07-10T16:30:00.000Z')).toBe(true);
      expect(isIsoString('2026-07-10')).toBe(true);
    });

    it('rejects unparseable strings and non-strings', (): void => {
      expect(isIsoString('not a date')).toBe(false);
      expect(isIsoString('')).toBe(false);
      expect(isIsoString(1752165000000)).toBe(false);
      expect(isIsoString(null)).toBe(false);
      expect(isIsoString(undefined)).toBe(false);
      expect(isIsoString(new Date())).toBe(false);
    });
  });
});
