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
 * ██████████████████████ #components/widgets/lab/substrate-live-card/index.vue █████████████████████████████████████████
 *
 * Live node-health card for the Substrate Overview: headline metrics (CPU, RAM, uptime, guests), an expandable
 * secondary row (load, disk, swap), and an "updated Ns ago" stamp. Fed by useSubstrateMetrics.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

const { data, state, cpuSeries, memSeries, updatedLabel } = useSubstrateMetrics();
const node = computed(() => data.value?.node ?? null);
const guests = computed(() => data.value?.guests ?? null);
const storage = computed(() => data.value?.storage ?? null);
const vis = computed(() => METRIC_STATE[state.value]);
const showMore = ref(false);

interface Tile {
  label: string;
  value: string;
  sub: string;
  series?: number[];
}

const stats = computed<Tile[]>(() => {
  const n = node.value;
  const g = guests.value;
  if (!n) return [];
  return [
    { label: 'CPU', value: `${n.cpuPct}%`, sub: '', series: cpuSeries.value },
    { label: 'RAM', value: `${n.mem.usedPct}%`, sub: `${n.mem.totalGiB} GB`, series: memSeries.value },
    { label: 'Uptime', value: formatUptime(n.uptimeSec), sub: '' },
    { label: 'Services', value: g ? String(g.running) : '0', sub: g ? `of ${g.vms + g.cts}` : '' },
  ];
});
</script>

<template>
  <div class="border-border bg-surface rounded-2xl border p-5">
    <div class="mb-4 flex items-center justify-between gap-3">
      <span class="inline-flex items-center gap-2">
        <span class="relative flex size-2">
          <span
            v-if="vis.pulse"
            class="absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden"
            :class="vis.dot"
          />
          <span class="relative inline-flex size-2 rounded-full" :class="vis.dot" />
        </span>
        <span class="text-caption font-mono tracking-widest uppercase" :class="vis.text">{{ vis.label }}</span>
        <span class="text-caption text-ink-subtle font-mono">Proxmox node</span>
      </span>
      <span v-if="updatedLabel" class="text-caption text-ink-subtle shrink-0 font-mono"
        >updated {{ updatedLabel }}</span
      >
    </div>

    <template v-if="node && state !== 'offline'">
      <dl class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div v-for="s in stats" :key="s.label" class="border-border bg-bg/40 rounded-xl border px-3 py-2.5">
          <dt class="text-caption text-ink-subtle font-mono tracking-widest uppercase">{{ s.label }}</dt>
          <dd class="font-display text-h5 text-ink mt-0.5 leading-none font-bold">{{ s.value }}</dd>
          <dd v-if="s.sub" class="text-caption text-ink-subtle mt-0.5 font-mono">{{ s.sub }}</dd>
          <DataSparkLine
            v-if="s.series"
            :points="s.series"
            :width="72"
            :height="14"
            class="text-accent-secondary mt-1.5"
          />
        </div>
      </dl>

      <button
        type="button"
        class="text-caption text-ink-subtle hover:text-accent mt-3 inline-flex items-center gap-1 font-mono transition-colors"
        @click="showMore = !showMore"
      >
        {{ showMore ? 'Less' : 'More' }}
        <Icon :name="showMore ? 'lucide:chevron-up' : 'lucide:chevron-down'" size="12" />
      </button>
      <div
        v-if="showMore"
        class="border-border text-caption text-ink-muted mt-2 flex flex-wrap gap-x-5 gap-y-1 border-t pt-3 font-mono"
      >
        <span
          >Load <span class="text-ink">{{ node.loadAvg[0] }}</span></span
        >
        <span v-if="storage"
          >Disk <span class="text-ink">{{ storage.usedPct }}%</span></span
        >
        <span v-if="node.swap"
          >Swap <span class="text-ink">{{ node.swap.usedPct }}%</span></span
        >
      </div>
    </template>

    <p v-else class="font-body text-body-sm text-ink-subtle">
      The node is quiet. Last-known stats will show here when it checks back in.
    </p>
  </div>
</template>
