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
 * ███████████████████████████████████ #server/utils/neighborhood-explorer/utils.ts ████████████████████████████████████
 *
 * Pure scoring core for the neighborhood explorer: profile comparison, ranking, place search, and query parsing.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type {
  INeighborhoodFeatureDefinition,
  INeighborhoodFeatureDelta,
  INeighborhoodLensDefinition,
  INeighborhoodMatch,
  INeighborhoodMetro,
  INeighborhoodPlaceSummary,
  TNeighborhoodLens,
  TNeighborhoodMatchScope,
  TNeighborhoodWeights,
} from '#shared/neighborhood-explorer';
import {
  NEIGHBORHOOD_DEFAULT_WEIGHTS,
  NEIGHBORHOOD_FEATURES,
  NEIGHBORHOOD_LENSES,
  NEIGHBORHOOD_METROS,
} from '#shared/neighborhood-explorer';
import { defineSymbol } from '#shared/utils/symbol';

import type {
  INeighborhoodComparison,
  INeighborhoodDatasetPlace,
  INeighborhoodProfile,
  TNeighborhoodMatchesParseResult,
} from './types';

/* ─── Constants ──────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The expected RMS gap between two independent uniform percentiles (√(1/6)); the distance that maps to similarity 0,
 * so 100 reads as identical and 0 as "about as different as two places picked at random"
 * @internal
 * @constant
 */
const RANDOM_PAIR_DISTANCE: number = Math.sqrt(1 / 6);

/**
 * The positional feature slots belonging to each lens
 * @internal
 * @constant
 */
const LENS_SLOTS: Record<TNeighborhoodLens, number[]> = NEIGHBORHOOD_LENSES.reduce(
  (slots, lens: INeighborhoodLensDefinition) => ({
    ...slots,
    [lens.id]: NEIGHBORHOOD_FEATURES.flatMap((feature: INeighborhoodFeatureDefinition, slot: number): number[] =>
      feature.lens === lens.id ? [slot] : [],
    ),
  }),
  {} as Record<TNeighborhoodLens, number[]>,
);

/**
 * The lens identifiers, for validating weight keys
 * @internal
 * @constant
 */
const LENS_IDS: TNeighborhoodLens[] = NEIGHBORHOOD_LENSES.map((lens: INeighborhoodLensDefinition) => lens.id);

/**
 * The number of ranked matches returned
 * @internal
 * @constant
 */
const MATCH_LIMIT: number = 20;

/**
 * The number of biggest differences returned per match
 * @internal
 * @constant
 */
const DIFFERENCE_LIMIT: number = 3;

/* ─── Scoring ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Converts an RMS percentile distance into the 0–100 similarity scale
 * @internal
 * @function
 * @param distance - The RMS percentile gap
 * @returns The similarity, clamped to 0–100 and rounded to one decimal
 */
function toSimilarity(distance: number): number {
  const scaled: number = Math.min(1, Math.max(0, 1 - distance / RANDOM_PAIR_DISTANCE));
  return Math.round(scaled * 1000) / 10;
}

/**
 * Compares two percentile vectors lens by lens, then blends the lenses by weight. Within a lens every feature counts
 * equally and only slots present on both sides contribute, so a missing estimate never reads as a difference
 * @public
 * @function
 * @param origin - The origin's percentile vector
 * @param candidate - The candidate's percentile vector
 * @param weights - The lens weights on 0–100
 * @returns The overall and per-lens similarity on 0–100
 */
export function compareNeighborhoodProfiles(
  origin: (number | null)[],
  candidate: (number | null)[],
  weights: TNeighborhoodWeights,
): INeighborhoodComparison {
  const lenses: Record<TNeighborhoodLens, number | null> = {} as Record<TNeighborhoodLens, number | null>;
  let weightedSquares: number = 0;
  let totalWeight: number = 0;

  for (const lens of LENS_IDS) {
    // Mean squared percentile gap across the lens's features both sides carry
    let squares: number = 0;
    let count: number = 0;
    for (const slot of LENS_SLOTS[lens]) {
      const a: number | null | undefined = origin[slot];
      const b: number | null | undefined = candidate[slot];
      if (a !== null && a !== undefined && b !== null && b !== undefined) {
        squares += (a - b) ** 2;
        count++;
      }
    }
    if (!count) {
      lenses[lens] = null;
      continue;
    }

    const meanSquare: number = squares / count;
    lenses[lens] = toSimilarity(Math.sqrt(meanSquare));
    weightedSquares += weights[lens] * meanSquare;
    totalWeight += weights[lens];
  }

  return {
    similarity: totalWeight > 0 ? toSimilarity(Math.sqrt(weightedSquares / totalWeight)) : 0,
    lenses,
  };
}

/**
 * Lists the features where a candidate differs most from the origin, restricted to lenses that carry weight
 * @public
 * @function
 * @param origin - The origin profile
 * @param candidate - The candidate profile
 * @param weights - The lens weights; zero-weight lenses are ignored
 * @returns The largest percentile gaps, largest first
 */
