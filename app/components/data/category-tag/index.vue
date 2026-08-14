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
 * ██████████████████████████████████████ #components/data/category-tag/index.vue ██████████████████████████████████████
 *
 * Inline category tag for a bento pick; icon plus label with a per-category color treatment and a neutral fallback for
 * unknown values.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import { TAG_VISUAL_BY_CATEGORY } from './constants';
import type { ICategoryTagProps, ICategoryTagVisual } from './types';

/* ─── PROPS ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Component props; the category value is optional and unknown values fall back to a neutral tag
 * @internal
 * @constant
 */
const props = defineProps<ICategoryTagProps>();

/* ─── COMPUTED ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The visual treatment for the current category; unknown categories fall back to a neutral tag showing the
 * capitalized raw value with a generic icon
 * @internal
 * @constant
 */
const tag: ComputedRef<ICategoryTagVisual> = computed((): ICategoryTagVisual => {
  const raw = props.category ?? '';
  return (
    TAG_VISUAL_BY_CATEGORY[raw] ?? {
      label: raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Pick',
      icon: 'lucide:sparkles',
      cls: 'bg-surface text-ink-subtle',
    }
  );
});
</script>

<template>
  <span
    class="text-caption inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 font-mono font-medium tracking-wide"
    :class="tag.cls"
  >
    <Icon
      :name="tag.icon"
      size="11"
    />
    {{ tag.label }}
  </span>
</template>
