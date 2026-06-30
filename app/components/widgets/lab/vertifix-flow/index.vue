<script setup lang="ts">
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
 * ██████████████████████████████████ #components/widgets/lab/vertifix-flow/index.vue ██████████████████████████████████
 *
 * The Vertifix upload-flow UI: a multi-image dropzone plus a per-photo stepper that walks each run through
 * matching, elevation entry, the manual Strava-delete handoff, and the corrected re-upload.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type { TVertifixStatus } from '~/composables/use-vertifix-upload';

const {
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
} = useVertifixUpload();

const dragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const steps = ['Identify run', 'Replace on Strava', 'Done'] as const;

const STATUS_LABEL: Record<TVertifixStatus, string> = {
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

function stageOf(status: TVertifixStatus): number {
  if (status === 'done') return 2;
  if (status === 'prepared' || status === 'committing') return 1;
  return 0;
}

function statusClass(status: TVertifixStatus): string {
  if (status === 'done') return 'bg-accent-secondary/15 text-accent-secondary';
  if (status === 'error') return 'bg-terra-600/15 text-terra-600';
  if (status === 'prepared') return 'bg-accent/10 text-accent';
  return 'bg-surface text-ink-subtle';
}

/* ─── Formatters ──────────────────────────────────────────────────────────────────────────────────────────────────── */

const milesFmt = (metres: number) => `${(metres / 1609.344).toFixed(2)} mi`;
const feet = (metres: number) => `${Math.round(metres * 3.28084).toLocaleString()} ft`;

function duration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

function dateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/* ─── Capture-time input (ISO ⇄ datetime-local) ───────────────────────────────────────────────────────────────────── */

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/* ─── Event handlers ──────────────────────────────────────────────────────────────────────────────────────────────── */

function onDrop(event: DragEvent) {
  dragging.value = false;
  if (event.dataTransfer?.files?.length) addFiles(event.dataTransfer.files);
}

function onPick(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) addFiles(input.files);
  input.value = '';
}

function onCapturedAt(id: string, event: Event) {
  setCapturedAt(id, fromLocalInput((event.target as HTMLInputElement).value));
}

function onElevation(id: string, event: Event) {
  const value = (event.target as HTMLInputElement).value;
  setElevation(id, value === '' ? null : Number(value));
}

