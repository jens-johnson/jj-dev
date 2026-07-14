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
 * ██████████████████████████████████████████ #utils/tech-docs/utils.test.ts ███████████████████████████████████████████
 *
 * Unit tests for the tech-docs registry: case-insensitive, version-tolerant, alias-aware docs URL resolution and the
 * plain-text fallback.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { getTestFileName } from '@jens-johnson/style-guide/test-utils';
import { describe, expect, it } from 'vitest';

import { symbolName } from '#shared/utils/symbol';

import { techDocHref } from './utils';

describe(getTestFileName(import.meta.url), (): void => {
  describe(symbolName(techDocHref), (): void => {
    it('resolves a registered technology to its docs URL', (): void => {
      expect(techDocHref('Paper')).toBe('https://docs.papermc.io/');
    });

    it('is case-insensitive', (): void => {
      expect(techDocHref('LUCKPERMS')).toBe('https://luckperms.net/');
    });

    it('strips a trailing version so "PaperMC 26.1.2" resolves the same as "Paper"', (): void => {
      expect(techDocHref('PaperMC 26.1.2')).toBe('https://docs.papermc.io/');
    });

    it('resolves aliases to the same destination', (): void => {
      expect(techDocHref('multiverse')).toBe(techDocHref('multiverse-core'));
    });

    it('returns undefined for an unregistered name so callers render plain text', (): void => {
      expect(techDocHref('Homegrown thing')).toBeUndefined();
    });

    it('returns undefined for empty or missing input', (): void => {
      expect(techDocHref('')).toBeUndefined();
      expect(techDocHref(null)).toBeUndefined();
      expect(techDocHref(undefined)).toBeUndefined();
    });
  });
});
