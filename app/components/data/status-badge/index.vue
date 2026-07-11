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
 * ██████████████████████████████████████ #components/data/status-badge/index.vue ██████████████████████████████████████
 *
 * Inline status badge for a content status value; active | wip | archived; with matching color treatment.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <DataStatusBadge status="active" />
 * <DataStatusBadge status="wip" />
 * <DataStatusBadge status="archived" />
 *
 * ─── PROPS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • status
 *     - Description: The content status to render; unknown values fall back to a neutral badge showing the raw value
 *     - Type: string
 *     - Required: false
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import { BADGE_VISUAL_BY_STATUS } from './constants';
import type { IStatusBadgeProps, IStatusBadgeVisual } from './types';

/* ─── PROPS ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Component props; the status value is optional and unknown values fall back to a neutral badge
 * @internal
 * @constant
 */
const props = defineProps<IStatusBadgeProps>();

/* ─── COMPUTED ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The visual treatment for the current status; unknown statuses fall back to a neutral badge showing the raw value
 * @internal
 * @constant
 */
const badge: ComputedRef<IStatusBadgeVisual> = computed(
  (): IStatusBadgeVisual =>
    BADGE_VISUAL_BY_STATUS[props.status ?? ''] ?? {
      label: props.status ?? '',
      cls: 'bg-surface text-ink-subtle',
    },
);
</script>

<template>
  <span
    class="text-caption inline-flex w-fit items-center rounded-full px-2.5 py-0.5 font-mono font-medium"
    :class="badge.cls"
  >
    {{ badge.label }}
  </span>
</template>
