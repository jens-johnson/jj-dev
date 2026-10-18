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
 * ████████████████████████████████████ scripts/neighborhood-explorer/utils.test.ts ████████████████████████████████████
 *
 * Unit tests for the neighborhood dataset pipeline helpers.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { getTestFileName } from '@jens-johnson/style-guide/test-utils';
import { describe, expect, it } from 'vitest';

import type { TPolygonGeometry } from './utils';
import { haversineKm, percentileRanks, pointInPolygon, share, weightedMeanVector } from './utils';

/* ─── Fixtures ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A 10×10 square with a 2×2 hole in the middle
 * @internal
 * @constant
 */
const SQUARE_WITH_HOLE: TPolygonGeometry = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ],
    [
      [4, 4],
      [6, 4],
      [6, 6],
      [4, 6],
      [4, 4],
    ],
  ],
};

/* ─── Tests ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

describe(getTestFileName(import.meta.url), (): void => {
  describe('haversineKm', (): void => {
    it('measures one degree of latitude at about 111 km', (): void => {
      expect(haversineKm([0, 0], [0, 1])).toBeCloseTo(111.19, 1);
    });

    it('is zero for the same point', (): void => {
      expect(haversineKm([-117.18, 32.82], [-117.18, 32.82])).toBe(0);
    });
  });

  describe('pointInPolygon', (): void => {
    it('finds points inside the outer ring and outside holes', (): void => {
      expect(pointInPolygon([1, 1], SQUARE_WITH_HOLE)).toBe(true);
      expect(pointInPolygon([5, 5], SQUARE_WITH_HOLE)).toBe(false);
      expect(pointInPolygon([11, 5], SQUARE_WITH_HOLE)).toBe(false);
    });

    it('checks every part of a multipolygon', (): void => {
      const multi: TPolygonGeometry = {
        type: 'MultiPolygon',
        coordinates: [
          SQUARE_WITH_HOLE.coordinates as [number, number][][],
          [
            [
              [20, 20],
              [21, 20],
              [21, 21],
              [20, 20],
            ],
          ],
        ],
      };
      expect(pointInPolygon([20.8, 20.5], multi)).toBe(true);
      expect(pointInPolygon([15, 15], multi)).toBe(false);
    });
  });

  describe('percentileRanks', (): void => {
    it('spreads distinct values across 0–1 in input order', (): void => {
      expect(percentileRanks([30, 10, 20])).toEqual([1, 0, 0.5]);
    });

    it('averages ties and passes nulls through', (): void => {
      expect(percentileRanks([5, null, 5, 1, 9])).toEqual([0.5, null, 0.5, 0, 1]);
    });

    it('puts a lone value at the median', (): void => {
      expect(percentileRanks([null, 3])).toEqual([null, 0.5]);
    });
  });

  describe('weightedMeanVector', (): void => {
    it('blends slot by slot and skips nulls', (): void => {
      expect(
        weightedMeanVector(
          [
            [1, null, 4],
            [3, 2, null],
          ],
          [1, 3],
        ),
      ).toEqual([2.5, 2, 4]);
    });

    it('returns null where every vector is null or unweighted', (): void => {
      expect(weightedMeanVector([[null], [5]], [1, 0])).toEqual([null]);
    });
  });

  describe('share', (): void => {
    it('divides counts and guards an empty universe', (): void => {
      expect(share(1, 4)).toBe(0.25);
      expect(share(1, 0)).toBeNull();
      expect(share(null, 4)).toBeNull();
    });
  });
});
