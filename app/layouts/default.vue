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
 * ███████████████████████████████████████████████ #layouts/default.vue ████████████████████████████████████████████████
 *
 * Root layout. Applies the persisted theme on mount, renders nav and footer around every page.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

const { initTheme } = useTheme();
onMounted(initTheme);
</script>

<template>
  <div class="bg-bg text-ink flex min-h-screen flex-col transition-colors duration-[--duration-theme]">
    <FeedbackScrollProgress />
    <LayoutAppNav />
    <main class="flex-1">
      <slot />
    </main>
    <LayoutAppFooter />
  </div>
</template>
