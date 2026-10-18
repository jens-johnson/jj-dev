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
 * █████████████████████████████ #server/api/projects/neighborhood-explorer/matches.get.ts █████████████████████████████
 *
 * Public endpoint: ranks covered neighborhoods by similarity to an origin under lens weights and scores the viewed
 * metro's tracts.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * GET /api/projects/neighborhood-explorer/matches
 *
 * ─── AUTH ────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • Public; no session required
 *
 * ─── QUERY ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • from
 *     - Description: The origin: a place id (p-<osm node id>) or an 11-digit tract GEOID
 *     - Type: string
 *     - Required: true
 *   • w
 *     - Description: Comma-separated lens:weight overrides on 0–100 (i.e. climate:0,vibe:90); unknown lenses are
 *         ignored and values clamp; omitted lenses default to 50
 *     - Type: string
 *     - Required: false
 *   • scope
 *     - Description: Which metros to rank: other (default; skip the origin's metro) or all
 *     - Type: string
 *     - Required: false
 *   • view
 *     - Description: The covered metro whose tract scores to return; defaults to the origin's metro
 *     - Type: string
 *     - Required: false
 *
 * ─── RETURNS ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • INeighborhoodMatchesResult: the origin profile, the top 20 matches with per-lens scores and biggest gaps, and
 *     per-tract scores for the viewed metro
 *
 * ─── THROWS ──────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • 422 when the from, w, scope, or view query params are absent or malformed
 *   • 404 when the from id names no covered place or tract
 *   • 502 when the dataset asset cannot be loaded
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { H3Event } from 'h3';

import type {
  INeighborhoodFeatureDefinition,
  INeighborhoodMatchesResult,
  INeighborhoodPlaceSummary,
} from '#shared/neighborhood-explorer';
import { NEIGHBORHOOD_FEATURES } from '#shared/neighborhood-explorer';
import type {
  INeighborhoodDatasetPlace,
  INeighborhoodDatasetTract,
  INeighborhoodIndex,
  INeighborhoodProfile,
  TNeighborhoodMatchesParseResult,
} from '#utils/neighborhood-explorer';

/**
 * Ranks the covered neighborhoods by similarity to an origin place or tract under the given lens weights, and scores
 * every tract in the viewed metro for the map
 * @public
 * @default
 * @function
 * @param event - The incoming request event
 * @throws 422 when the from, w, scope, or view query params are absent or malformed
 * @throws 404 when the from id names no covered place or tract
 * @throws 502 when the dataset asset cannot be loaded
 * @returns The origin profile, the ranked matches, and the viewed metro's tract scores
 */
export default defineEventHandler(async (event: H3Event): Promise<INeighborhoodMatchesResult> => {
  // Validate the untrusted query; any malformed param exits 422 with the parser's message
  const parsed: TNeighborhoodMatchesParseResult = parseNeighborhoodMatchesQuery(getQuery(event));
  if (!parsed.ok) {
    throw createError({ statusCode: 422, statusMessage: parsed.message });
  }
  const { from, weights, scope, view } = parsed.query;

  const { dataset, places, tracts }: INeighborhoodIndex = await runUpstream(
    loadNeighborhoodIndex(),
    'The neighborhood dataset could not be loaded.',
  );

  // Resolve the origin: a named place, or a bare tract labeled after the nearest named place
  let origin: { summary: INeighborhoodPlaceSummary; profile: INeighborhoodProfile; tracts: string[] };
  const place: INeighborhoodDatasetPlace | undefined = places.get(from);
  const tract: INeighborhoodDatasetTract | undefined = tracts.get(from);
  if (place) {
    origin = {
      summary: toNeighborhoodPlaceSummary(place),
      profile: place,
      tracts: place.tracts,
    };
  } else if (tract) {
    const nearest: INeighborhoodDatasetPlace | undefined = nearestNeighborhoodPlace(
      tract.centroid,
      dataset.places,
      tract.metro,
    );
    origin = {
      summary: {
        id: tract.geoid,
        name: nearest ? `Near ${nearest.name}` : `Tract ${tract.geoid.slice(5)}`,
        metro: tract.metro,
        metroLabel: neighborhoodMetroLabel(tract.metro),
      },
      profile: tract,
      tracts: [tract.geoid],
    };
  } else {
    throw createError({ statusCode: 404, statusMessage: `No covered neighborhood or tract matches \`${from}\`.` });
  }

  // Score every tract in the viewed metro for the map; whole numbers keep the payload small
  const viewMetro: string = view ?? origin.profile.metro;
  const tractScores: Record<string, number> = {};
  for (const candidate of dataset.tracts) {
    if (candidate.metro === viewMetro) {
      tractScores[candidate.geoid] = Math.round(
        compareNeighborhoodProfiles(origin.profile.pct, candidate.pct, weights).similarity,
      );
    }
  }

  return {
    origin: origin.summary,
    originCentroid: origin.profile.centroid,
    originTracts: origin.tracts,
    originFeatures: NEIGHBORHOOD_FEATURES.map((feature: INeighborhoodFeatureDefinition, slot: number) => ({
      key: feature.key,
      value: origin.profile.raw[slot] ?? null,
      percentile: origin.profile.pct[slot] ?? null,
    })),
    weights,
    matches: rankNeighborhoodMatches(origin, dataset.places, weights, scope),
    view: viewMetro,
    tractScores,
  };
});
