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
 * ██████████████████████████████████ #components/primitives/base-parallax/index.vue ███████████████████████████████████
 *
 * Mouse and scroll parallax behavior primitive. Lerps mouse position and scroll offset, exposing them via a scoped
 * slot.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <PrimitivesBaseParallax v-slot="{ layerStyle, markStyle, smoothX, smoothY, scrollY }">
 *   ...slot content using layerStyle(mx, my, sy?) and markStyle()...
 * </PrimitivesBaseParallax>
 *
 * ─── PROPS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • lerp
 *     - Description: The lerp factor applied per frame; lower = smoother/slower
 *     - Type: number
 *     - Required: false
 *     - Default: 0.055
 *   • heroFraction
 *     - Description: The hero height as a fraction of the viewport, used to derive markStyle scroll progress
 *     - Type: number
 *     - Required: false
 *     - Default: 0.92
 *
 * ─── SLOTS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • default
 *     - Description: The parallax-driven content; destructure the scoped props to drive per-layer transforms
 *     - Slot props: layerStyle(mx, my, sy?) and markStyle() style factories returning CSSProperties; smoothX / smoothY,
 *         the lerped mouse values in the -1..1 range; scrollY, the current window.scrollY
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type { TPropsWithDefaults } from '@jens-johnson/style-guide/types/vue';
import { useRafFn } from '@vueuse/core';
import type { CSSProperties } from 'vue';

import type { IBaseParallaxProps } from './types';

/* ─── CONSTANTS ──────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The hero height in pixels assumed during SSR, where `window.innerHeight` is unavailable; markStyle uses it to seed
 * scroll progress until the client takes over
 * @internal
 * @constant
 */
const SSR_FALLBACK_HERO_HEIGHT_PX: number = 800;

/* ─── PROPS ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Component props; tune the lerp feel of the effect and the hero fraction driving markStyle scroll progress
 * @internal
 * @constant
 */
const props: TPropsWithDefaults<IBaseParallaxProps, 'lerp' | 'heroFraction'> = withDefaults(
  defineProps<IBaseParallaxProps>(),
  {
    lerp: 0.055,
    heroFraction: 0.92,
  },
);

/* ─── STATE ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The template ref for the root wrapper element the mouse tracking is measured against
 * @internal
 * @constant
 */
const rootEl = useTemplateRef<HTMLElement>('root');

/**
 * The raw cursor x position normalized to the -1..+1 range relative to the root element center
 * @internal
 * @constant
 */
const rawX: Ref<number> = ref(0);

/**
 * The raw cursor y position normalized to the -1..+1 range relative to the root element center
 * @internal
 * @constant
 */
const rawY: Ref<number> = ref(0);

/**
 * The lerped cursor x position eased toward rawX each frame; exposed to the slot
 * @internal
 * @constant
 */
const smoothX: Ref<number> = ref(0);

/**
 * The lerped cursor y position eased toward rawY each frame; exposed to the slot
 * @internal
 * @constant
 */
const smoothY: Ref<number> = ref(0);

/**
 * The current window.scrollY, sampled each frame and on scroll; exposed to the slot
 * @internal
 * @constant
 */
const scrollY: Ref<number> = ref(0);

/* ─── HANDLERS ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A utility method to linearly interpolate between two values
 * @internal
 * @function
 * @param a - The current value
 * @param b - The target value
 * @param t - The interpolation factor in the 0..1 range; lower values move more slowly toward the target
 * @returns The value moved from a toward b by factor t
 */
function lerpFn(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * A utility method to handle mouse move events on the root element; normalizes the cursor position to the -1..+1
 * range relative to the element center and stores it as the raw parallax input
 * @internal
 * @function
 * @param event - The triggering mouse event
 */
function onMouseMove(event: MouseEvent): void {
  if (!rootEl.value) {
    return;
  }
  // Normalize the cursor position to the -1..+1 range relative to the element center
  const { left, top, width, height }: DOMRect = rootEl.value.getBoundingClientRect();
  rawX.value = ((event.clientX - left) / width - 0.5) * 2;
  rawY.value = ((event.clientY - top) / height - 0.5) * 2;
}

/**
 * The per-frame animation step; lerps the smoothed mouse values toward the raw values and samples window.scrollY.
 * Driven by useRafFn, which schedules and cancels it with the component lifecycle
 * @internal
 * @function
 */
function tick(): void {
  // Ease the smoothed mouse values toward the raw values and sample the scroll offset
  smoothX.value = lerpFn(smoothX.value, rawX.value, props.lerp);
  smoothY.value = lerpFn(smoothY.value, rawY.value, props.lerp);
  scrollY.value = window.scrollY;
}

/* ─── SLOT STYLE FACTORIES ───────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A slot-exposed style factory producing a translate transform driven by the lerped mouse position and scroll offset
 * @internal
 * @function
 * @param mx - The maximum horizontal pixel offset applied at full lerped mouse deflection
 * @param my - The maximum vertical pixel offset applied at full lerped mouse deflection
 * @param sy - The scroll multiplier (i.e. 0.3 moves the layer at 30% of scroll speed); defaults to 0
 * @returns The style object with the computed translate transform
 */
function layerStyle(mx: number, my: number, sy = 0): CSSProperties {
  return {
    transform: `translate(${smoothX.value * mx}px, ${smoothY.value * my + scrollY.value * sy}px)`,
  };
}

/**
 * A slot-exposed style factory for a backdrop mark; fades in and scales up as the user scrolls through the hero
 * (per the heroFraction prop) while drifting with the lerped mouse position
 * @internal
 * @function
 * @returns The style object with the computed transform, opacity, and transition
 */
function markStyle(): CSSProperties {
  // Convert the scroll offset into a clamped 0..1 progress through the hero
  const heroHeight: number = import.meta.client ? window.innerHeight * props.heroFraction : SSR_FALLBACK_HERO_HEIGHT_PX;
  const progress: number = Math.min(scrollY.value / heroHeight, 1);

  // Fade in and scale up with progress while drifting with the lerped mouse position
  const opacity: number = 0.02 + progress * 0.22;
  const scale: number = 0.84 + progress * 0.16;
  const tx: number = smoothX.value * 68;
  const ty: number = smoothY.value * 52 + scrollY.value * -0.4;
  return {
    transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
    opacity,
    transition: 'opacity 0.12s linear',
  };
}

/* ─── LIFECYCLE ──────────────────────────────────────────────────────────────────────────────────────────────────── */

// Drive the per-frame loop; it samples window.scrollY every frame, so no separate scroll listener is needed. useRafFn
// auto-starts client-side and cancels the raf handle on unmount, so there is no manual cleanup.
useRafFn(tick);
</script>

<template>
  <div
    ref="root"
    class="contents"
    @mousemove="onMouseMove"
  >
    <slot
      :layer-style="layerStyle"
      :mark-style="markStyle"
      :smooth-x="smoothX"
      :smooth-y="smoothY"
      :scroll-y="scrollY"
    />
  </div>
</template>
