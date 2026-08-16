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
 * █████████████████████████████████ #components/widgets/blog/bento-grid/utils.test.ts █████████████████████████████████
 *
 * Unit tests for the bento grid span helper.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { describe, expect, it } from 'vitest';

import { DEFAULT_SPAN_CLASS, SPAN_CLASS_BY_SIZE } from './constants';
import { bentoSpanClass } from './utils';

describe('bentoSpanClass', () => {
  it('maps each known size to its span classes', () => {
    expect(bentoSpanClass('sm')).toBe(SPAN_CLASS_BY_SIZE.sm);
    expect(bentoSpanClass('wide')).toBe(SPAN_CLASS_BY_SIZE.wide);
    expect(bentoSpanClass('tall')).toBe(SPAN_CLASS_BY_SIZE.tall);
    expect(bentoSpanClass('large')).toBe(SPAN_CLASS_BY_SIZE.large);
  });

  it('falls back to the default span for a missing size', () => {
    expect(bentoSpanClass()).toBe(DEFAULT_SPAN_CLASS);
    expect(bentoSpanClass(undefined)).toBe(DEFAULT_SPAN_CLASS);
  });

  it('falls back to the default span for an unknown size', () => {
    expect(bentoSpanClass('enormous')).toBe(DEFAULT_SPAN_CLASS);
    expect(bentoSpanClass('')).toBe(DEFAULT_SPAN_CLASS);
  });
});
