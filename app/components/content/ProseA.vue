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
 * ██████████████████████████████████████████ #components/content/ProseA.vue ███████████████████████████████████████████
 *
 * Override of Nuxt Content's default ProseA. Renders a plain anchor and automatically applies rel="noopener noreferrer"
 * when the link targets a new tab.
 *
 * ─── PROPS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • href
 *     - Description: The link destination URL
 *     - Type: string
 *     - Required: false
 *   • target
 *     - Description: The anchor target attribute; "_blank" also opts into the noopener/noreferrer rel
 *     - Type: string
 *     - Required: false
 *
 * ─── SLOTS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • default
 *     - Description: The link text/content
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
defineProps<{
  href?: string;
  target?: string;
}>();
</script>

<template>
  <a
    :href="href"
    :target="target"
    :rel="target === '_blank' ? 'noopener noreferrer' : undefined"
  >
    <slot />
  </a>
</template>