export function neighborhoodDifferences(
  origin: INeighborhoodProfile,
  candidate: INeighborhoodProfile,
  weights: TNeighborhoodWeights,
): INeighborhoodFeatureDelta[] {
  return NEIGHBORHOOD_FEATURES.flatMap((feature: INeighborhoodFeatureDefinition, slot: number) => {
    const a: number | null | undefined = origin.pct[slot];
    const b: number | null | undefined = candidate.pct[slot];
    if (weights[feature.lens] <= 0 || a === null || a === undefined || b === null || b === undefined) {
      return [];
    }
    return [
      {
        key: feature.key,
        origin: origin.raw[slot] ?? null,
        match: candidate.raw[slot] ?? null,
        gap: Math.round(Math.abs(a - b) * 1000) / 1000,
      },
    ];
  })
    .sort((x: INeighborhoodFeatureDelta, y: INeighborhoodFeatureDelta) => y.gap - x.gap)
    .slice(0, DIFFERENCE_LIMIT);
}

/* ─── Places ─────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Formats a metro's display label (i.e. "San Diego, CA"), falling back to the slug for unknown metros
 * @public
 * @function
 * @param metroId - The metro slug
 * @returns The display label
 */
export function neighborhoodMetroLabel(metroId: string): string {
  const metro: INeighborhoodMetro | undefined = NEIGHBORHOOD_METROS.find(
    (candidate: INeighborhoodMetro) => candidate.id === metroId,
  );
  return metro ? `${metro.name}, ${metro.state}` : metroId;
}

/**
 * Trims a dataset place to the summary the client renders
 * @public
 * @function
 * @param place - The dataset place
 * @returns The place summary
 */
export function toNeighborhoodPlaceSummary(place: INeighborhoodDatasetPlace): INeighborhoodPlaceSummary {
  return {
    id: place.id,
    name: place.name,
    metro: place.metro,
    metroLabel: neighborhoodMetroLabel(place.metro),
  };
}

/**
 * Searches places by name: prefix matches first, then substring matches, each alphabetical
 * @public
 * @function
 * @param places - Every dataset place
 * @param query - The raw search text
 * @param limit - The maximum number of results
 * @returns The matching place summaries
 */
export function searchNeighborhoodPlaces(
  places: INeighborhoodDatasetPlace[],
  query: string,
  limit: number = 8,
): INeighborhoodPlaceSummary[] {
  const needle: string = query.trim().toLowerCase();
  if (!needle) {
    return [];
  }

  const ranked: { place: INeighborhoodDatasetPlace; rank: number }[] = places.flatMap(
    (place: INeighborhoodDatasetPlace) => {
      const name: string = place.name.toLowerCase();
      if (name.startsWith(needle)) {
        return [{ place, rank: 0 }];
      }
      return name.includes(needle) ? [{ place, rank: 1 }] : [];
    },
  );

  return ranked
    .sort((a, b) => a.rank - b.rank || a.place.name.localeCompare(b.place.name))
    .slice(0, limit)
    .map(({ place }) => toNeighborhoodPlaceSummary(place));
}

/**
 * Finds the named place closest to a point within one metro, for labeling a bare tract
 * @public
 * @function
 * @param point - The [longitude, latitude] point
 * @param places - Every dataset place
 * @param metro - The metro to search within
 * @returns The nearest place, or undefined when the metro has none
 */
export function nearestNeighborhoodPlace(
  point: [number, number],
  places: INeighborhoodDatasetPlace[],
  metro: string,
): INeighborhoodDatasetPlace | undefined {
  // An equirectangular approximation is plenty for ranking points a few kilometers apart
  const scale: number = Math.cos((point[1] * Math.PI) / 180);
  let nearest: INeighborhoodDatasetPlace | undefined;
  let best: number = Infinity;
  for (const place of places) {
    if (place.metro !== metro) {
      continue;
    }
    const distance: number = ((place.centroid[0] - point[0]) * scale) ** 2 + (place.centroid[1] - point[1]) ** 2;
    if (distance < best) {
      best = distance;
      nearest = place;
    }
  }
  return nearest;
}

/**
 * Ranks every candidate place against the origin. Places in the origin's metro are skipped for the "other" scope,
 * and places sharing a tract with the origin are always skipped so the origin never matches itself under another
 * name
 * @public
 * @function
 * @param origin - The origin profile and the tracts it covers
 * @param places - Every dataset place
 * @param weights - The lens weights
 * @param scope - Which metros to rank
 * @returns The top matches, most similar first
 */
