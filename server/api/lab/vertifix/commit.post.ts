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
 * ██████████████████████████████████████ #server/api/lab/vertifix/commit.post.ts ██████████████████████████████████████
 *
 * Admin-only endpoint that commits a Vertifix replacement: re-uploads the client-held TCX after the original has been
 * manually deleted on Strava, clears the trainer flag, and validates the result against the expected totals.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * POST /api/lab/vertifix/commit
 *
 * ─── AUTH ────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • Admin session required (requireAdmin); non-admin sessions exit 401/403
 *
 * ─── BODY ────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • activityId
 *     - Description: The Strava activity id being replaced
 *     - Type: number
 *     - Required: true
 *   • tcx
 *     - Description: The corrected TCX payload to upload
 *     - Type: string
 *     - Required: true
 *   • name
 *     - Description: The activity name to apply
 *     - Type: string
 *     - Required: false
 *     - Default: Treadmill run
 *   • description
 *     - Description: The activity description to apply
 *     - Type: string
 *     - Required: false
 *     - Default: (empty)
 *   • elevationFeet
 *     - Description: The corrected elevation in feet
 *     - Type: number
 *     - Required: true
 *   • expectedDistanceMeters
 *     - Description: The expected distance in meters, used to validate the re-upload
 *     - Type: number
 *     - Required: true
 *
 * ─── RETURNS ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • IVertifixCommitResult: the replacement activity id plus the distance/elevation validation verdict
 *
 * ─── THROWS ──────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • 422 when any required body field is absent or malformed
 *   • 409 when the original activity still exists on Strava (delete it there first)
 *   • 502 when a Strava call fails (existence check, upload, polling, trainer flag, or validation)
 *
 * ─── SIDE EFFECTS ────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • Uploads a new activity to Strava and clears its trainer flag
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { H3Event } from 'h3';

import type { IVertifixCommitRequest, IVertifixCommitResult } from '#shared/vertifix';
import type { IReplacementValidation, IStravaUpload } from '#utils/strava';
import type { TVertifixCommitParseResult } from '#utils/vertifix';

/**
 * Commits a Vertifix replacement: re-uploads the client-held TCX after the original activity has been manually
 * deleted on Strava, clears the trainer flag, and validates the re-upload against the expected totals
 * @public
 * @default
 * @function
 * @param event - The incoming request event
 * @throws 422 when any required body field is absent or malformed
 * @throws 409 when the original activity still exists on Strava
 * @throws 502 when a Strava call fails (existence check, upload, polling, trainer flag, or validation)
 * @returns The replacement activity id plus the distance/elevation validation verdict
 */
export default defineEventHandler(async (event: H3Event): Promise<IVertifixCommitResult> => {
  // Admin-only surface; anything else exits 401/403 here
  await requireAdmin(event);

  // Parse and validate the untrusted body through the pure core; a malformed request exits 422
  const parsed: TVertifixCommitParseResult = parseVertifixCommitRequest(await readBody(event));
  if (!parsed.ok) {
    throw createError({
      statusCode: 422,
      statusMessage: parsed.message,
    });
  }
  const { activityId, tcx, name, description, elevationFeet, expectedDistanceMeters }: IVertifixCommitRequest =
    parsed.request;

  // Hard guard: refuse to upload a duplicate until the original has been manually deleted on Strava
  if (await runUpstream(activityExists(activityId), 'The Strava existence check failed.')) {
    throw createError({
      statusCode: 409,
      statusMessage:
        'The original activity still exists on Strava. Delete it there first, then upload the replacement.',
    });
  }

  // Upload the corrected TCX, resolving the replacement id from the immediate response or by polling
  const upload: IStravaUpload = await runUpstream(
    uploadTcx(tcx, {
      id: activityId,
      name,
      description,
    }),
    'The Strava upload failed.',
  );
  const replacementActivityId: number =
    upload.activity_id ?? (await runUpstream(pollUpload(upload.id), 'Polling the Strava upload failed.'));

  // Treadmill uploads land flagged as trainer rides, which hides the map; clear the flag before validating
  await runUpstream(setTrainerFalse(replacementActivityId), 'Clearing the Strava trainer flag failed.');

  // Compare the re-upload's actual totals against the expectations from the prepare step
  const validation: IReplacementValidation = await runUpstream(
    validateReplacement(replacementActivityId, expectedDistanceMeters, elevationFeet),
    'Validating the Strava replacement failed.',
  );

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
