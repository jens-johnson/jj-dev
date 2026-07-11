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

import { describe, expect, it } from 'vitest';

import { techDocHref } from './utils';

describe('techDocHref', () => {
  it('resolves a registered technology to its docs URL', () => {
    expect(techDocHref('Paper')).toBe('https://docs.papermc.io/');
  });

  it('is case-insensitive', () => {
    expect(techDocHref('LUCKPERMS')).toBe('https://luckperms.net/');
  });

  it('strips a trailing version so "PaperMC 26.1.2" resolves the same as "Paper"', () => {
    expect(techDocHref('PaperMC 26.1.2')).toBe('https://docs.papermc.io/');
  });

  it('resolves aliases to the same destination', () => {
    expect(techDocHref('multiverse')).toBe(techDocHref('multiverse-core'));
  });

  it('returns undefined for an unregistered name so callers render plain text', () => {
    expect(techDocHref('Homegrown thing')).toBeUndefined();
  });

  it('returns undefined for empty or missing input', () => {
    expect(techDocHref('')).toBeUndefined();
    expect(techDocHref(null)).toBeUndefined();
    expect(techDocHref(undefined)).toBeUndefined();
  });
});
