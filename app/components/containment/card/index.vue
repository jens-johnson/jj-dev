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
 * ██████████████████████████████████████ #components/containment/card/index.vue ███████████████████████████████████████
 *
 * Surface card primitive. Elevated container with border, rounded corners, and a background surface color.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <ContainmentCard as="li" pad="lg">content</ContainmentCard>
 *
 * ─── PROPS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • as
 *     - Description: The root element tag; use "article", "li", etc. as needed
 *     - Type: string
 *     - Required: false
 *     - Default: 'div'
 *   • pad
 *     - Description: The inner padding preset
 *     - Type: 'sm' | 'md' | 'lg' | 'none'
 *     - Required: false
 *     - Default: 'md'
 *
 * ─── SLOTS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • default
 *     - Description: The card content rendered inside the padded surface
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type { TPropsWithDefaults } from '@jens-johnson/style-guide/types/vue';

/**
 * The inner padding presets the card supports
 * @internal
 */
type TPadPreset = 'sm' | 'md' | 'lg' | 'none';

/**
 * Component props; allows users to consume the Card component and alter the root element tag and inner padding preset
 * @internal
 * @interface
 */
interface Props {
  /* The root element tag; use "article", "li", etc. as needed */
  as?: string;

  /* The inner padding preset */
  pad?: TPadPreset;
}

const props: TPropsWithDefaults<Props, 'as' | 'pad'> = withDefaults(defineProps<Props>(), {
  as: 'div',
  pad: 'md',
});

/**
 * Maps each padding preset to its Tailwind padding class
 * @internal
 * @constant
 */
const padClass: Record<TPadPreset, string> = {
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
