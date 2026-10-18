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
 * ████████████████████ #components/widgets/projects/neighborhood-explorer/lens-controls/index.vue █████████████████████
 *
 * One weight slider per lens plus the other-cities-only toggle for the neighborhood explorer.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type { INeighborhoodLensDefinition, TNeighborhoodLens } from '#shared/neighborhood-explorer';
import { NEIGHBORHOOD_DEFAULT_WEIGHTS, NEIGHBORHOOD_LENSES } from '#shared/neighborhood-explorer';

import type { INeighborhoodLensControlsEmits, INeighborhoodLensControlsProps } from './types';

/* ─── PROPS & EMITS ──────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The component props
 * @internal
 * @constant
 */
const props: INeighborhoodLensControlsProps = defineProps<INeighborhoodLensControlsProps>();

/**
 * The component emits
 * @internal
 * @constant
 */
const emit = defineEmits<INeighborhoodLensControlsEmits>();

/* ─── COMPUTED ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Whether any slider has moved off its default, which enables the reset action
 * @internal
 * @constant
 */
const isCustomized: ComputedRef<boolean> = computed((): boolean =>
  NEIGHBORHOOD_LENSES.some(
    (lens: INeighborhoodLensDefinition) => props.weights[lens.id] !== NEIGHBORHOOD_DEFAULT_WEIGHTS[lens.id],
  ),
);

/* ─── METHODS ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Emits the weights with one lens changed
 * @internal
 * @function
 * @param lens - The lens that moved
 * @param event - The range input event
 */
function setWeight(lens: TNeighborhoodLens, event: Event): void {
  emit('update:weights', { ...props.weights, [lens]: Number((event.target as HTMLInputElement).value) });
}

/**
 * Describes a weight in words for the slider's readout
 * @internal
 * @function
 * @param weight - The weight on 0–100
 * @returns The readout label
 */
function describeWeight(weight: number): string {
  if (weight === 0) {
    return 'Off';
  }
  if (weight < 35) {
    return 'Low';
  }
  return weight > 65 ? 'High' : 'Normal';
}
</script>

<template>
  <section aria-labelledby="lens-controls-heading">
    <div class="mb-4 flex items-baseline justify-between">
      <h2
        id="lens-controls-heading"
        class="text-caption text-ink-muted font-mono tracking-widest uppercase"
      >
        What matters to you
      </h2>

      <button
        type="button"
        class="text-caption text-ink-muted hover:text-accent font-medium transition-colors disabled:opacity-0"
        :disabled="!isCustomized"
        @click="emit('reset')"
      >
        Reset
      </button>
    </div>

    <ul class="space-y-4">
      <li
        v-for="lens in NEIGHBORHOOD_LENSES"
        :key="lens.id"
      >
        <label
          :for="`lens-${lens.id}`"
          class="flex items-baseline justify-between gap-3"
        >
          <span class="font-body text-body-sm text-ink font-semibold">{{ lens.label }}</span>

          <span
            class="text-caption font-mono"
            :class="weights[lens.id] === 0 ? 'text-ink-subtle' : 'text-accent'"
          >
            {{ describeWeight(weights[lens.id]) }}
          </span>
        </label>

        <p class="text-caption text-ink-muted mt-0.5">{{ lens.hint }}</p>

        <input
          :id="`lens-${lens.id}`"
          type="range"
          min="0"
          max="100"
          step="5"
          class="lens-range mt-2 w-full"
          :value="weights[lens.id]"
          :aria-valuetext="describeWeight(weights[lens.id])"
          @input="setWeight(lens.id, $event)"
        />
      </li>
    </ul>

    <label class="border-border mt-6 flex cursor-pointer items-center justify-between gap-3 border-t pt-4">
      <span>
        <span class="font-body text-body-sm text-ink block font-semibold">Other cities only</span>

        <span class="text-caption text-ink-muted">Hide matches in your own metro</span>
      </span>

      <input
        type="checkbox"
        class="accent-accent size-4"
        :checked="scope === 'other'"
        @change="emit('update:scope', ($event.target as HTMLInputElement).checked ? 'other' : 'all')"
      />
    </label>
  </section>
</template>

<style scoped>
.lens-range {
  accent-color: var(--color-accent);
}
</style>
