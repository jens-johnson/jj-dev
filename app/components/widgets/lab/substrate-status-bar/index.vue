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
 * ██████████████████████████████ #components/widgets/lab/substrate-status-bar/index.vue ███████████████████████████████
 *
 * Aggregate live-status bar for Substrate: a single rolled-up health pill (healthy | degraded | stale | offline) for
 * all metric-reporting nodes, the count reporting, headline CPU / RAM / internet latency, and an "updated Ns ago"
 * stamp. Fed by useSubstrateMetrics. Shows a quiet offline state without explaining why.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type { IStateVisual, IUseSubstrateMetricsReturn } from '~/composables/use-substrate-metrics';
import type { ISubstrateMetricsNode } from '~/types/substrate-metrics';

/* ─── COMPOSABLES ────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The shared live-metrics feed: current snapshot, feed state, rolled-up health, internet sample, reporting count, and
 * a human-readable freshness label
 * @internal
 * @constant
 */
const { data, state, health, internet, reportingCount, updatedLabel }: IUseSubstrateMetricsReturn =
  useSubstrateMetrics();

/* ─── COMPUTED ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The live node snapshot, or null while the feed has nothing yet
 * @internal
 * @constant
 */
const node: ComputedRef<ISubstrateMetricsNode | null> = computed(
  (): ISubstrateMetricsNode | null => data.value?.node ?? null,
);

/**
 * The visual treatment (dot, pulse, label) for the rolled-up health state
 * @internal
 * @constant
 */
const vis: ComputedRef<IStateVisual> = computed((): IStateVisual => METRIC_HEALTH[health.value]);

/**
 * The pluralized "N nodes reporting" caption
 * @internal
 * @constant
 */
const reportingLabel: ComputedRef<string> = computed((): string => {
  const n: number = reportingCount.value;
  return n === 1 ? '1 node reporting' : `${n} nodes reporting`;
});
</script>

<template>
  <div class="border-border bg-surface flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border px-5 py-3.5">
    <!-- Rolled-up health -->
    <span class="inline-flex items-center gap-2.5">
      <span class="relative flex size-2.5">
        <span
          v-if="vis.pulse"
          class="absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden"
          :class="vis.dot"
        />

        <span
          class="relative inline-flex size-2.5 rounded-full"
          :class="vis.dot"
        />
      </span>

      <span class="font-display text-body text-ink leading-none font-bold">{{ vis.label }}</span>
    </span>

    <span class="text-caption text-ink-subtle font-mono tracking-wide">{{ reportingLabel }}</span>

    <!-- Headline metrics -->
    <div
      v-if="node && state !== 'offline'"
      class="flex flex-wrap items-center gap-x-4 gap-y-1"
    >
      <span class="text-caption text-ink-muted font-mono">
        CPU <span class="text-ink font-semibold">{{ node.cpuPct }}%</span>
      </span>

      <span class="text-caption text-ink-muted font-mono">
        RAM <span class="text-ink font-semibold">{{ node.mem.usedPct }}%</span>
      </span>

      <span
        v-if="internet?.latencyMs !== undefined"
        class="text-caption text-ink-muted font-mono"
      >
        NET <span class="text-ink font-semibold">{{ internet.latencyMs }}ms</span>
      </span>
    </div>

    <span
      v-if="updatedLabel"
      class="text-caption text-ink-subtle ml-auto font-mono"
      >updated {{ updatedLabel }}</span
    >
  </div>
</template>
