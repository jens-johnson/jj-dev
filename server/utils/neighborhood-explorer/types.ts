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
 * ███████████████████████████████████ #server/utils/neighborhood-explorer/types.ts ████████████████████████████████████
 *
 * Type definitions for the neighborhood explorer server utils: the dataset shape, comparison, and query parsing.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { TNeighborhoodLens, TNeighborhoodMatchScope, TNeighborhoodWeights } from '#shared/neighborhood-explorer';

/* ─── Dataset ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * An interface representing a comparable profile; a tract or a named place, with values stored positionally in
 * `NEIGHBORHOOD_FEATURES` order
 * @public
 * @interface
 */
export interface INeighborhoodProfile {
  /* The metro slug the profile belongs to */
  metro: string;

  /* The representative point as [longitude, latitude] */
  centroid: [number, number];

  /* The raw feature values; null where the source had no estimate */
  raw: (number | null)[];

  /* The feature percentiles across every covered tract on 0–1; null where the raw value is missing */
  pct: (number | null)[];
}

/**
 * An interface representing a census tract in the dataset
 * @public
 * @interface
 */
export interface INeighborhoodDatasetTract extends INeighborhoodProfile {
  /* The 11-digit tract GEOID */
  geoid: string;

  /* The total population estimate */
  population: number;
}

/**
 * An interface representing a named neighborhood in the dataset; its profile is the population-weighted blend of
 * the tracts around its OpenStreetMap place node
 * @public
 * @interface
 */
export interface INeighborhoodDatasetPlace extends INeighborhoodProfile {
  /* The place identifier (i.e. "p-4837263739", from the OSM node id) */
  id: string;

  /* The neighborhood name */
  name: string;

  /* The GEOIDs of the tracts blended into the profile */
  tracts: string[];
}

/**
 * An interface representing the precomputed dataset the pipeline writes to server assets
 * @public
 * @interface
 */
export interface INeighborhoodDataset {
  /* The ACS release the demographics come from (i.e. "ACS 2024 5-year") */
  release: string;

  /* When the pipeline produced the dataset, as an ISO string */
  builtAt: string;

  /* The feature keys in stored order; the loader checks them against `NEIGHBORHOOD_FEATURES` */
  featureKeys: string[];

  /* Every tract above the population floor */
  tracts: INeighborhoodDatasetTract[];

  /* Every named neighborhood with at least one covered tract */
  places: INeighborhoodDatasetPlace[];
}

/**
 * An interface representing the loaded dataset plus its id lookups
 * @public
 * @interface
 */
export interface INeighborhoodIndex {
  /* The dataset as the pipeline wrote it */
  dataset: INeighborhoodDataset;

  /* Tracts keyed by GEOID */
  tracts: Map<string, INeighborhoodDatasetTract>;

  /* Places keyed by place id */
  places: Map<string, INeighborhoodDatasetPlace>;
}

/* ─── Scoring ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * An interface representing the result of comparing two profiles
 * @public
 * @interface
 */
export interface INeighborhoodComparison {
  /* The overall weighted similarity on 0–100 */
  similarity: number;

  /* The per-lens similarity on 0–100, null where either side lacks data for the lens */
  lenses: Record<TNeighborhoodLens, number | null>;
}

/**
 * An interface representing a validated matches query
 * @public
 * @interface
 */
export interface INeighborhoodMatchesQuery {
  /* The origin id; a place id or an 11-digit tract GEOID */
  from: string;

  /* The lens weights after defaults and clamping */
  weights: TNeighborhoodWeights;

  /* Which metros to rank */
  scope: TNeighborhoodMatchScope;

  /* The metro whose tract scores to return, or null to use the origin's metro */
  view: string | null;
}

/**
 * A type representing the result of parsing an untrusted matches query
 * @public
 */
export type TNeighborhoodMatchesParseResult =
  | { ok: true; query: INeighborhoodMatchesQuery }
  | { ok: false; message: string };