function canPrepare(elevationFeet: number | null, selectedActivityId: number | null): boolean {
  return selectedActivityId !== null && elevationFeet !== null && elevationFeet >= 0;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- ─── Dropzone ──────────────────────────────────────────────────────────────────────────────── -->
    <button
      type="button"
      class="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors"
      :class="dragging ? 'border-accent bg-accent/5' : 'border-border bg-surface/40 hover:border-accent/60'"
      @click="fileInput?.click()"
      @dragenter.prevent="dragging = true"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <span class="bg-bg text-accent border-border flex size-12 items-center justify-center rounded-2xl border">
        <Icon name="lucide:image-up" size="24" />
      </span>
      <span class="font-body text-body text-ink font-semibold">Drop treadmill photos here</span>
      <span class="font-body text-body-sm text-ink-muted">or click to choose; multiple at once is fine</span>
      <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onPick" />
    </button>

    <!-- ─── Per-photo cards ───────────────────────────────────────────────────────────────────────── -->
    <ContainmentCard v-for="item in items" :key="item.id" as="article" pad="md" class="flex flex-col gap-5">
      <!-- Header: thumbnail, filename, status, remove -->
      <div class="flex items-center gap-4">
        <img :src="item.previewUrl" :alt="item.fileName" class="border-border size-16 rounded-xl border object-cover" />
        <div class="min-w-0 flex-1">
          <p class="font-body text-body-sm text-ink truncate font-semibold">{{ item.fileName }}</p>
          <span
            class="text-caption mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 font-mono font-medium"
            :class="statusClass(item.status)"
          >
            {{ STATUS_LABEL[item.status] }}
          </span>
        </div>
        <button
          type="button"
          class="text-ink-subtle hover:text-terra-600 transition-colors"
          aria-label="Remove photo"
          @click="removeItem(item.id)"
        >
          <Icon name="lucide:x" size="18" />
        </button>
      </div>

      <!-- Stepper -->
      <ol class="flex items-center gap-2">
        <li v-for="(label, index) in steps" :key="label" class="flex flex-1 items-center gap-2">
          <span
            class="text-caption flex size-6 shrink-0 items-center justify-center rounded-full font-mono font-semibold"
            :class="
              stageOf(item.status) >= index ? 'bg-accent text-bg' : 'bg-surface text-ink-subtle border-border border'
            "
          >
            {{ index + 1 }}
          </span>
          <span class="text-caption font-mono" :class="stageOf(item.status) >= index ? 'text-ink' : 'text-ink-subtle'">
            {{ label }}
          </span>
          <span v-if="index < steps.length - 1" class="bg-border ml-1 h-px flex-1" />
        </li>
      </ol>

      <!-- Error -->
      <div
        v-if="item.status === 'error'"
        class="border-terra-600/30 bg-terra-600/5 flex flex-col gap-3 rounded-xl border p-4"
      >
        <p class="font-body text-body-sm text-ink flex items-start gap-2">
          <Icon name="lucide:triangle-alert" size="16" class="text-terra-600 mt-0.5 shrink-0" />
          <span>{{ item.error }}</span>
        </p>
        <button
          type="button"
          class="border-border text-body-sm text-ink-muted hover:border-accent hover:text-accent w-fit rounded-full border px-3.5 py-1 font-medium transition-colors"
          @click="retry(item.id)"
        >
          Try again
        </button>
      </div>

      <!-- Reading -->
      <p v-else-if="item.status === 'reading'" class="font-body text-body-sm text-ink-muted flex items-center gap-2">
        <Icon name="lucide:loader-circle" size="16" class="animate-spin" />
        Reading photo metadata…
      </p>

      <!-- Stage 0; identify run + elevation -->
      <div v-else-if="stageOf(item.status) === 0" class="flex flex-col gap-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-1.5">
            <span class="text-caption text-ink-muted font-mono tracking-wide uppercase">Photo taken</span>
            <input
              type="datetime-local"
              :value="toLocalInput(item.capturedAt)"
              class="border-border bg-bg text-ink focus:border-accent rounded-lg border px-3 py-2 text-sm outline-none"
              @change="onCapturedAt(item.id, $event)"
            />
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-caption text-ink-muted font-mono tracking-wide uppercase">Elevation gain (ft)</span>
            <input
              type="number"
              min="0"
              inputmode="numeric"
              placeholder="e.g. 1464"
              :value="item.elevationFeet ?? ''"
              class="border-border bg-bg text-ink focus:border-accent rounded-lg border px-3 py-2 text-sm outline-none"
              @input="onElevation(item.id, $event)"
            />
          </label>
        </div>

        <p v-if="!item.capturedAt" class="font-body text-body-sm text-ink-muted flex items-start gap-2">
          <Icon name="lucide:info" size="15" class="text-accent mt-0.5 shrink-0" />
          No timestamp in this photo's metadata (often stripped from exported or screenshotted copies); set the date
          above to search for the run.
        </p>

        <button
          type="button"
          class="border-border text-body-sm text-ink-muted hover:border-accent hover:text-accent flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 font-medium transition-colors disabled:opacity-40"
          :disabled="!item.capturedAt || item.status === 'matching'"
          @click="searchMatches(item.id)"
        >
          <Icon
            :name="item.status === 'matching' ? 'lucide:loader-circle' : 'lucide:search'"
            size="15"
            :class="item.status === 'matching' && 'animate-spin'"
          />
          {{ item.candidates.length ? 'Search again' : 'Find matching runs' }}
        </button>

        <!-- Candidate list -->
        <div v-if="item.candidates.length" class="flex flex-col gap-2">
          <p class="text-caption text-ink-muted font-mono tracking-wide uppercase">Pick the matching run</p>
          <button
            v-for="candidate in item.candidates"
            :key="candidate.id"
            type="button"
            class="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
            :class="
              item.selectedActivityId === candidate.id
                ? 'border-accent bg-accent/5'
                : 'border-border bg-bg hover:border-accent/50'
            "
            @click="selectCandidate(item.id, candidate.id)"
          >
            <span class="min-w-0">
              <span class="font-body text-body-sm text-ink block truncate font-semibold">{{ candidate.name }}</span>
              <span class="text-caption text-ink-muted font-mono">{{ dateTime(candidate.startDate) }}</span>
            </span>
            <span class="text-caption text-ink-muted shrink-0 text-right font-mono">
              {{ milesFmt(candidate.distanceMeters) }} · {{ duration(candidate.movingTimeSeconds) }}<br />
              <span class="text-ink-subtle">now {{ feet(candidate.elevationGainMeters) }}</span>
            </span>
          </button>
        </div>

        <!-- Prepare -->
        <button
          v-if="item.candidates.length"
          type="button"
          class="bg-accent text-bg flex w-fit items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
          :disabled="!canPrepare(item.elevationFeet, item.selectedActivityId) || item.status === 'preparing'"
          @click="prepare(item.id)"
        >
          <Icon
            :name="item.status === 'preparing' ? 'lucide:loader-circle' : 'lucide:wand-sparkles'"
            size="15"
            :class="item.status === 'preparing' && 'animate-spin'"
          />
          Prepare replacement
        </button>
      </div>

      <!-- Stage 1; manual delete + upload -->
      <div v-else-if="stageOf(item.status) === 1 && item.prepared" class="flex flex-col gap-4">
        <div class="border-border bg-bg flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border p-4">
          <span class="font-body text-body-sm text-ink font-semibold">{{ item.prepared.summary.name }}</span>
          <span class="text-caption text-ink-muted font-mono">{{
            milesFmt(item.prepared.summary.distanceMeters)
          }}</span>
          <span class="text-caption font-mono">
            <span class="text-ink-subtle line-through">{{ item.prepared.summary.currentElevationFeet }} ft</span>
            <Icon name="lucide:arrow-right" size="12" class="text-ink-subtle mx-1 inline" />
            <span class="text-accent font-semibold">{{ item.prepared.summary.targetElevationFeet }} ft</span>
          </span>
        </div>

        <ol class="flex flex-col gap-3">
          <li class="flex items-start gap-3">
            <span
              class="bg-surface text-ink-subtle text-caption mt-0.5 flex size-5 items-center justify-center rounded-full font-mono"
              >1</span
            >
            <div class="flex flex-col items-start gap-1.5">
              <p class="font-body text-body-sm text-ink">
                Delete the original on Strava (the API can't do this for you).
              </p>
              <div class="flex flex-wrap gap-2">
                <a
                  :href="item.prepared.stravaUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="border-border text-body-sm text-ink-muted hover:border-accent hover:text-accent inline-flex items-center gap-2 rounded-full border px-3.5 py-1 font-medium transition-colors"
                >
                  <Icon name="lucide:external-link" size="14" />
                  Open on Strava
                </a>
                <button
                  type="button"
                  class="border-border text-body-sm text-ink-muted hover:border-accent hover:text-accent inline-flex items-center gap-2 rounded-full border px-3.5 py-1 font-medium transition-colors"
                  @click="downloadBackup(item.id)"
                >
                  <Icon name="lucide:download" size="14" />
                  Backup .tcx
                </button>
              </div>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <span
              class="bg-surface text-ink-subtle text-caption mt-0.5 flex size-5 items-center justify-center rounded-full font-mono"
              >2</span
            >
            <div class="flex flex-col items-start gap-1.5">
              <p class="font-body text-body-sm text-ink">Once it's gone, upload the corrected activity.</p>
              <button
                type="button"
                class="bg-accent text-bg flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
                :disabled="item.status === 'committing'"
                @click="commit(item.id)"
              >
                <Icon
                  :name="item.status === 'committing' ? 'lucide:loader-circle' : 'lucide:upload'"
                  size="15"
                  :class="item.status === 'committing' && 'animate-spin'"
                />
                I deleted it; upload replacement
              </button>
            </div>
          </li>
        </ol>
      </div>

      <!-- Done -->
      <div
        v-else-if="item.status === 'done' && item.result"
        class="border-accent-secondary/30 bg-accent-secondary/5 flex flex-col gap-2 rounded-xl border p-4"
      >
        <p class="font-body text-body-sm text-ink flex items-center gap-2 font-semibold">
          <Icon name="lucide:circle-check" size="16" class="text-accent-secondary" />
          Elevation restored.
        </p>
        <p class="font-body text-body-sm text-ink-muted">
          New activity now reads {{ item.result.validation.actualElevationFeet }} ft.
          <span v-if="!item.result.validation.valid" class="text-terra-600">
            Heads up; it's outside the expected tolerance; double-check on Strava.
          </span>
        </p>
        <a
          :href="`https://www.strava.com/activities/${item.result.replacementActivityId}`"
          target="_blank"
          rel="noopener noreferrer"
          class="text-body-sm text-accent inline-flex w-fit items-center gap-1.5 font-semibold"
        >
          View on Strava
          <Icon name="lucide:arrow-up-right" size="14" />
        </a>
      </div>
    </ContainmentCard>

    <!-- ─── Footer ────────────────────────────────────────────────────────────────────────────────── -->
    <div v-if="items.length" class="flex justify-end">
      <button
        type="button"
        class="text-body-sm text-ink-subtle hover:text-terra-600 font-medium transition-colors"
        @click="clearAll"
      >
        Clear all
      </button>
    </div>
  </div>
</template>
