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
 * █████████████████████████████████████ #server/api/lab/vertifix/prepare.post.ts ██████████████████████████████████████
 *
 * Admin-only endpoint: builds the corrected-elevation TCX for the chosen activity and returns it to the browser
 * (stateless / client-held) with a summary and the Strava activity URL for the manual-delete step.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * POST /api/lab/vertifix/prepare
 *
 * ─── AUTH ────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • Admin session required (requireAdmin); non-admin sessions exit 401/403
 *
 * ─── BODY ────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • activityId
 *     - Description: The Strava activity id to build the corrected TCX for
 *     - Type: number
 *     - Required: true
 *   • elevationFeet
 *     - Description: The corrected total elevation in feet; must be non-negative
 *     - Type: number
 *     - Required: true
 *
 * ─── RETURNS ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • IVertifixPrepareResult: the corrected TCX plus an activity summary and the Strava activity URL for the
 *     manual-delete step
 *
 * ─── THROWS ──────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • 422 when activityId is not numeric, or elevationFeet is absent, non-numeric, or negative
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { H3Event } from 'h3';

import type { IVertifixPrepareRequest, IVertifixPrepareResult } from '#shared/vertifix';

/**
 * The number of feet per metre, used to report the activity's current elevation in feet
 * @internal
 */
const FEET_PER_METRE: number = 3.28084;

/**
 * Prepares a Vertifix replacement: builds the corrected-elevation TCX for the chosen activity and returns it to the
 * browser (stateless / client-held) with a summary and the Strava activity URL for the manual-delete step
 * @public
 * @default
 * @function
 * @param event - The incoming request event
 * @returns The corrected TCX plus an activity summary and the Strava activity URL for the manual-delete step
 */
export default defineEventHandler(async (event: H3Event): Promise<IVertifixPrepareResult> => {
  // Admin-only surface; anything else exits 401/403 here
  await requireAdmin(event);

  // Coerce and validate the untrusted body; a non-numeric id or missing/negative elevation exits 422
  const body: Partial<IVertifixPrepareRequest> = await readBody<Partial<IVertifixPrepareRequest>>(event);
  const activityId: number = Number(body?.activityId);
  const elevationFeet: number = Number(body?.elevationFeet);
  if (!Number.isFinite(activityId) || !Number.isFinite(elevationFeet) || elevationFeet < 0) {
    throw createError({
      statusCode: 422,
      statusMessage: 'A numeric `activityId` and non-negative `elevationFeet` are required.',
    });
  }

  // Fetch the activity summary and its raw streams from Strava in parallel
  const [activity, streams] = await Promise.all([getActivity(activityId), getStreams(activityId)]);

  // Build the corrected-elevation TCX; it stays client-held until the commit step re-uploads it
  const tcx: string = buildTcx(activity, streams, elevationFeet);

  return {
    activityId,
    tcx,
    stravaUrl: `https://www.strava.com/activities/${activityId}`,
    summary: {
      name: activity.name,
      description: activity.description ?? '',
      startDate: activity.start_date,
      distanceMeters: activity.distance,
      movingTimeSeconds: activity.moving_time,
      currentElevationFeet: Math.round(activity.total_elevation_gain * FEET_PER_METRE),
      targetElevationFeet: Math.round(elevationFeet),
    },
  };
});
