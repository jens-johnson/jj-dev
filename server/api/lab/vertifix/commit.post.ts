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
 * ██████████████████████████████████████ server/api/lab/vertifix/commit.post.ts ███████████████████████████████████████
 *
 * Admin-only endpoint: re-uploads the client-held TCX after the original has been manually deleted. Guards
 * with a 409 if the original still exists, then uploads, clears the trainer flag, and validates the result.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type { IVertifixCommitRequest, IVertifixCommitResult } from '#shared/vertifix';

export default defineEventHandler(async (event): Promise<IVertifixCommitResult> => {
  await requireAdmin(event);

  const body = await readBody<Partial<IVertifixCommitRequest>>(event);
  const activityId = Number(body?.activityId);
  const elevationFeet = Number(body?.elevationFeet);
  const expectedDistanceMeters = Number(body?.expectedDistanceMeters);
  const tcx = typeof body?.tcx === 'string' ? body.tcx : '';
  const name = typeof body?.name === 'string' && body.name ? body.name : 'Treadmill run';
  const description = typeof body?.description === 'string' ? body.description : '';

  if (
    !Number.isFinite(activityId) ||
    !tcx ||
    !Number.isFinite(elevationFeet) ||
    !Number.isFinite(expectedDistanceMeters)
  ) {
    throw createError({
      statusCode: 422,
      statusMessage: '`activityId`, `tcx`, `elevationFeet`, and `expectedDistanceMeters` are required.',
    });
  }

  // Hard guard: refuse to upload a duplicate until the original has been manually deleted on Strava.
  if (await activityExists(activityId)) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'The original activity still exists on Strava. Delete it there first, then upload the replacement.',
    });
  }

  const upload = await uploadTcx(tcx, { id: activityId, name, description });
  const replacementActivityId = upload.activity_id ?? (await pollUpload(upload.id));
  await setTrainerFalse(replacementActivityId);

  const validation = await validateReplacement(replacementActivityId, expectedDistanceMeters, elevationFeet);

  return {
    ok: validation.valid,
    replacementActivityId,
    validation: {
      valid: validation.valid,
      distanceValid: validation.distanceValid,
      elevationValid: validation.elevationValid,
      actualDistanceMeters: validation.actualDistanceMeters,
      actualElevationFeet: validation.actualElevationFeet,
    },
  };
});
