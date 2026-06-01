<script setup lang="ts">
defineProps<{
  href?: string;
  target?: string;
}>();
</script>

<template>
  <a :href="href" :target="target" :rel="target === '_blank' ? 'noopener noreferrer' : undefined">
    <slot />
  </a>
</template>
