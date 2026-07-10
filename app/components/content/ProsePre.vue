<script setup lang="ts">
/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                 ██        ██                     ▄▄
 *                                 ▀▀        ▀▀                     ██
 *                               ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                 ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                 ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                 ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                 ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                              ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * █████████████████████████████████████████ #components/content/ProsePre.vue ██████████████████████████████████████████
 *
 * Override of Nuxt Content's default ProsePre. Renders a minimal pre+code block with a `data-language` attribute so our
 * prose-jj CSS can position a language label. Includes a copy-to-clipboard button.
 *
 * ─── PROPS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • code
 *     - Description: The raw source of the code block; used by the copy-to-clipboard button
 *     - Type: string
 *     - Required: false
 *   • language
 *     - Description: The fence language identifier; rendered as the `data-language` attribute
 *     - Type: string
 *     - Required: false
 *   • filename
 *     - Description: The source filename from the fence header
 *     - Type: string
 *     - Required: false
 *
 * ─── SLOTS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • default
 *     - Description: The highlighted code content rendered inside the pre element
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
const props = defineProps<{
  code?: string;
  language?: string;
  filename?: string;
}>();

const copied: Ref<boolean> = ref(false);

/**
 * A utility method to copy the code block's raw source to the clipboard and flash the copied state for 1.8 seconds;
 * silently no-ops when the clipboard is unavailable or blocked
 * @internal
 * @function
 */
async function copy(): Promise<void> {
  // No-op when there is nothing to copy or we are not running in the browser
  if (!props.code || !import.meta.client) {
    return;
  }
  try {
    // Write the raw source to the clipboard, then flash the copied state for 1.8 seconds
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout((): void => {
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

    <button
      type="button"
      class="prose-pre-copy"
      :aria-label="copied ? 'Copied' : 'Copy code'"
      @click="copy"
    >
      <Icon
        :name="copied ? 'lucide:check' : 'lucide:copy'"
        size="14"
      />
    </button>
  </div>
</template>
