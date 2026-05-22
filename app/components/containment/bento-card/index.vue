<script setup lang="ts">
/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                ██        ██                     ▄▄
 *                                ██        ██                     ██
 *                              ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                             ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * ██████████████████████████ #components/containment/bento-card/index.vue ████████████████████████████████████████████
 *
 * Wrapper that adds 3D mouse-tilt + radial shimmer to any bento grid tile. Passes all attrs
 * (class, style, grid sizing) through to the root element via Vue's default inheritAttrs behaviour,
 * so callers can use it as a drop-in replacement for a plain <div>.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <ContainmentBentoCard class="rounded-2xl border bg-surface p-8 lg:col-span-7">
 *   ...tile content...
 * </ContainmentBentoCard>
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type {
  CardTiltOptions,
} from '~/composables/useCardTilt';

const props = withDefaults(defineProps<CardTiltOptions>(), {
  intensity: 10,
  scale: 1.025,
  shineOpacity: 0.12,
});

const {
  tiltStyle, shineStyle, onMouseMove, onMouseEnter, onMouseLeave,
} = useCardTilt({
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
