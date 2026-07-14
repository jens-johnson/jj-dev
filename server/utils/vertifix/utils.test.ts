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
 * ███████████████████████████████████████ #server/utils/vertifix/utils.test.ts ████████████████████████████████████████
 *
 * Unit tests for the vertifix commit-request parser: defaults, coercion, required-field rejection, and edge values.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { getTestFileName } from '@jens-johnson/style-guide/test-utils';
import { describe, expect, it } from 'vitest';

import { symbolName } from '#shared/utils/symbol';

import { parseVertifixCommitRequest } from './utils';

/* ─── Fixtures ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A fully-populated, valid body as the client sends it
 * @internal
 * @constant
 */
const validBody: Record<string, unknown> = {
  activityId: 123456,
  tcx: '<TrainingCenterDatabase />',
  name: 'Morning treadmill',
  description: 'Corrected elevation',
  elevationFeet: 150,
  expectedDistanceMeters: 5000,
};

/* ─── Tests ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

describe(getTestFileName(import.meta.url), (): void => {
  describe(symbolName(parseVertifixCommitRequest), (): void => {
    it('returns the validated request verbatim for a fully-populated body', (): void => {
      expect(parseVertifixCommitRequest(validBody)).toEqual({
        ok: true,
        request: {
          activityId: 123456,
          tcx: '<TrainingCenterDatabase />',
          name: 'Morning treadmill',
          description: 'Corrected elevation',
          elevationFeet: 150,
          expectedDistanceMeters: 5000,
        },
      });
    });

    it('applies the documented defaults for the optional label fields', (): void => {
      const result = parseVertifixCommitRequest({
        ...validBody,
        name: undefined,
        description: undefined,
      });

      // The name falls back to the treadmill default and the description to empty
      expect(result).toMatchObject({ ok: true, request: { name: 'Treadmill run', description: '' } });
    });

    it('coerces numeric strings the way a form submission delivers them', (): void => {
      const result = parseVertifixCommitRequest({
        ...validBody,
        activityId: '123456',
        elevationFeet: '150.5',
      });

      expect(result).toMatchObject({ ok: true, request: { activityId: 123456, elevationFeet: 150.5 } });
    });

    it('rejects a body missing any required field with the naming message', (): void => {
      for (const key of ['activityId', 'tcx', 'elevationFeet', 'expectedDistanceMeters']) {
        const result = parseVertifixCommitRequest({ ...validBody, [key]: undefined });

        expect(result).toEqual({
          ok: false,
          message: '`activityId`, `tcx`, `elevationFeet`, and `expectedDistanceMeters` are required.',
        });
      }
    });

    it('rejects non-object bodies without throwing', (): void => {
      expect(parseVertifixCommitRequest(null).ok).toBe(false);
      expect(parseVertifixCommitRequest(undefined).ok).toBe(false);
      expect(parseVertifixCommitRequest('nonsense').ok).toBe(false);
    });

    it('treats zero as a valid numeric value rather than a missing one', (): void => {
      // Zero elevation is a legitimate correction; only NaN fails the finite checks
      expect(parseVertifixCommitRequest({ ...validBody, elevationFeet: 0 }).ok).toBe(true);
    });
  });
});
