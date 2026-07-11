<script setup lang="ts">
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
 * █████████████████████████████████ #components/widgets/lab/service-metrics/index.vue █████████████████████████████████
 *
 * A service's live-telemetry dashboard. Renders the metric tiles declared in the service's frontmatter; values come
 * from the `live` payload when its metrics publisher is reporting, and fall back to an "awaiting feed" state until
 * then. Mirrors the Substrate live-card presentation so services read as living, not static.
 *
 * ─── PROPS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • tiles
 *     - Description: The declared metric tiles from the service frontmatter
 *     - Type: IServiceMetricTile[]
 *     - Required: true
 *   • live
 *     - Description: Live values keyed by tile `key`; null until the metrics publisher reports in
 *     - Type: Record<string, string | number> | null
 *     - Required: false
 *     - Default: null
 *   • label
 *     - Description: Short noun for the empty-state copy, e.g. "server"
 *     - Type: string
 *     - Required: false
 *     - Default: 'service'
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type { IServiceMetricTile } from '~/types/services';

import type { IServiceMetricsProps } from './types';

/* ─── PROPS ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Component props; the declared metric tiles, the live values feeding them, and the empty-state noun
 * @internal
 * @constant
 */
const { tiles, live = null, label = 'service' }: IServiceMetricsProps = defineProps<IServiceMetricsProps>();

/* ─── COMPUTED ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Whether any live value is present; flips the header from "planned" to "live"
 * @internal
 * @constant
 */
const isLive: ComputedRef<boolean> = computed((): boolean => !!live && Object.keys(live).length > 0);

/* ─── HANDLERS ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A utility method to resolve a tile's display value with its unit appended
 * @internal
 * @function
 * @param tile - The declared metric tile being rendered
 * @returns The display string, or null when there's nothing live for the tile yet
 */
function valueOf(tile: IServiceMetricTile): string | null {
  const raw: string | number | undefined = live?.[tile.key];
  if (raw === undefined || raw === null || raw === '') {
    return null;
  }
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
    <dl
      v-if="tiles.length"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      <div
        v-for="tile in tiles"
        :key="tile.key"
        class="border-border bg-bg/40 rounded-xl border px-3 py-2.5"
        :title="tile.hint"
      >
        <dt class="text-caption text-ink-subtle flex items-center gap-1.5 font-mono tracking-widest uppercase">
          <Icon
            v-if="tile.icon"
            :name="tile.icon"
            size="12"
          />
          {{ tile.label }}
        </dt>

        <dd
          class="font-display text-h5 mt-1 leading-none font-bold"
          :class="valueOf(tile) ? 'text-ink' : 'text-ink-subtle/50'"
        >
          {{ valueOf(tile) ?? '; ' }}
        </dd>
      </div>
    </dl>

    <!-- Footer note (planned only) -->
    <p
      v-if="!isLive"
      class="font-body text-body-sm text-ink-subtle mt-4 leading-relaxed"
    >
      Live telemetry appears here once the {{ label }} metrics publisher reports in.
    </p>
  </div>
</template>
