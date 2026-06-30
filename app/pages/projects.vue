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
 * ████████████████████████████████████████████████ #pages/projects.vue ████████████████████████████████████████████████
 *
 * Projects listing; full portfolio of case studies and open-source work. Under construction.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

useSeoMeta({
  title: 'Projects · Jens Johnson',
  robots: 'noindex',
});
</script>

<template>
  <div class="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-24 text-center">
    <p class="text-caption text-accent mb-6 font-mono tracking-widest uppercase">02 · Projects</p>
    <h1
      class="font-display text-ink mb-6 leading-tight font-bold tracking-tight"
      style="font-size: clamp(2.5rem, 6vw, 4.5rem)"
    >
      Under construction.
    </h1>
    <p class="font-body text-body text-ink-muted mb-10 max-w-sm leading-relaxed">
      Something good is coming. Projects, case studies, and open-source work, all being put together now.
    </p>
    <NuxtLink
      to="/"
      class="font-body text-body-sm text-ink-muted hover:text-ink inline-flex items-center gap-2 font-semibold transition-colors"
    >
      <Icon name="lucide:arrow-left" size="14" /> Back home
    </NuxtLink>
  </div>
</template>
