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
import type { IUseThemeReturn } from '~/composables/use-theme';

/**
 * The theme initializer from the theme composable; runs on mount to apply the persisted theme to the document
 * @internal
 * @constant
 */
const { initTheme }: IUseThemeReturn = useTheme();

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
