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
 * ██████████████████████ #components/widgets/projects/neighborhood-explorer/match-list/index.vue ██████████████████████
 *
 * Ranked neighborhood matches; expanding one shows the per-lens breakdown and the biggest gaps.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type {
  INeighborhoodFeatureDefinition,
  INeighborhoodFeatureDelta,
  INeighborhoodLensDefinition,
  TNeighborhoodLens,
} from '#shared/neighborhood-explorer';
import { NEIGHBORHOOD_FEATURES, NEIGHBORHOOD_LENSES } from '#shared/neighborhood-explorer';

import type { INeighborhoodMatchListEmits, INeighborhoodMatchListProps } from './types';

/* ─── PROPS & EMITS ──────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The component props
 * @internal
 * @constant
 */
const props: INeighborhoodMatchListProps = defineProps<INeighborhoodMatchListProps>();

/**
 * The component emits
 * @internal
 * @constant
 */
const emit = defineEmits<INeighborhoodMatchListEmits>();

/* ─── LOOKUPS ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Feature definitions keyed by feature key
 * @internal
 * @constant
 */
const FEATURES: Map<string, INeighborhoodFeatureDefinition> = new Map(
  NEIGHBORHOOD_FEATURES.map((feature: INeighborhoodFeatureDefinition) => [feature.key, feature]),
);

/**
 * Lens labels keyed by lens id
 * @internal
 * @constant
 */
const LENS_LABELS: Map<TNeighborhoodLens, string> = new Map(
  NEIGHBORHOOD_LENSES.map((lens: INeighborhoodLensDefinition) => [lens.id, lens.label]),
);

/* ─── METHODS ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Renders one difference as "label: origin vs match"
 * @internal
 * @function
 * @param delta - The feature difference
 * @returns The label and both formatted values
 */
function describeDelta(delta: INeighborhoodFeatureDelta): { label: string; origin: string; match: string } {
  const feature: INeighborhoodFeatureDefinition | undefined = FEATURES.get(delta.key);
  return {
    label: feature?.label ?? delta.key,
    origin: feature ? formatNeighborhoodValue(feature.format, delta.origin) : '—',
    match: feature ? formatNeighborhoodValue(feature.format, delta.match) : '—',
  };
}
</script>

<template>
  <ol class="space-y-2">
    <li
      v-for="(match, index) in matches"
      :key="match.place.id"
    >
      <article
        class="border-border rounded-2xl border transition-colors"
        :class="selectedId === match.place.id ? 'bg-surface border-accent/50' : 'hover:bg-surface'"
      >
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-3 text-left"
          :aria-expanded="selectedId === match.place.id"
          @click="emit('select', match)"
        >
          <span class="text-caption text-ink-subtle w-5 shrink-0 font-mono">{{ index + 1 }}</span>

          <span class="min-w-0 flex-1">
            <span class="font-body text-body-sm text-ink block truncate font-semibold">{{ match.place.name }}</span>

            <span class="text-caption text-ink-muted block truncate">{{ match.place.metroLabel }}</span>
          </span>

          <span class="font-display text-ink shrink-0 text-lg font-bold tabular-nums">
            {{ Math.round(match.similarity) }}<span class="text-ink-muted text-xs">%</span>
          </span>
        </button>

        <div
          v-if="selectedId === match.place.id"
          class="border-border border-t px-4 pt-3 pb-4"
        >
          <!-- ─── Lens breakdown ──────────────────────────────────────────────────────── -->
          <ul class="space-y-1.5">
            <li
              v-for="lens in match.lenses"
              :key="lens.lens"
              class="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-2"
            >
              <span class="text-caption text-ink-muted truncate">{{ LENS_LABELS.get(lens.lens) }}</span>

              <span class="bg-border/60 h-1.5 overflow-hidden rounded-full">
                <span
                  class="bg-accent block h-full rounded-full"
                  :style="{ width: `${lens.similarity ?? 0}%` }"
                />
              </span>

              <span class="text-caption text-ink-muted text-right font-mono tabular-nums">
                {{ lens.similarity === null ? '—' : Math.round(lens.similarity) }}
              </span>
            </li>
          </ul>

          <!-- ─── Biggest differences ─────────────────────────────────────────────────── -->
          <template v-if="match.differences.length">
            <p class="text-caption text-ink-muted mt-4 mb-1.5 font-mono tracking-widest uppercase">Biggest gaps</p>

            <dl class="space-y-1">
              <div
                v-for="delta in match.differences.map(describeDelta)"
                :key="delta.label"
                class="flex items-baseline justify-between gap-3"
              >
                <dt class="text-caption text-ink-muted">{{ delta.label }}</dt>

                <dd class="text-caption text-ink shrink-0 font-mono tabular-nums">
                  {{ delta.origin }} <span class="text-ink-subtle">vs</span> {{ delta.match }}
                </dd>
              </div>
            </dl>

            <p class="text-caption text-ink-subtle mt-1">{{ props.originName }} vs {{ match.place.name }}</p>
          </template>

          <button
            type="button"
            class="text-body-sm text-accent mt-4 inline-flex items-center gap-1.5 font-semibold hover:underline"
            @click="emit('compare', match.place.id)"
          >
            <Icon
              name="lucide:repeat"
              size="14"
            />
            Find {{ match.place.name }}'s twins
          </button>
        </div>
      </article>
    </li>
  </ol>
</template>
