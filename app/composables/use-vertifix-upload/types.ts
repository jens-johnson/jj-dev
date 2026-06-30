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
 * █████████████████████████████████████ #composables/use-vertifix-upload/types.ts █████████████████████████████████████
 *
 * Type definitions for the Vertifix upload composable.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { IVertifixCandidate, IVertifixCommitResult, IVertifixPrepareResult } from '#shared/vertifix';

/**
 * A type representing the stage a Vertifix item is at as it moves through the flow
 * @typedef
 */
export type TVertifixStatus =
  | 'reading'
  | 'ready'
  | 'matching'
  | 'matched'
  | 'preparing'
  | 'prepared'
  | 'committing'
  | 'done'
  | 'error';

/**
 * An interface representing one photo working its way through the flow; the raw File is never kept, only what the UI
 * needs
 * @interface
 */
export interface IVertifixItem {
  /* The stable client-generated id */
  id: string;

  /* The original file name */
  fileName: string;

  /* The object URL for the local preview image */
  previewUrl: string;

  /* The EXIF capture timestamp (ISO string), or null when none could be read */
  capturedAt: string | null;

  /* The user-supplied corrected elevation in feet, or null until entered */
  elevationFeet: number | null;

  /* The Strava match candidates returned for this item */
  candidates: IVertifixCandidate[];

  /* The id of the selected candidate activity, or null until one is chosen */
  selectedActivityId: number | null;

  /* The prepared replacement payload, or null until prepared */
  prepared: IVertifixPrepareResult | null;

  /* The commit result, or null until committed */
  result: IVertifixCommitResult | null;

  /* The current stage of this item */
  status: TVertifixStatus;

  /* The current error message, or null when none */
  error: string | null;
}
