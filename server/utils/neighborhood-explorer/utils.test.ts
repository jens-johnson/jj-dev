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
 * █████████████████████████████████ #server/utils/neighborhood-explorer/utils.test.ts █████████████████████████████████
 *
 * Unit tests for the neighborhood explorer scoring core.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { getTestFileName } from '@jens-johnson/style-guide/test-utils';
import { describe, expect, it } from 'vitest';

import type { TNeighborhoodWeights } from '#shared/neighborhood-explorer';
import { NEIGHBORHOOD_DEFAULT_WEIGHTS, NEIGHBORHOOD_FEATURES } from '#shared/neighborhood-explorer';
import { symbolName } from '#shared/utils/symbol';

import type { INeighborhoodDatasetPlace } from './types';
import {
  compareNeighborhoodProfiles,
  nearestNeighborhoodPlace,
  neighborhoodDifferences,
  parseNeighborhoodMatchesQuery,
  rankNeighborhoodMatches,
  searchNeighborhoodPlaces,
} from './utils';

/* ─── Fixtures ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The number of feature slots every vector carries
 * @internal
 * @constant
 */
const SLOTS: number = NEIGHBORHOOD_FEATURES.length;

/**
 * Builds a vector with every slot set to the same value
 * @internal
 * @function
 * @param value - The value for every slot
 * @returns The vector
 */
const flat = (value: number | null): (number | null)[] => Array.from({ length: SLOTS }, () => value);

/**
 * Builds a vector whose slots in one lens hold a different value from the rest
 * @internal
 * @function
 * @param lens - The lens to set
 * @param inside - The value for that lens's slots
 * @param outside - The value for every other slot
 * @returns The vector
 */
const withLens = (lens: string, inside: number, outside: number): number[] =>
  NEIGHBORHOOD_FEATURES.map((feature) => (feature.lens === lens ? inside : outside));

/**
 * Weights with every lens off except the given ones
 * @internal
 * @function
 * @param on - The lenses to weight at 100
 * @returns The weights
 */
const only = (...on: string[]): TNeighborhoodWeights =>
  Object.fromEntries(
    Object.keys(NEIGHBORHOOD_DEFAULT_WEIGHTS).map((lens) => [lens, on.includes(lens) ? 100 : 0]),
  ) as TNeighborhoodWeights;

/**
 * Builds a dataset place with a flat profile
 * @internal
 * @function
 * @param id - The place id
 * @param name - The place name
 * @param metro - The metro slug
 * @param value - The value for every percentile slot
 * @param tracts - The covered tract GEOIDs
 * @returns The place
 */
const place = (
  id: string,
  name: string,
  metro: string,
  value: number,
  tracts: string[] = [`${id}-tract`],
): INeighborhoodDatasetPlace => ({
  id,
  name,
  metro,
  centroid: [0, 0],
  tracts,
  raw: flat(value * 100),
  pct: flat(value),
});

