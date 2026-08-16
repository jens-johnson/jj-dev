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
 * ███████████████████████████████████ #components/widgets/blog/bento-grid/index.vue ███████████████████████████████████
 *
 * Bento grid widget; lays the edition tiles across a responsive bento grid, composing the tilt card and per-variant
 * tile.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type { IBentoGridProps } from './types';
import { bentoSpanClass } from './utils';

/* ─── PROPS ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Component props; the ordered tiles to lay out across the responsive bento grid
 * @internal
 * @constant
 */
const props = defineProps<IBentoGridProps>();
</script>

<template>
  <!-- Empty state -->
  <div
    v-if="!props.cards.length"
    class="border-border bg-surface/40 flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center"
  >
    <span class="bg-bg text-ink-subtle border-border mb-5 flex size-12 items-center justify-center rounded-full border">
      <Icon
        name="lucide:layout-grid"
        size="22"
      />
    </span>

    <h3 class="font-display text-h5 text-ink font-bold">No picks yet</h3>

    <p class="font-body text-body-sm text-ink-muted mt-2 max-w-md leading-relaxed">
      This edition is still being assembled; tiles will land here shortly.
    </p>
  </div>

  <!-- Bento grid -->
  <div
    v-else
    class="grid grid-flow-dense auto-rows-[minmax(11rem,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
  >
    <!-- Embed tiles opt out of the 3D tilt/shine (intensity 0) so the interactive player stays comfortable to use. -->
    <ContainmentBentoCard
      v-for="(card, i) in props.cards"
      :key="i"
      :intensity="card.type === 'embed' ? 0 : undefined"
      :scale="card.type === 'embed' ? 1 : undefined"
      :shine-opacity="card.type === 'embed' ? 0 : undefined"
      :class="[
        bentoSpanClass(card.size),
        'group border-border bg-surface hover:border-accent/50 relative flex flex-col overflow-hidden rounded-2xl border transition-colors',
      ]"
    >
      <WidgetsBlogBentoTile :card="card" />
    </ContainmentBentoCard>
  </div>
</template>
