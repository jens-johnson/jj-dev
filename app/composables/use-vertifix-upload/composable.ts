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
 * ██████████████████████████████████ #composables/use-vertifix-upload/composable.ts ███████████████████████████████████
 *
 * Client-side state machine for the Vertifix lab flow: read photo EXIF capture time, search Strava for matching runs,
 * prepare a corrected-elevation TCX, then commit the re-upload. The raw File is never retained; only what the UI needs
 * is kept per item.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import exifr from 'exifr';

import type { IVertifixCommitResult, IVertifixMatchesResult, IVertifixPrepareResult } from '#shared/vertifix';

import type { IVertifixItem } from './types';

// The EXIF tags consulted, in priority order, to recover a photo's capture time.
const EXIF_TAGS = ['DateTimeOriginal', 'CreateDate', 'ModifyDate'];

/**
 * A utility method to pull the friendliest message out of a `$fetch` error (our H3 errors carry `statusMessage`)
 * @internal
 * @function
 * @param err - The unknown error thrown by `$fetch`
 * @returns The most specific human-readable message available, falling back to a generic one
 */
function errorMessage(err: unknown): string {
  const e = err as { statusMessage?: string; data?: { statusMessage?: string; message?: string }; message?: string };
  return e?.data?.statusMessage ?? e?.data?.message ?? e?.statusMessage ?? e?.message ?? 'Something went wrong.';
}

/**
 * A composable driving the client-side state machine for the Vertifix lab flow
 * @returns The reactive item list plus the actions that advance each item through the flow
 */
