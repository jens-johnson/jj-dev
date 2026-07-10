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
 * ██████████████████████████████████████ #server/api/lab/vertifix/matches.get.ts ██████████████████████████████████████
 *
 * Admin-only endpoint: given a photo's capture timestamp, returns the candidate Strava runs within ±36h, nearest first,
 * so the user can pick the run a treadmill photo belongs to.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * GET /api/lab/vertifix/matches
 *
 * ─── AUTH ────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • Admin session required (requireAdmin); non-admin sessions exit 401/403
 *
 * ─── QUERY ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • capturedAt
 *     - Description: The photo's capture timestamp, as an ISO date string
 *     - Type: string
 *     - Required: true
 *
 * ─── RETURNS ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • IVertifixMatchesResult: the echoed capture timestamp plus the candidate runs within ±36h, nearest first
 *
 * ─── THROWS ──────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • 422 when the capturedAt query param is absent or is not a parseable ISO date string
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { H3Event } from 'h3';

import type { IVertifixMatchesResult } from '#shared/vertifix';

import type { IStravaActivity } from '../../../utils/strava';

/**
 * Lists the candidate Strava runs a treadmill photo could belong to: given the photo's capture timestamp, returns
 * the runs within ±36h, nearest first
 * @public
 * @default
 * @function
 * @param event - The incoming request event
 * @returns The echoed capture timestamp plus the candidate runs, nearest first
 */
export default defineEventHandler(async (event: H3Event): Promise<IVertifixMatchesResult> => {
  // Admin-only surface; anything else exits 401/403 here
  await requireAdmin(event);

  // Validate the untrusted query param; a missing or unparseable timestamp exits 422
  const { capturedAt } = getQuery(event);
  if (typeof capturedAt !== 'string' || Number.isNaN(Date.parse(capturedAt))) {
    throw createError({
      statusCode: 422,
      statusMessage: 'A valid ISO `capturedAt` query param is required.',
    });
  }

  // Pull the runs near the capture time from Strava, then trim each candidate to the fields the picker renders
  const activities: IStravaActivity[] = await activitiesNear(capturedAt);
  return {
    capturedAt,
    candidates: activities.map((activity) => ({
      id: activity.id,
      name: activity.name,
      startDate: activity.start_date,
      distanceMeters: activity.distance,
      movingTimeSeconds: activity.moving_time,
      elevationGainMeters: activity.total_elevation_gain,
    })),
  };
});
