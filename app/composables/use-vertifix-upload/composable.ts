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

// Pulls the friendliest message out of a `$fetch` error (our H3 errors carry `statusMessage`).
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

  function find(id: string): IVertifixItem | undefined {
    return items.value.find((entry) => entry.id === id);
  }

  function patch(id: string, changes: Partial<IVertifixItem>) {
    const item = find(id);
    if (item) Object.assign(item, changes);
  }

  async function readCaptureDate(file: File): Promise<string | null> {
    try {
      const meta = await exifr.parse(file, EXIF_TAGS);
      const captured = meta?.DateTimeOriginal ?? meta?.CreateDate ?? meta?.ModifyDate ?? null;
      return captured ? new Date(captured).toISOString() : null;
    } catch {
      return null;
    }
  }

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

  function removeItem(id: string) {
    const index = items.value.findIndex((entry) => entry.id === id);
    const item = items.value[index];
    if (!item) return;
    URL.revokeObjectURL(item.previewUrl);
    items.value.splice(index, 1);
  }

  function clearAll() {
    items.value.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    items.value = [];
  }

  function setCapturedAt(id: string, capturedAt: string | null) {
    patch(id, { capturedAt });
  }

  function setElevation(id: string, elevationFeet: number | null) {
    patch(id, { elevationFeet });
  }

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

  function selectCandidate(id: string, activityId: number) {
    patch(id, { selectedActivityId: activityId });
  }

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

  // Offers the prepared TCX as a local download; a backup before the original is deleted.
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

  // Steps a failed item back to the furthest stage it can safely resume from.
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
