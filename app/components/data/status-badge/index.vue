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
 * ██████████████████████████████████████ #components/data/status-badge/index.vue ██████████████████████████████████████
 *
 * Inline status badge for a content status value — active | wip | archived — with matching color treatment.
 *
 * ─── USAGE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <DataStatusBadge status="active" />
 * <DataStatusBadge status="wip" />
 * <DataStatusBadge status="archived" />
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

interface Props {
  status?: string;
}
const props = defineProps<Props>();

const config: Record<string, { label: string; cls: string }> = {
  active: {
    label: 'Active',
    cls: 'bg-accent/10 text-accent',
  },
  wip: {
    label: 'In progress',
    cls: 'bg-earth-300/20 text-earth-500',
  },
  archived: {
    label: 'Archived',
    cls: 'bg-surface text-ink-subtle',
  },
};

const badge = computed(
  () =>
    config[props.status ?? ''] ?? {
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
