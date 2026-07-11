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
 * ██████████████████████████████████ #components/feedback/scroll-progress/index.vue ███████████████████████████████████
 *
 * Thin accent-colored bar fixed to the top of the viewport that tracks how far the user has scrolled.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/* ─── STATE ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The 0..1 ratio of how far the user has scrolled through the document; drives the bar's scaleX transform
 * @internal
 * @constant
 */
const progress: Ref<number> = ref(0);

/* ─── HANDLERS ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A utility method to handle window scroll events; recomputes the 0..1 progress ratio from the current scroll offset
 * and the document's scrollable height
 * @internal
 * @function
 */
function updateProgress(): void {
  // Compute the scrollable height, guarding the divide-by-zero case on pages shorter than the viewport
  const maxScroll: number = document.documentElement.scrollHeight - window.innerHeight;
  progress.value = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
}

/* ─── LIFECYCLE ──────────────────────────────────────────────────────────────────────────────────────────────────── */

onMounted((): void => {
  window.addEventListener('scroll', updateProgress, {
    passive: true,
  });
});

onUnmounted((): void => {
  window.removeEventListener('scroll', updateProgress);
});
</script>

<template>
  <div
    class="bg-accent fixed top-0 left-0 z-[100] h-[2px] origin-left"
    :style="{ transform: `scaleX(${progress})` }"
    aria-hidden="true"
  />
</template>
