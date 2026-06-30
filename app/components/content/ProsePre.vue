<script setup lang="ts">
/**
 * Override of Nuxt Content's default ProsePre. Renders a minimal pre+code block with a `data-language` attribute
 * so our prose-jj CSS can position a language label. Includes a copy-to-clipboard button.
 */
const props = defineProps<{
  code?: string;
  language?: string;
  filename?: string;
}>();

const copied = ref(false);

async function copy() {
  if (!props.code || !import.meta.client) return;
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1800);
  } catch {
    /* clipboard blocked; no-op */
  }
}
</script>

<template>
  <div class="prose-pre">
    <pre :data-language="language"><slot /></pre>
    <button type="button" class="prose-pre-copy" :aria-label="copied ? 'Copied' : 'Copy code'" @click="copy">
      <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" size="14" />
    </button>
  </div>
</template>
