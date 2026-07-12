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
 * Type definitions for the Vertifix upload composable: the item/status shapes and the typed return surface.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { IVertifixCandidate, IVertifixCommitResult, IVertifixPrepareResult } from '#shared/vertifix';

import type { VertifixStatus } from './enums';

/**
 * A type representing the stage a Vertifix item is at as it moves through the flow; one of {@link VertifixStatus}
 * @public
 */
export type TVertifixStatus = `${VertifixStatus}`;

/**
 * An interface representing one photo working its way through the flow; the raw File is never kept, only what the UI
 * needs
 * @public
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

/**
 * An interface representing the return value from the `useVertifixUpload` composable
 * @public
 * @interface
 */
export interface IUseVertifixUploadReturn {
  /* The shared reactive list of items working their way through the flow */
  readonly items: Ref<IVertifixItem[]>;

  /* Adds dropped or picked image files to the list, reading each photo's EXIF capture time */
  readonly addFiles: (files: File[] | FileList) => Promise<void>;

  /* Removes an item from the list, revoking its preview object URL */
  readonly removeItem: (id: string) => void;

  /* Removes every item from the list, revoking each preview object URL */
  readonly clearAll: () => void;

  /* Sets (or clears) an item's capture time */
  readonly setCapturedAt: (id: string, capturedAt: string | null) => void;

  /* Sets (or clears) an item's target elevation gain in feet */
  readonly setElevation: (id: string, elevationFeet: number | null) => void;

  /* Searches Strava for runs near an item's capture time, storing the candidates on success */
  readonly searchMatches: (id: string) => Promise<void>;

  /* Records which candidate Strava activity the user picked for an item */
  readonly selectCandidate: (id: string, activityId: number) => void;

  /* Requests a corrected-elevation TCX for an item's selected activity */
  readonly prepare: (id: string) => Promise<void>;

  /* Offers an item's prepared TCX as a local download before the original is deleted */
  readonly downloadBackup: (id: string) => void;

  /* Commits an item's re-upload and stores the validation result */
  readonly commit: (id: string) => Promise<void>;

  /* Steps a failed item back to the furthest stage it can safely resume from */
  readonly retry: (id: string) => void;
}
