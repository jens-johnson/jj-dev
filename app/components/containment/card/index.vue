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
 * ██████████████████████████████████████ #components/containment/card/index.vue ███████████████████████████████████████
 *
 * Surface card primitive. Elevated container with border, rounded corners, and a background surface color.
 *
 * ─── USAGE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <ContainmentCard :as="li" pad="lg">content</ContainmentCard>
 *
 * Props:
 *   as  — root element tag. Default "div". Use "article", "li", etc. as needed.
 *   pad — inner padding preset. Default "md". One of: none | sm | md | lg.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

type PadPreset = 'sm' | 'md' | 'lg' | 'none';

interface Props {
  as?: string;
  pad?: PadPreset;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  pad: 'md',
});

const padClass: Record<PadPreset, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};
</script>

<template>
  <component
    :is="props.as"
    class="border-border bg-surface overflow-hidden rounded-2xl border"
    :class="padClass[props.pad]"
  >
    <slot />
  </component>
</template>