export function useVertifixUpload() {
  const items = useState<IVertifixItem[]>('vertifix-items', () => []);

  /**
   * A utility method to look up an item in the list by its id
   * @internal
   * @function
   * @param id - The unique id of the item
   * @returns The matching item, or undefined when no item has that id
   */
  function find(id: string): IVertifixItem | undefined {
    return items.value.find((entry) => entry.id === id);
  }

  /**
   * A utility method to shallow-merge a set of changes onto the item with the given id; a no-op when the item is
   * missing
   * @internal
   * @function
   * @param id - The unique id of the item to update
   * @param changes - The partial item fields to merge onto the existing item
   */
  function patch(id: string, changes: Partial<IVertifixItem>) {
    const item = find(id);
    if (item) Object.assign(item, changes);
  }

  /**
   * A utility method to read a photo's capture time from its EXIF metadata, trying the tags in priority order
   * @internal
   * @function
   * @param file - The image file to parse
   * @returns The capture time as an ISO string, or null when the metadata is missing or unreadable
   */
  async function readCaptureDate(file: File): Promise<string | null> {
    try {
      const meta = await exifr.parse(file, EXIF_TAGS);
      const captured = meta?.DateTimeOriginal ?? meta?.CreateDate ?? meta?.ModifyDate ?? null;
      return captured ? new Date(captured).toISOString() : null;
    } catch {
      return null;
    }
  }

  /**
   * A utility method to add dropped or picked image files to the list; each item gets a preview object URL, then its
   * EXIF capture time is read before the item is marked ready
   * @internal
   * @function
   * @param files - The files to add; anything that is not an image is ignored
   */
  async function addFiles(files: File[] | FileList) {
    const images = Array.from(files).filter((file) => file.type.startsWith('image/'));
    for (const file of images) {
      const id = crypto.randomUUID();
      items.value.push({
        id,
        fileName: file.name,
        previewUrl: URL.createObjectURL(file),
        capturedAt: null,
        elevationFeet: null,
        candidates: [],
        selectedActivityId: null,
        prepared: null,
        result: null,
        status: 'reading',
        error: null,
      });
      const capturedAt = await readCaptureDate(file);
      patch(id, { capturedAt, status: 'ready' });
    }
  }

  /**
   * A utility method to remove an item from the list, revoking its preview object URL to free memory
   * @internal
   * @function
   * @param id - The unique id of the item to remove
   */
  function removeItem(id: string) {
    const index = items.value.findIndex((entry) => entry.id === id);
    const item = items.value[index];
    if (!item) return;
    URL.revokeObjectURL(item.previewUrl);
    items.value.splice(index, 1);
  }

  /**
   * A utility method to remove every item from the list, revoking each preview object URL
   * @internal
   * @function
   */
  function clearAll() {
    items.value.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    items.value = [];
  }

  /**
   * A utility method to set (or clear) an item's capture time
   * @internal
   * @function
   * @param id - The unique id of the item to update
   * @param capturedAt - The capture time as an ISO string, or null to clear it
   */
  function setCapturedAt(id: string, capturedAt: string | null) {
    patch(id, { capturedAt });
  }

  /**
   * A utility method to set (or clear) an item's target elevation gain
   * @internal
   * @function
   * @param id - The unique id of the item to update
   * @param elevationFeet - The elevation gain in feet, or null to clear it
   */
  function setElevation(id: string, elevationFeet: number | null) {
    patch(id, { elevationFeet });
  }

  /**
   * A utility method to search Strava for runs near an item's capture time via the matches endpoint, storing the
   * candidates on success
   * @internal
   * @function
   * @param id - The unique id of the item to search for; a no-op when the item has no capture time
   */
  async function searchMatches(id: string) {
    const item = find(id);
    if (!item?.capturedAt) return;
    patch(id, { status: 'matching', error: null });
    try {
      const res = await $fetch<IVertifixMatchesResult>('/api/lab/vertifix/matches', {
        query: { capturedAt: item.capturedAt },
      });
      patch(id, { candidates: res.candidates, status: 'matched' });
    } catch (err) {
      patch(id, { status: 'error', error: errorMessage(err) });
    }
  }

  /**
   * A utility method to record which candidate Strava activity the user picked for an item
   * @internal
   * @function
   * @param id - The unique id of the item to update
   * @param activityId - The Strava activity id of the chosen candidate
   */
  function selectCandidate(id: string, activityId: number) {
    patch(id, { selectedActivityId: activityId });
  }

  /**
   * A utility method to request a corrected-elevation TCX for an item's selected activity via the prepare endpoint
   * @internal
   * @function
   * @param id - The unique id of the item to prepare; a no-op without both a selected activity and an elevation
   */
  async function prepare(id: string) {
    const item = find(id);
    if (!item?.selectedActivityId || item.elevationFeet === null) return;
    patch(id, { status: 'preparing', error: null });
    try {
      const res = await $fetch<IVertifixPrepareResult>('/api/lab/vertifix/prepare', {
        method: 'POST',
        body: { activityId: item.selectedActivityId, elevationFeet: item.elevationFeet },
      });
      patch(id, { prepared: res, status: 'prepared' });
    } catch (err) {
      patch(id, { status: 'error', error: errorMessage(err) });
    }
  }

  /**
   * A utility method to offer an item's prepared TCX as a local download; a backup before the original is deleted
   * @internal
   * @function
   * @param id - The unique id of the item whose prepared TCX should be downloaded
   */
  function downloadBackup(id: string) {
    const item = find(id);
    if (!item?.prepared) return;
    const url = URL.createObjectURL(new Blob([item.prepared.tcx], { type: 'application/vnd.garmin.tcx+xml' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `vertifix-${item.prepared.activityId}.tcx`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  /**
   * A utility method to commit an item's re-upload; posts the prepared TCX and summary to the commit endpoint and
   * stores the validation result
   * @internal
   * @function
   * @param id - The unique id of the item to commit; a no-op when nothing has been prepared
   */
  async function commit(id: string) {
    const item = find(id);
    if (!item?.prepared) return;
    patch(id, { status: 'committing', error: null });
    try {
      const res = await $fetch<IVertifixCommitResult>('/api/lab/vertifix/commit', {
        method: 'POST',
        body: {
          activityId: item.prepared.activityId,
          tcx: item.prepared.tcx,
          name: item.prepared.summary.name,
          description: item.prepared.summary.description,
          elevationFeet: item.prepared.summary.targetElevationFeet,
          expectedDistanceMeters: item.prepared.summary.distanceMeters,
        },
      });
      patch(id, { result: res, status: 'done' });
    } catch (err) {
      patch(id, { status: 'error', error: errorMessage(err) });
    }
  }

  /**
   * A utility method to step a failed item back to the furthest stage it can safely resume from
   * @internal
   * @function
   * @param id - The unique id of the item to retry
   */
  function retry(id: string) {
    const item = find(id);
    if (!item) return;
    if (item.prepared) patch(id, { status: 'prepared', error: null });
    else if (item.candidates.length) patch(id, { status: 'matched', error: null });
    else patch(id, { status: 'ready', error: null });
  }

  return {
    items,
    addFiles,
    removeItem,
    clearAll,
    setCapturedAt,
    setElevation,
    searchMatches,
    selectCandidate,
    prepare,
    downloadBackup,
    commit,
    retry,
  };
}
