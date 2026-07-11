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

import { PAD_CLASS_BY_PRESET } from './constants';
import type { ICardProps } from './types';

/* ─── PROPS ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Component props; allows users to consume the Card component and alter the root element tag and inner padding preset
 * @internal
 * @constant
 */
const props: TPropsWithDefaults<ICardProps, 'as' | 'pad'> = withDefaults(defineProps<ICardProps>(), {
  as: 'div',
  pad: 'md',
});
</script>

<template>
  <component
    :is="props.as"
    class="border-border bg-surface overflow-hidden rounded-2xl border"
    :class="PAD_CLASS_BY_PRESET[props.pad]"
  >
    <slot />
  </component>
</template>
