<script setup lang="ts">
// ─── ContainmentCard ──────────────────────────────────────────────────────────
// Surface card primitive. Elevated container with border, rounded corners,
// and a background surface color. The default slot carries all card content.
//
// Props:
//   as  — root element tag. Default 'div'. Use 'article', 'li', etc. as needed.
//   pad — inner padding preset. Default 'md'.

type PadPreset = 'sm' | 'md' | 'lg' | 'none';

interface Props {
  as?: string
  pad?: PadPreset
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
    class="overflow-hidden rounded-2xl border border-border bg-surface"
    :class="padClass[props.pad]"
  >
    <slot />
  </component>
</template>
