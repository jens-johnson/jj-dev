<script setup lang="ts">
// ─── layouts/default.vue ──────────────────────────────────────────────────────
// Root layout. Applies the persisted theme on mount, renders nav + footer
// around every page.

const { initTheme } = useTheme()
onMounted(initTheme)
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bg text-ink transition-colors duration-[--duration-theme]">
    <AppNav />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
