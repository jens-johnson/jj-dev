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
 * ██████████████████████████████████████ scripts/neighborhood-explorer/utils.ts ███████████████████████████████████████
 *
 * Pure geometry and statistics helpers for the neighborhood dataset pipeline.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/* ─── Types ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A type representing a GeoJSON linear ring as [longitude, latitude] pairs
 * @public
 */
export type TRing = [number, number][];

/**
 * A type representing a GeoJSON Polygon or MultiPolygon geometry
 * @public
 */
export type TPolygonGeometry =
  | { type: 'Polygon'; coordinates: TRing[] }
  | { type: 'MultiPolygon'; coordinates: TRing[][] };

/* ─── Geometry ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The mean Earth radius in kilometers
 * @internal
 * @constant
 */
const EARTH_RADIUS_KM: number = 6371;

/**
 * Computes the great-circle distance between two [longitude, latitude] points
 * @public
 * @function
 * @param a - The first point
 * @param b - The second point
 * @returns The distance in kilometers
 */
export function haversineKm(a: [number, number], b: [number, number]): number {
  const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
  const dLat: number = toRadians(b[1] - a[1]);
  const dLon: number = toRadians(b[0] - a[0]);
  const h: number =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a[1])) * Math.cos(toRadians(b[1])) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Tests whether a point falls inside a ring using the even-odd ray-casting rule
 * @internal
 * @function
 * @param point - The [longitude, latitude] point
 * @param ring - The ring to test against
 * @returns Whether the point is inside the ring
 */
function insideRing(point: [number, number], ring: TRing): boolean {
  let inside: boolean = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i] as [number, number];
    const [xj, yj] = ring[j] as [number, number];
    if (yi > point[1] !== yj > point[1] && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Tests whether a point falls inside a Polygon or MultiPolygon, honoring holes
 * @public
 * @function
 * @param point - The [longitude, latitude] point
 * @param geometry - The polygon geometry
 * @returns Whether the point is inside the geometry
 */
export function pointInPolygon(point: [number, number], geometry: TPolygonGeometry): boolean {
  const polygons: TRing[][] = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  return polygons.some(
    ([outer, ...holes]: TRing[]): boolean =>
      outer !== undefined && insideRing(point, outer) && !holes.some((hole: TRing): boolean => insideRing(point, hole)),
  );
}

/* ─── Statistics ─────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Converts values to percentile ranks on 0–1, averaging ties and passing nulls through. Ranks make skewed features
 * (income, density, amenity counts) comparable without hand-tuned transforms
 * @public
 * @function
 * @param values - The raw values
 * @returns The percentile of each value, in input order
 */
export function percentileRanks(values: (number | null)[]): (number | null)[] {
  // Sort the present values by magnitude, remembering where each came from
  const present: { value: number; index: number }[] = values
    .map((value: number | null, index: number) => ({ value, index }))
    .filter((entry): entry is { value: number; index: number } => entry.value !== null)
    .sort((a, b) => a.value - b.value);

  const ranks: (number | null)[] = values.map((): null => null);
  if (present.length === 1) {
    ranks[(present[0] as { index: number }).index] = 0.5;
    return ranks;
  }

  // Walk runs of equal values, giving each run the mean of the positions it spans
  let start: number = 0;
  while (start < present.length) {
    let end: number = start;
    while (end + 1 < present.length && present[end + 1]?.value === present[start]?.value) {
      end++;
    }
    const rank: number = (start + end) / 2 / (present.length - 1);
    for (let k = start; k <= end; k++) {
      ranks[(present[k] as { index: number }).index] = rank;
    }
    start = end + 1;
  }
  return ranks;
}

/**
 * Averages positional value vectors with per-entry weights, skipping nulls slot by slot
 * @public
 * @function
 * @param vectors - The vectors to blend, all the same length
 * @param weights - One weight per vector
 * @returns The blended vector; a slot is null when every vector is null there
 */
export function weightedMeanVector(vectors: (number | null)[][], weights: number[]): (number | null)[] {
  const length: number = vectors[0]?.length ?? 0;
  return Array.from({ length }, (_, slot: number): number | null => {
    let sum: number = 0;
    let total: number = 0;
    vectors.forEach((vector: (number | null)[], index: number): void => {
      const value: number | null | undefined = vector[slot];
      const weight: number = weights[index] ?? 0;
      if (value !== null && value !== undefined && weight > 0) {
        sum += value * weight;
        total += weight;
      }
    });
    return total > 0 ? sum / total : null;
  });
}

/**
 * Divides two counts, returning null when the denominator is missing or zero
 * @public
 * @function
 * @param numerator - The count of the subgroup
 * @param denominator - The count of the universe
 * @returns The share on 0–1, or null
 */
export function share(numerator: number | null, denominator: number | null): number | null {
  if (numerator === null || denominator === null || denominator <= 0) {
    return null;
  }
  return numerator / denominator;
}
