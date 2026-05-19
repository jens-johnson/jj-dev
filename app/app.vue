<script setup lang="ts">
// ─── app.vue ─────────────────────────────────────────────────────────────────
// Root application shell — wraps every page in the default layout and mounts the Nuxt route announcer for accessibility.
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
