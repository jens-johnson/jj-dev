/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                ██        ██                     ▄▄
 *                                ▀▀        ▀▀                     ██
 *                              ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                             ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * ██████████████████████████████████████ server/api/lab/vertifix/prepare.post.ts ██████████████████████████████████████
 *
 * Admin-only endpoint: builds the corrected-elevation TCX for the chosen activity and returns it to the
 * browser (stateless / client-held) with a summary and the Strava activity URL for the manual-delete step.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type { VertifixPrepareRequest, VertifixPrepareResult } from '#shared/vertifix';

const FEET_PER_METRE = 3.28084;

export default defineEventHandler(async (event): Promise<VertifixPrepareResult> => {
  await requireAdmin(event);

  const body = await readBody<Partial<VertifixPrepareRequest>>(event);
  const activityId = Number(body?.activityId);
  const elevationFeet = Number(body?.elevationFeet);
  if (!Number.isFinite(activityId) || !Number.isFinite(elevationFeet) || elevationFeet < 0) {
    throw createError({
      statusCode: 422,
      statusMessage: 'A numeric `activityId` and non-negative `elevationFeet` are required.',
    });
  }

  const [activity, streams] = await Promise.all([getActivity(activityId), getStreams(activityId)]);
  const tcx = buildTcx(activity, streams, elevationFeet);

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
