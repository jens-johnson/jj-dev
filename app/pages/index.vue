<script setup lang="ts">
// ─── pages/index.vue ──────────────────────────────────────────────────────────
// Homepage.

useSeoMeta({
  title: 'Jens Johnson — Software Engineer',
  description: 'Software engineer based in San Diego, CA. I build thoughtful products and write about the process.',
  ogTitle: 'Jens Johnson',
  ogDescription: 'Software engineer based in San Diego, CA.',
})
</script>

<template>
  <div>
    <HomeHero />
    <HomeFeaturedProjects />
    <HomeRecentWriting />
  </div>
</template>