export function rankNeighborhoodMatches(
  origin: { profile: INeighborhoodProfile; tracts: string[] },
  places: INeighborhoodDatasetPlace[],
  weights: TNeighborhoodWeights,
  scope: TNeighborhoodMatchScope,
): INeighborhoodMatch[] {
  const originTracts: Set<string> = new Set(origin.tracts);

  return places
    .filter(
      (place: INeighborhoodDatasetPlace) =>
        (scope === 'all' || place.metro !== origin.profile.metro) &&
        !place.tracts.some((geoid: string) => originTracts.has(geoid)),
    )
    .map((place: INeighborhoodDatasetPlace) => ({
      place,
      comparison: compareNeighborhoodProfiles(origin.profile.pct, place.pct, weights),
    }))
    .sort((a, b) => b.comparison.similarity - a.comparison.similarity)
    .slice(0, MATCH_LIMIT)
    .map(
      ({ place, comparison }): INeighborhoodMatch => ({
        place: toNeighborhoodPlaceSummary(place),
        centroid: place.centroid,
        similarity: comparison.similarity,
        lenses: LENS_IDS.map((lens: TNeighborhoodLens) => ({ lens, similarity: comparison.lenses[lens] })),
        differences: neighborhoodDifferences(origin.profile, place, weights),
      }),
    );
}

/* ─── Query parsing ──────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Applies untrusted `lens:weight` overrides to the default weights; unknown lenses are ignored and values clamp
 * @internal
 * @function
 * @param raw - The raw `w` query value
 * @returns The weights, or null when the value is malformed
 */
function parseWeightOverrides(raw: unknown): TNeighborhoodWeights | null {
  const weights: TNeighborhoodWeights = { ...NEIGHBORHOOD_DEFAULT_WEIGHTS };
  if (raw === undefined || raw === '') {
    return weights;
  }
  if (typeof raw !== 'string') {
    return null;
  }
  for (const pair of raw.split(',')) {
    const [lens, text] = pair.split(':');
    const value: number = Number(text);
    if (!lens || text === undefined || text === '' || !Number.isFinite(value)) {
      return null;
    }
    if ((LENS_IDS as string[]).includes(lens)) {
      weights[lens as TNeighborhoodLens] = Math.min(100, Math.max(0, value));
    }
  }
  return weights;
}

/**
 * Parses an untrusted matches query. `from` is required (a place id or an 11-digit GEOID); `w` carries
 * comma-separated `lens:weight` overrides on 0–100 (unknown lenses are ignored, values clamp); `scope` is `other`
 * (default) or `all`; `view` names a covered metro
 * @public
 * @function
 * @param query - The raw query object from getQuery
 * @returns The validated query, or a failure message for the 422 response
 */
export function parseNeighborhoodMatchesQuery(query: Record<string, unknown>): TNeighborhoodMatchesParseResult {
  const from: unknown = query.from;
  if (typeof from !== 'string' || !/^(p-\d+|\d{11})$/.test(from)) {
    return { ok: false, message: 'A `from` place id (`p-<id>`) or 11-digit tract GEOID is required.' };
  }

  // Start from the defaults and apply each well-formed override
  const weights: TNeighborhoodWeights | null = parseWeightOverrides(query.w);
  if (!weights) {
    return { ok: false, message: '`w` must be a comma-separated list of `lens:weight` pairs.' };
  }
  if (LENS_IDS.every((lens: TNeighborhoodLens) => weights[lens] === 0)) {
    return { ok: false, message: 'At least one lens needs a weight above zero.' };
  }

  const scope: unknown = query.scope ?? 'other';
  if (scope !== 'other' && scope !== 'all') {
    return { ok: false, message: '`scope` must be `other` or `all`.' };
  }

  const view: unknown = query.view;
  if (
    view !== undefined &&
    view !== '' &&
    !NEIGHBORHOOD_METROS.some((metro: INeighborhoodMetro) => metro.id === view)
  ) {
    return { ok: false, message: '`view` must name a covered metro.' };
  }

  return {
    ok: true,
    query: {
      from,
      weights,
      scope,
      view: typeof view === 'string' && view ? view : null,
    },
  };
}

/* ─── Metadata ───────────────────────────────────────────────────────────────────────────────────────────────────── */

// Register readable names/descriptions so the unit suites can title their describe blocks from the source symbols
defineSymbol(compareNeighborhoodProfiles, {
  name: 'Compare Neighborhood Profiles',
  description: 'Scores two percentile vectors lens by lens and blends them by weight.',
});
defineSymbol(neighborhoodDifferences, {
  name: 'Neighborhood Differences',
  description: 'Lists the weighted features where a candidate differs most from the origin.',
});
defineSymbol(searchNeighborhoodPlaces, {
  name: 'Search Neighborhood Places',
  description: 'Finds places by name, prefix matches first.',
});
defineSymbol(nearestNeighborhoodPlace, {
  name: 'Nearest Neighborhood Place',
  description: 'Finds the named place closest to a point within one metro.',
});
defineSymbol(rankNeighborhoodMatches, {
  name: 'Rank Neighborhood Matches',
  description: 'Ranks every candidate place against the origin profile.',
});
defineSymbol(parseNeighborhoodMatchesQuery, {
  name: 'Parse Neighborhood Matches Query',
  description: 'Validates an untrusted matches query into weights, scope, and view.',
});
