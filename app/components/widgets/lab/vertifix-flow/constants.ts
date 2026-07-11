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
 * ████████████████████████████████ #components/widgets/lab/vertifix-flow/constants.ts █████████████████████████████████
 *
 * Constants for the vertifix upload flow: the stepper stage labels and the per-status badge labels.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { TVertifixStatus } from '~/composables/use-vertifix-upload';

/**
 * The stepper stage labels, in order: identify the run, replace it on Strava, done
 * @public
 * @constant
 */
export const STEP_LABELS: readonly string[] = ['Identify run', 'Replace on Strava', 'Done'];

/**
 * The status badge label for each upload-item status
 * @public
 * @constant
 */
export const STATUS_LABEL: Record<TVertifixStatus, string> = {
  reading: 'Reading photo',
  ready: 'Ready',
  matching: 'Finding runs',
  matched: 'Select a run',
  preparing: 'Preparing',
  prepared: 'Awaiting delete',
  committing: 'Uploading',
  done: 'Done',
  error: 'Needs attention',
};
