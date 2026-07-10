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
 * ██████████████████████████████████ #components/primitives/base-parallax/index.vue ███████████████████████████████████
 *
 * Mouse and scroll parallax behaviour primitive. Lerps mouse position and scroll offset, exposing them via a scoped slot.
 *
 * ─── USAGE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <PrimitivesBaseParallax v-slot="{ layerStyle, markStyle, smoothX, smoothY, scrollY }">
 *   ...slot content using layerStyle(mx, my, sy?) and markStyle()...
 * </PrimitivesBaseParallax>
 *
 * Slot props:
 *   layerStyle(mx, my, sy?) → CSSProperties; translate driven by mouse + scroll.
 *     mx / my; max pixel offset driven by lerped mouse position.
 *     sy; scroll multiplier (e.g. 0.3 moves up at 30% of scroll speed).
 *   markStyle()             → CSSProperties; scroll-reveal helper for a backdrop mark.
 *   smoothX / smoothY; lerped mouse values in the range -1 → 1.
 *   scrollY; current window.scrollY.
 *
 * Props:
 *   lerp; lerp factor; lower = smoother/slower. Default 0.055.
 *   heroFraction; hero height as fraction of viewport for markStyle progress. Default 0.92.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The props accepted by the parallax primitive; both tune the feel of the effect and are optional
 * @internal
 * @interface
 */
interface Props {
  /** Lerp factor; lower = smoother/slower. Default 0.055. */
  lerp?: number;
  /** Hero height fraction of viewport for markStyle progress. Default 0.92. */
  heroFraction?: number;
}
const props = withDefaults(defineProps<Props>(), {
  lerp: 0.055,
  heroFraction: 0.92,
});

const rootEl = useTemplateRef<HTMLElement>('root');

const rawX = ref(0);
const rawY = ref(0);
const smoothX = ref(0);
const smoothY = ref(0);
const scrollY = ref(0);
let raf: number;

/**
 * A utility method to linearly interpolate between two values
 * @internal
 * @function
 * @param a - The current value
 * @param b - The target value
 * @param t - The interpolation factor in the 0..1 range; lower values move more slowly toward the target
 * @returns The value moved from a toward b by factor t
 */
function lerpFn(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * A utility method to handle mouse move events on the root element; normalizes the cursor position to the -1..+1
 * range relative to the element center and stores it as the raw parallax input
 * @internal
 * @function
 * @param e - The triggering mouse event
 */
function onMouseMove(e: MouseEvent) {
  if (!rootEl.value) return;
  const { left, top, width, height } = rootEl.value.getBoundingClientRect();
  rawX.value = ((e.clientX - left) / width - 0.5) * 2;
  rawY.value = ((e.clientY - top) / height - 0.5) * 2;
}

/**
 * The per-frame animation loop; lerps the smoothed mouse values toward the raw values, samples window.scrollY, and
 * re-schedules itself via requestAnimationFrame
 * @internal
 * @function
 */
function tick() {
  smoothX.value = lerpFn(smoothX.value, rawX.value, props.lerp);
  smoothY.value = lerpFn(smoothY.value, rawY.value, props.lerp);
  scrollY.value = window.scrollY;
  raf = requestAnimationFrame(tick);
}

/**
 * A slot-exposed style factory producing a translate transform driven by the lerped mouse position and scroll offset
 * @internal
 * @function
 * @param mx - The maximum horizontal pixel offset applied at full lerped mouse deflection
 * @param my - The maximum vertical pixel offset applied at full lerped mouse deflection
 * @param sy - The scroll multiplier (i.e. 0.3 moves the layer at 30% of scroll speed); defaults to 0
 * @returns The style object with the computed translate transform
 */
function layerStyle(mx: number, my: number, sy = 0) {
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
function markStyle() {
  const heroH = import.meta.client ? window.innerHeight * props.heroFraction : 800;
  const p = Math.min(scrollY.value / heroH, 1);
  const opacity = 0.02 + p * 0.22;
  const scale = 0.84 + p * 0.16;
  const tx = smoothX.value * 68;
  const ty = smoothY.value * 52 + scrollY.value * -0.4;
  return {
    transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
    opacity,
    transition: 'opacity 0.12s linear',
  };
}

onMounted(() => {
  raf = requestAnimationFrame(tick);
  window.addEventListener(
    'scroll',
    () => {
      scrollY.value = window.scrollY;
    },
    {
      passive: true,
    },
  );
});
onUnmounted(() => cancelAnimationFrame(raf));
</script>

<template>
  <div ref="root" class="contents" @mousemove="onMouseMove">
    <slot
      :layer-style="layerStyle"
      :mark-style="markStyle"
      :smooth-x="smoothX"
      :smooth-y="smoothY"
      :scroll-y="scrollY"
    />
  </div>
</template>
