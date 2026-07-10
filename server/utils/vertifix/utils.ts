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
 * ██████████████████████████████████████████ #server/utils/vertifix/utils.ts ██████████████████████████████████████████
 *
 * Pure core for the vertifix commit endpoint: parses and validates the untrusted request body into a typed commit
 * request.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { IVertifixCommitRequest } from '#shared/vertifix';

import type { TVertifixCommitParseResult } from './types';

/**
 * Parses an untrusted request body into a validated commit request, applying the documented defaults. A pure core:
 * the commit handler wraps the failure branch in a 422, and tests exercise the branches directly
 * @public
 * @function
 * @param body - The raw, untrusted request body
 * @returns The validated request, or a failure message naming the required fields
 */
export function parseVertifixCommitRequest(body: unknown): TVertifixCommitParseResult {
  // Narrow the untrusted payload to an indexable shape; a non-object body fails the numeric checks below naturally
  const raw: Partial<IVertifixCommitRequest> = (body ?? {}) as Partial<IVertifixCommitRequest>;

  // Coerce the numeric fields; NaN from a missing or malformed value fails the finite checks
  const activityId: number = Number(raw.activityId);
  const elevationFeet: number = Number(raw.elevationFeet);
  const expectedDistanceMeters: number = Number(raw.expectedDistanceMeters);

  // The TCX payload is required verbatim; the label fields fall back to their documented defaults
  const tcx: string = typeof raw.tcx === 'string' ? raw.tcx : '';
  const name: string = typeof raw.name === 'string' && raw.name ? raw.name : 'Treadmill run';
  const description: string = typeof raw.description === 'string' ? raw.description : '';

  // Reject the request when any required field is absent or malformed
  if (
    !Number.isFinite(activityId) ||
    !tcx ||
    !Number.isFinite(elevationFeet) ||
    !Number.isFinite(expectedDistanceMeters)
  ) {
    return {
      ok: false,
      message: '`activityId`, `tcx`, `elevationFeet`, and `expectedDistanceMeters` are required.',
    };
  }

  return {
    ok: true,
    request: {
      activityId,
      tcx,
      name,
      description,
      elevationFeet,
      expectedDistanceMeters,
    },
  };
}
