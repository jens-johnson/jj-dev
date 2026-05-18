<script setup lang="ts">
// ─── HomeHero ─────────────────────────────────────────────────────────────────
// Full-viewport hero. Display-size name, one-liner, two CTAs.
// Typography does all the heavy lifting — no background image.
</script>

<template>
  <section class="mx-auto flex max-w-6xl flex-col justify-center px-6 pb-24 pt-20 md:pt-32">

    <!-- Eyebrow -->
    <p class="mb-6 font-mono text-caption uppercase tracking-widest text-accent">
      Software engineer · San Diego, CA
    </p>

    <!-- Name / headline -->
    <h1 class="font-display text-h1 font-bold leading-[1.05] tracking-tight text-ink md:text-display">
      Jens<br>Johnson
    </h1>

    <!-- Sub-headline -->
    <p class="mt-6 max-w-xl font-body text-body-lg leading-relaxed text-ink-muted md:mt-8">
      I build thoughtful software and write about the process.
      Currently crafting products at the intersection of engineering and design.
    </p>

    <!-- CTAs -->
    <div class="mt-10 flex flex-wrap items-center gap-4">
      <NuxtLink
        to="/work"
        class="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-body text-body-sm font-semibold text-stone-50 transition-opacity hover:opacity-90"
      >
        View my work
        <Icon name="lucide:arrow-right" size="14" />
      </NuxtLink>
      <NuxtLink
        to="/about"
        class="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-body text-body-sm font-semibold text-ink-muted transition-colors hover:border-ink hover:text-ink"
      >
        About me
      </NuxtLink>
    </div>

  </section>
</template>
