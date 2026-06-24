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
 * █████████████████████████████████████████ #composables/useVertifixUpload.ts █████████████████████████████████████████
 *
 * Client state machine for the Vertifix upload flow. Reads each photo's EXIF capture date in the browser,
 * finds candidate Strava runs, and drives each item through match → validate → prepare → manual-delete →
 * commit, holding the prepared TCX client-side (nothing is persisted server-side).
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import exifr from 'exifr';

import type {
  VertifixCandidate,
  VertifixCommitResult,
  VertifixMatchesResult,
  VertifixPrepareResult,
} from '#shared/vertifix';

/* ─── Types ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

export type VertifixStatus =
  | 'reading'
  | 'ready'
  | 'matching'
  | 'matched'
  | 'preparing'
  | 'prepared'
  | 'committing'
  | 'done'
  | 'error';

/** One photo working its way through the flow. The raw File is never kept — only what the UI needs. */
export interface VertifixItem {
  id: string;
  fileName: string;
  previewUrl: string;
  capturedAt: string | null;
  elevationFeet: number | null;
  candidates: VertifixCandidate[];
  selectedActivityId: number | null;
  prepared: VertifixPrepareResult | null;
  result: VertifixCommitResult | null;
  status: VertifixStatus;
  error: string | null;
}

/* ─── Helpers ─────────────────────────────────────────────────────────────────────────────────────────────────────── */

const EXIF_TAGS = ['DateTimeOriginal', 'CreateDate', 'ModifyDate'];

/** Pulls the friendliest message out of a `$fetch` error (our H3 errors carry `statusMessage`). */
function errorMessage(err: unknown): string {
  const e = err as { statusMessage?: string; data?: { statusMessage?: string; message?: string }; message?: string };
  return e?.data?.statusMessage ?? e?.data?.message ?? e?.statusMessage ?? e?.message ?? 'Something went wrong.';
}

/* ─── Composable ──────────────────────────────────────────────────────────────────────────────────────────────────── */

export function useVertifixUpload() {
  const items = useState<VertifixItem[]>('vertifix-items', () => []);

  function find(id: string): VertifixItem | undefined {
    return items.value.find((entry) => entry.id === id);
  }

  function patch(id: string, changes: Partial<VertifixItem>) {
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
      const res = await $fetch<VertifixMatchesResult>('/api/lab/vertifix/matches', {
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
      const res = await $fetch<VertifixPrepareResult>('/api/lab/vertifix/prepare', {
        method: 'POST',
        body: { activityId: item.selectedActivityId, elevationFeet: item.elevationFeet },
      });
      patch(id, { prepared: res, status: 'prepared' });
    } catch (err) {
      patch(id, { status: 'error', error: errorMessage(err) });
    }
  }

  /** Offers the prepared TCX as a local download — a backup before the original is deleted. */
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
      const res = await $fetch<VertifixCommitResult>('/api/lab/vertifix/commit', {
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

  /** Steps a failed item back to the furthest stage it can safely resume from. */
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
