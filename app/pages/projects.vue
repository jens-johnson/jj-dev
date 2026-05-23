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
 * Projects listing — full portfolio of case studies and open-source work. Under construction.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

useSeoMeta({ title: 'Projects — Jens Johnson', robots: 'noindex' });
</script>

<template>
  <div class="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-24 text-center">
    <p class="mb-6 font-mono text-caption uppercase tracking-widest text-accent">
      02 — Projects
    </p>
    <h1
      class="mb-6 font-display font-bold leading-tight tracking-tight text-ink"
      style="font-size: clamp(2.5rem, 6vw, 4.5rem)"
    >
      Under construction.
    </h1>
    <p class="mb-10 max-w-sm font-body text-body leading-relaxed text-ink-muted">
      Something good is coming. Projects, case studies, and open-source work —
      all being put together now.
    </p>
    <NuxtLink
      to="/"
      class="inline-flex items-center gap-2 font-body text-body-sm font-semibold text-ink-muted transition-colors hover:text-ink"
    >
      <Icon name="lucide:arrow-left" size="14" /> Back home
    </NuxtLink>
  </div>
</template>
