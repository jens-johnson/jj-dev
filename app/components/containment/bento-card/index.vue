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
 * ███████████████████████████████████ #components/containment/bento-card/index.vue ████████████████████████████████████
 *
 * Wrapper that adds 3D mouse-tilt + radial shimmer to any bento grid tile. Passes all attrs (class, style, grid sizing)
 * through to the root element via Vue default inheritAttrs behavior, so callers can use it as a drop-in replacement for
 * a plain <div>.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <ContainmentBentoCard class="rounded-2xl border bg-surface p-8 lg:col-span-7">
 *   ...tile content...
 * </ContainmentBentoCard>
 *
 * ─── PROPS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • intensity
 *     - Description: The maximum rotation in degrees applied symmetrically to the X and Y axes
 *     - Type: number
 *     - Required: false
 *     - Default: 10
 *   • scale
 *     - Description: The uniform scale factor applied on hover
 *     - Type: number
 *     - Required: false
 *     - Default: 1.025
 *   • shineOpacity
 *     - Description: The peak opacity of the radial shine overlay
 *     - Type: number
 *     - Required: false
 *     - Default: 0.12
 *
 * ─── SLOTS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • default
 *     - Description: The tile content rendered inside the tilt wrapper
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type { TPropsWithDefaults } from '@jens-johnson/style-guide/types/vue';

import type { ICardTiltOptions } from '~/composables/use-card-tilt';

/* ─── PROPS ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Component props; allows users to consume the Bento Card component and alter factors like rotation intensity, hover
 * scale, and radial shine opacity
 * @internal
 * @constant
 */
const props: TPropsWithDefaults<ICardTiltOptions, 'intensity' | 'scale' | 'shineOpacity'> = withDefaults(
  defineProps<ICardTiltOptions>(),
  {
    intensity: 10,
    scale: 1.025,
    shineOpacity: 0.12,
  },
);

/* ─── COMPOSABLES ────────────────────────────────────────────────────────────────────────────────────────────────── */

// The tilt/shine styles and mouse handlers driving the card's 3d hover treatment, tuned by the props above
const { tiltStyle, shineStyle, onMouseMove, onMouseEnter, onMouseLeave } = useCardTilt({
  intensity: props.intensity,
  scale: props.scale,
  shineOpacity: props.shineOpacity,
});
</script>

<template>
  <div
    :style="tiltStyle"
    @mousemove="onMouseMove"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Radial shimmer that follows the cursor -->
    <div
      class="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
      :style="shineStyle"
    />

    <slot />
  </div>
</template>
