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
 * █████████████████████████████████████ #components/data/spark-line/utils.test.ts █████████████████████████████████████
 *
 * Sparkline component module: props/geometry types, drawing constants, and the pure geometry builder with its tests.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { describe, expect, it } from 'vitest';

import { buildSparkLineGeometry } from './utils';

describe('buildSparkLineGeometry', () => {
  it('scales a two-point series across the padded viewport', () => {
    // Width 88 leaves 84 plottable px; min plots at the bottom pad line, max at the top
    expect(buildSparkLineGeometry([0, 1], 88, 24)).toEqual({
      line: 'M2.0,22.0 L86.0,2.0',
      area: 'M2.0,22.0 L86.0,2.0 L86.0,24 L2.0,24 Z',
      end: [86, 2],
    });
  });

  it('renders a flat series along the middle rather than dividing by zero', () => {
    // Equal points force the range fallback of one; every y sits on the bottom pad line
    const geometry = buildSparkLineGeometry([5, 5, 5], 88, 24);

    expect(geometry?.line).toBe('M2.0,22.0 L44.0,22.0 L86.0,22.0');
  });

  it('returns null for a series too short to draw', () => {
    expect(buildSparkLineGeometry([], 88, 24)).toBeNull();
    expect(buildSparkLineGeometry([7], 88, 24)).toBeNull();
  });
});
