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
 * ██████████████████████████████████ #components/widgets/lab/service-metrics/index.vue ████████████████████████████████
 *
 * A service's live-telemetry dashboard. Renders the metric tiles declared in the service's frontmatter; values come
 * from the `live` payload when its metrics publisher is reporting, and fall back to an "awaiting feed" state until
 * then. Mirrors the Substrate live-card presentation so services read as living, not static.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { ServiceMetricTile } from '~/types/services';

const {
  tiles,
  live = null,
  label = 'service',
} = defineProps<{
  /** Declared tiles from the service frontmatter. */
  tiles: ServiceMetricTile[];
  /** Live values keyed by tile `key`; null until the metrics publisher reports in. */
  live?: Record<string, string | number> | null;
  /** Short noun for the empty-state copy, e.g. "server". */
  label?: string;
}>();

/** Whether any live value is present — flips the header from "planned" to "live". */
const isLive = computed(() => !!live && Object.keys(live).length > 0);

/** Resolve a tile's display value + unit, or null when there's nothing live yet. */
function valueOf(tile: ServiceMetricTile): string | null {
  const raw = live?.[tile.key];
  if (raw === undefined || raw === null || raw === '') return null;
  return tile.unit ? `${raw} ${tile.unit}` : String(raw);
}
</script>

<template>
  <div class="border-border bg-surface rounded-2xl border p-5">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between gap-3">
      <span class="inline-flex items-center gap-2">
        <span class="relative flex size-2">
          <span
            v-if="isLive"
            class="bg-accent-secondary absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden"
          />
          <span
            class="relative inline-flex size-2 rounded-full"
            :class="isLive ? 'bg-accent-secondary' : 'bg-ink-subtle'"
          />
        </span>
        <span
          class="text-caption font-mono tracking-widest uppercase"
          :class="isLive ? 'text-accent-secondary' : 'text-ink-subtle'"
        >
          {{ isLive ? 'Live' : 'Live feed planned' }}
        </span>
        <span class="text-caption text-ink-subtle font-mono">metrics</span>
      </span>
    </div>

    <!-- Tiles -->
    <dl v-if="tiles.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div
        v-for="tile in tiles"
        :key="tile.key"
        class="border-border bg-bg/40 rounded-xl border px-3 py-2.5"
        :title="tile.hint"
      >
        <dt class="text-caption text-ink-subtle flex items-center gap-1.5 font-mono tracking-widest uppercase">
          <Icon v-if="tile.icon" :name="tile.icon" size="12" />
          {{ tile.label }}
        </dt>
        <dd
          class="font-display text-h5 mt-1 leading-none font-bold"
          :class="valueOf(tile) ? 'text-ink' : 'text-ink-subtle/50'"
        >
          {{ valueOf(tile) ?? '—' }}
        </dd>
      </div>
    </dl>

    <!-- Footer note (planned only) -->
    <p v-if="!isLive" class="font-body text-body-sm text-ink-subtle mt-4 leading-relaxed">
      Live telemetry appears here once the {{ label }} metrics publisher reports in.
    </p>
  </div>
</template>
