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

const progress = ref(0);

function updateProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progress.value = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
}

onMounted(() => {
  window.addEventListener('scroll', updateProgress, {
    passive: true,
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress);
});
</script>

<template>
  <div
    class="fixed left-0 top-0 z-[100] h-[2px] origin-left bg-accent"
    :style="{ transform: `scaleX(${progress})` }"
    aria-hidden="true"
  />
</template>
