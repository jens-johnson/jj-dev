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
 * █████████████████████████████ #server/api/projects/neighborhood-explorer/places.get.ts ██████████████████████████████
 *
 * Public endpoint: searches the neighborhood explorer's covered places by name for the origin picker.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * GET /api/projects/neighborhood-explorer/places
 *
 * ─── AUTH ────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • Public; no session required
 *
 * ─── QUERY ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • q
 *     - Description: The neighborhood name (or part of it) to search for, at most 80 characters
 *     - Type: string
 *     - Required: true
 *
 * ─── RETURNS ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • INeighborhoodPlaceSummary[]: up to eight covered places, prefix matches first, then substring matches
 *
 * ─── THROWS ──────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • 422 when the q query param is absent or longer than 80 characters
 *   • 502 when the dataset asset cannot be loaded
 *
 * ─── SIDE EFFECTS ────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • Sets a public CDN Cache-Control header; the dataset only changes per deploy
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { H3Event } from 'h3';

import type { INeighborhoodPlaceSummary } from '#shared/neighborhood-explorer';
import type { INeighborhoodIndex } from '#utils/neighborhood-explorer';

/**
 * Searches the covered neighborhoods by name for the explorer's origin picker
 * @public
 * @default
 * @function
 * @param event - The incoming request event
 * @throws 422 when the q query param is absent or longer than 80 characters
 * @throws 502 when the dataset asset cannot be loaded
 * @returns Up to eight matching places, prefix matches first
 */
export default defineEventHandler(async (event: H3Event): Promise<INeighborhoodPlaceSummary[]> => {
  // Validate the untrusted search text; an absent or oversized query exits 422
  const { q }: { q?: unknown } = getQuery(event);
  if (typeof q !== 'string' || q.length > 80) {
    throw createError({
      statusCode: 422,
      statusMessage: 'A `q` search string of at most 80 characters is required.',
    });
  }

  // The dataset is immutable per deploy, so let the CDN hold popular prefixes
  setHeader(event, 'Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');

  const { dataset }: INeighborhoodIndex = await runUpstream(
    loadNeighborhoodIndex(),
    'The neighborhood dataset could not be loaded.',
  );
  return searchNeighborhoodPlaces(dataset.places, q);
});