/* ─── Tests ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

describe(getTestFileName(import.meta.url), (): void => {
  describe(symbolName(compareNeighborhoodProfiles), (): void => {
    it('scores identical profiles at 100 overall and per lens', (): void => {
      const result = compareNeighborhoodProfiles(flat(0.4), flat(0.4), NEIGHBORHOOD_DEFAULT_WEIGHTS);

      expect(result.similarity).toBe(100);
      expect(Object.values(result.lenses).every((score) => score === 100)).toBe(true);
    });

    it('floors opposite profiles at 0', (): void => {
      expect(compareNeighborhoodProfiles(flat(0), flat(1), NEIGHBORHOOD_DEFAULT_WEIGHTS).similarity).toBe(0);
    });

    it('maps the random-pair distance to 0 and half of it to 50', (): void => {
      // A uniform gap of √(1/6) is the RMS distance between two random percentiles
      const gap: number = Math.sqrt(1 / 6);
      expect(compareNeighborhoodProfiles(flat(0), flat(gap), NEIGHBORHOOD_DEFAULT_WEIGHTS).similarity).toBe(0);
      expect(compareNeighborhoodProfiles(flat(0), flat(gap / 2), NEIGHBORHOOD_DEFAULT_WEIGHTS).similarity).toBe(50);
    });

    it('ignores lenses weighted at zero', (): void => {
      // The profiles disagree completely on climate and nowhere else
      const origin = withLens('climate', 0, 0.5);
      const candidate = withLens('climate', 1, 0.5);

      expect(compareNeighborhoodProfiles(origin, candidate, only('people')).similarity).toBe(100);
      expect(compareNeighborhoodProfiles(origin, candidate, only('climate')).similarity).toBe(0);
    });

    it('skips missing slots instead of treating them as differences', (): void => {
      const candidate = flat(0.5);
      candidate[0] = null;
      const result = compareNeighborhoodProfiles(flat(0.5), candidate, NEIGHBORHOOD_DEFAULT_WEIGHTS);

      expect(result.similarity).toBe(100);
    });

    it('reports a lens as null when one side has no data for it', (): void => {
      const candidate: (number | null)[] = NEIGHBORHOOD_FEATURES.map((feature) =>
        feature.lens === 'vibe' ? null : 0.5,
      );
      const result = compareNeighborhoodProfiles(flat(0.5), candidate, NEIGHBORHOOD_DEFAULT_WEIGHTS);

      expect(result.lenses.vibe).toBeNull();
      expect(result.similarity).toBe(100);
    });

    it('returns 0 when every lens with data carries no weight', (): void => {
      expect(compareNeighborhoodProfiles(flat(0.5), flat(0.5), only()).similarity).toBe(0);
    });
  });

  describe(symbolName(neighborhoodDifferences), (): void => {
    it('lists the three biggest gaps, largest first, with raw values', (): void => {
      const origin = {
        metro: 'a',
        centroid: [0, 0] as [number, number],
        raw: flat(1),
        pct: flat(0.5),
      };
      const pct = flat(0.5);
      pct[0] = 0.9;
      pct[1] = 0.1;
      pct[2] = 0.6;
      const candidate = {
        ...origin,
        raw: flat(2),
        pct,
      };

      const result = neighborhoodDifferences(origin, candidate, NEIGHBORHOOD_DEFAULT_WEIGHTS);

      expect(result.map((delta) => delta.key)).toEqual(['medianAge', 'householdSize', 'householdsWithKids']);
      expect(result[0]).toEqual({
        key: 'medianAge',
        origin: 1,
        match: 2,
        gap: 0.4,
      });
    });

    it('leaves out features from zero-weight lenses', (): void => {
      const origin = {
        metro: 'a',
        centroid: [0, 0] as [number, number],
        raw: flat(1),
        pct: flat(0),
      };
      const candidate = { ...origin, pct: withLens('climate', 0, 1) };

      const result = neighborhoodDifferences(origin, candidate, only('climate'));

      expect(result.every((delta) => delta.gap === 0)).toBe(true);
    });
  });

  describe(symbolName(searchNeighborhoodPlaces), (): void => {
    const places = [
      place('p-1', 'North Clairemont', 'san-diego', 0.5),
      place('p-2', 'Clairemont', 'san-diego', 0.5),
      place('p-3', 'Clairemont Mesa East', 'san-diego', 0.5),
      place('p-4', 'RiNo', 'denver', 0.5),
    ];

    it('ranks prefix matches ahead of substring matches', (): void => {
      expect(searchNeighborhoodPlaces(places, 'clair').map((summary) => summary.id)).toEqual(['p-2', 'p-3', 'p-1']);
    });

    it('is case-insensitive and labels the metro', (): void => {
      expect(searchNeighborhoodPlaces(places, ' rino ')).toEqual([
        {
          id: 'p-4',
          name: 'RiNo',
          metro: 'denver',
          metroLabel: 'Denver, CO',
        },
      ]);
    });

    it('returns nothing for blank queries and honors the limit', (): void => {
      expect(searchNeighborhoodPlaces(places, '   ')).toEqual([]);
      expect(searchNeighborhoodPlaces(places, 'clair', 1)).toHaveLength(1);
    });
  });

  describe(symbolName(nearestNeighborhoodPlace), (): void => {
    const places = [
      { ...place('p-1', 'Close', 'san-diego', 0.5), centroid: [-117.18, 32.82] as [number, number] },
      { ...place('p-2', 'Far', 'san-diego', 0.5), centroid: [-117.0, 32.7] as [number, number] },
      { ...place('p-3', 'Elsewhere', 'denver', 0.5), centroid: [-117.181, 32.821] as [number, number] },
    ];

    it('returns the closest place within the metro only', (): void => {
      expect(nearestNeighborhoodPlace([-117.181, 32.821], places, 'san-diego')?.id).toBe('p-1');
    });

    it('returns undefined for a metro without places', (): void => {
      expect(nearestNeighborhoodPlace([0, 0], places, 'austin')).toBeUndefined();
    });
  });

  describe(symbolName(rankNeighborhoodMatches), (): void => {
    const origin = { profile: place('p-0', 'Origin', 'san-diego', 0.5), tracts: ['shared'] };
    const places = [
      place('p-1', 'Near twin', 'denver', 0.52),
      place('p-2', 'Far cousin', 'denver', 0.9),
      place('p-3', 'Hometown twin', 'san-diego', 0.5),
      place('p-4', 'Origin alias', 'denver', 0.5, ['shared']),
    ];

    it('orders matches by similarity and skips the origin metro by default', (): void => {
      const result = rankNeighborhoodMatches(origin, places, NEIGHBORHOOD_DEFAULT_WEIGHTS, 'other');

      expect(result.map((match) => match.place.id)).toEqual(['p-1', 'p-2']);
      expect(result[0]?.lenses).toHaveLength(7);
    });

    it('includes the origin metro for the all scope', (): void => {
      const result = rankNeighborhoodMatches(origin, places, NEIGHBORHOOD_DEFAULT_WEIGHTS, 'all');

      expect(result[0]?.place.id).toBe('p-3');
    });

    it('never returns a place that shares a tract with the origin', (): void => {
      const result = rankNeighborhoodMatches(origin, places, NEIGHBORHOOD_DEFAULT_WEIGHTS, 'all');

      expect(result.some((match) => match.place.id === 'p-4')).toBe(false);
    });
  });

  describe(symbolName(parseNeighborhoodMatchesQuery), (): void => {
    it('applies defaults for a bare place id', (): void => {
      expect(parseNeighborhoodMatchesQuery({ from: 'p-42' })).toEqual({
        ok: true,
        query: {
          from: 'p-42',
          weights: NEIGHBORHOOD_DEFAULT_WEIGHTS,
          scope: 'other',
          view: null,
        },
      });
    });

    it('accepts a tract GEOID, overrides, scope, and view', (): void => {
      const result = parseNeighborhoodMatchesQuery({
        from: '06073008300',
        w: 'climate:0,vibe:90,people:150,bogus:10',
        scope: 'all',
        view: 'denver',
      });

      expect(result).toMatchObject({
        ok: true,
        query: {
          from: '06073008300',
          weights: {
            climate: 0,
            vibe: 90,
            people: 100,
            money: 50,
          },
          scope: 'all',
          view: 'denver',
        },
      });
    });

    it('rejects a missing or malformed origin', (): void => {
      expect(parseNeighborhoodMatchesQuery({}).ok).toBe(false);
      expect(parseNeighborhoodMatchesQuery({ from: 'clairemont' }).ok).toBe(false);
      expect(parseNeighborhoodMatchesQuery({ from: ['p-1'] }).ok).toBe(false);
    });

    it('rejects malformed weights and an all-zero blend', (): void => {
      expect(parseNeighborhoodMatchesQuery({ from: 'p-1', w: 'people' }).ok).toBe(false);
      expect(parseNeighborhoodMatchesQuery({ from: 'p-1', w: 'people:lots' }).ok).toBe(false);
      expect(
        parseNeighborhoodMatchesQuery({
          from: 'p-1',
          w: 'people:0,money:0,housing:0,mobility:0,vibe:0,climate:0,surroundings:0',
        }).ok,
      ).toBe(false);
    });

    it('rejects an unknown scope or view', (): void => {
      expect(parseNeighborhoodMatchesQuery({ from: 'p-1', scope: 'everywhere' }).ok).toBe(false);
      expect(parseNeighborhoodMatchesQuery({ from: 'p-1', view: 'atlantis' }).ok).toBe(false);
    });
  });
});
