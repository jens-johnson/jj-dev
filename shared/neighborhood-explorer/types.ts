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
 * ██████████████████████████████████████ #shared/neighborhood-explorer/types.ts ███████████████████████████████████████
 *
 * Shared data-transfer types for the neighborhood explorer: lenses, features, metros, and the API contracts.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/* ─── Lenses & features ──────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A type representing one lens; a themed group of features that the explorer weights as a unit (one slider each)
 * @public
 */
export type TNeighborhoodLens = 'people' | 'money' | 'housing' | 'mobility' | 'vibe' | 'climate' | 'surroundings';

/**
 * A type representing how a feature's raw value renders in the UI
 * @public
 */
export type TNeighborhoodFeatureFormat =
  | 'usd'
  | 'percent'
  | 'number'
  | 'year'
  | 'temperature'
  | 'inches'
  | 'days'
  | 'density'
  | 'count';

/**
 * A type representing the per-lens slider weights, each on the 0–100 scale the controls render
 * @public
 */
export type TNeighborhoodWeights = Record<TNeighborhoodLens, number>;

/**
 * A type representing which metros a match search ranks: every metro, or only metros other than the origin's
 * @public
 */
export type TNeighborhoodMatchScope = 'all' | 'other';

/**
 * An interface representing a lens's display metadata
 * @public
 * @interface
 */
export interface INeighborhoodLensDefinition {
  /* The lens identifier */
  id: TNeighborhoodLens;

  /* The short slider label (i.e. "People") */
  label: string;

  /* A one-line hint describing what the lens compares */
  hint: string;
}

/**
 * An interface representing one comparable feature; the dataset stores values positionally in this order
 * @public
 * @interface
 */
export interface INeighborhoodFeatureDefinition {
  /* The stable feature key (i.e. "medianIncome") */
  key: string;

  /* The human-readable label (i.e. "Median household income") */
  label: string;

  /* The lens the feature belongs to */
  lens: TNeighborhoodLens;

  /* How the raw value renders */
  format: TNeighborhoodFeatureFormat;
}

/**
 * An interface representing a metro the dataset covers; one or more counties sharing a map view
 * @public
 * @interface
 */
export interface INeighborhoodMetro {
  /* The metro slug (i.e. "san-diego") */
  id: string;

  /* The display name (i.e. "San Diego") */
  name: string;

  /* The state abbreviation shown beside the name */
  state: string;

  /* The [stateFips, countyFips] pairs whose tracts make up the metro */
  counties: [string, string][];

  /* The initial map center as [longitude, latitude] */
  center: [number, number];

  /* The initial map zoom */
  zoom: number;
}

/* ─── API contracts ──────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * An interface representing a searchable named neighborhood, trimmed to what the search box renders
 * @public
 * @interface
 */
export interface INeighborhoodPlaceSummary {
  /* The place identifier; a named place id (i.e. "p-4837263739") or a bare 11-digit tract GEOID */
  id: string;

  /* The neighborhood name (i.e. "Clairemont") */
  name: string;

  /* The metro slug the place belongs to */
  metro: string;

  /* The metro's display label (i.e. "San Diego, CA") */
  metroLabel: string;
}

/**
 * An interface representing one feature's value for a place: the raw value plus its national-sample percentile
 * @public
 * @interface
 */
export interface INeighborhoodFeatureValue {
  /* The feature key */
  key: string;

  /* The raw value, or null when the source had no estimate */
  value: number | null;

  /* The percentile across every covered tract on 0–1, or null when the value is missing */
  percentile: number | null;
}

/**
 * An interface representing a lens's similarity between the origin and a match
 * @public
 * @interface
 */
export interface INeighborhoodLensScore {
  /* The lens identifier */
  lens: TNeighborhoodLens;

  /* The similarity on 0–100, or null when neither side has data for the lens */
  similarity: number | null;
}

/**
 * An interface representing one feature where a match differs from the origin, for the "why" breakdown
 * @public
 * @interface
 */
export interface INeighborhoodFeatureDelta {
  /* The feature key */
  key: string;

  /* The origin's raw value */
  origin: number | null;

  /* The match's raw value */
  match: number | null;

  /* The absolute percentile gap on 0–1 */
  gap: number;
}

/**
 * An interface representing a ranked neighborhood match
 * @public
 * @interface
 */
export interface INeighborhoodMatch {
  /* The matched place */
  place: INeighborhoodPlaceSummary;

  /* The place centroid as [longitude, latitude], for flying the map to it */
  centroid: [number, number];

  /* The overall weighted similarity on 0–100 (100 = identical, 0 = as different as a typical random pair) */
  similarity: number;

  /* The per-lens similarity breakdown */
  lenses: INeighborhoodLensScore[];

  /* The features that differ most, largest gap first */
  differences: INeighborhoodFeatureDelta[];
}

/**
 * An interface representing the matches endpoint's response
 * @public
 * @interface
 */
export interface INeighborhoodMatchesResult {
  /* The origin place */
  origin: INeighborhoodPlaceSummary;

  /* The origin centroid as [longitude, latitude] */
  originCentroid: [number, number];

  /* The GEOIDs of the tracts the origin covers, for outlining it on the map */
  originTracts: string[];

  /* The origin's per-feature values, in feature-definition order */
  originFeatures: INeighborhoodFeatureValue[];

  /* The weights the ranking used, after defaults and clamping */
  weights: TNeighborhoodWeights;

  /* The ranked matches, most similar first */
  matches: INeighborhoodMatch[];

  /* The metro whose tract scores are included for the map */
  view: string;

  /* Per-tract similarity on 0–100 for the viewed metro, keyed by GEOID; low-population tracts are omitted */
  tractScores: Record<string, number>;
}
