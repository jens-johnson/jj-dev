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

function lerpFn(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function onMouseMove(e: MouseEvent) {
  if (!rootEl.value) return;
  const { left, top, width, height } = rootEl.value.getBoundingClientRect();
  rawX.value = ((e.clientX - left) / width - 0.5) * 2;
  rawY.value = ((e.clientY - top) / height - 0.5) * 2;
}

function tick() {
  smoothX.value = lerpFn(smoothX.value, rawX.value, props.lerp);
  smoothY.value = lerpFn(smoothY.value, rawY.value, props.lerp);
  scrollY.value = window.scrollY;
  raf = requestAnimationFrame(tick);
}

function layerStyle(mx: number, my: number, sy = 0) {
  return {
    transform: `translate(${smoothX.value * mx}px, ${smoothY.value * my + scrollY.value * sy}px)`,
  };
}

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
