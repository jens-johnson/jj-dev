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
 * ██████████████████████████████████████ server/api/lab/vertifix/matches.get.ts ███████████████████████████████████████
 *
 * Admin-only endpoint: given a photo's capture timestamp, returns the candidate Strava runs within ±36h,
 * nearest first, so the user can pick the run a treadmill photo belongs to.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type { IVertifixMatchesResult } from '#shared/vertifix';

export default defineEventHandler(async (event): Promise<IVertifixMatchesResult> => {
  await requireAdmin(event);

  const { capturedAt } = getQuery(event);
  if (typeof capturedAt !== 'string' || Number.isNaN(Date.parse(capturedAt))) {
    throw createError({ statusCode: 422, statusMessage: 'A valid ISO `capturedAt` query param is required.' });
  }

  const activities = await activitiesNear(capturedAt);
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
