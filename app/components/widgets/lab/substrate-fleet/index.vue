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
 * ████████████████████████ #components/widgets/lab/substrate-fleet/index.vue ███████████████████████████████████████████
 *
 * Combined fleet card for Substrate. Collapsed, it's a Nodes / Online / Planned summary; expanded, it's a per-device
 * telemetry table where the live Proxmox host surfaces CPU / RAM (gauge + sparkline), uptime, and running services.
 * Merges the static device inventory (content) with the live feed (useSubstrateMetrics).
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { ISubstrateDevice } from '~/types/substrate';

const props = defineProps<{ devices: ISubstrateDevice[] }>();

const { data, state, cpuSeries, memSeries, updatedLabel } = useSubstrateMetrics();
const node = computed(() => data.value?.node ?? null);
const guests = computed(() => data.value?.guests ?? null);

const open = ref(false);

/* ─── Summary counts (the collapsed surface) ──────────────────────────────────────────────────────────────────────── */

const summary = computed(() => {
  const l = props.devices;
  return [
    { label: 'Nodes', value: l.length },
    { label: 'Online', value: l.filter((d) => d.status === 'online').length },
    { label: 'Planned', value: l.filter((d) => d.status === 'planned').length },
  ];
});

/* ─── Per-device rows, sorted by topology order ───────────────────────────────────────────────────────────────────── */

const rows = computed(() =>
  [...props.devices].sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.title.localeCompare(b.title)),
);

/** The one device the live feed describes today (the hypervisor); telemetry only renders on its row. */
const liveId = computed(() => props.devices.find((d) => d.kind === 'hypervisor')?.nodeId ?? null);
const isLive = (d: ISubstrateDevice) => d.nodeId === liveId.value && state.value !== 'offline' && !!node.value;

/** Gauge + sparkline tone: cools to the live accent, warms to terra under pressure. */
function tone(pct: number) {
  return pct >= 92
    ? { bar: 'bg-terra-400', text: 'text-terra-400' }
    : { bar: 'bg-accent-secondary', text: 'text-accent-secondary' };
}
</script>

<template>
  <section class="border-border bg-surface overflow-hidden rounded-2xl border">
    <!-- ─── Collapsed surface (toggles the telemetry table) ────────────────────── -->
    <button
      type="button"
      class="hover:bg-bg/30 flex w-full items-center gap-px text-left transition-colors"
      :aria-expanded="open"
      aria-controls="substrate-fleet-table"
      @click="open = !open"
    >
      <dl class="grid flex-1 grid-cols-3 gap-px">
        <div v-for="s in summary" :key="s.label" class="flex flex-col gap-1 px-5 py-4">
          <dt class="text-caption text-ink-subtle font-mono tracking-widest uppercase">{{ s.label }}</dt>
          <dd class="font-display text-h4 text-ink leading-none font-bold">{{ s.value }}</dd>
        </div>
      </dl>
      <span class="text-ink-subtle flex shrink-0 items-center gap-1.5 px-5">
        <span class="text-caption hidden font-mono tracking-widest uppercase sm:inline">
          {{ open ? 'Hide' : 'Telemetry' }}
        </span>
        <Icon :name="open ? 'lucide:chevron-up' : 'lucide:chevron-down'" size="16" />
      </span>
    </button>

    <!-- ─── Expanded: per-device telemetry ─────────────────────────────────────── -->
    <div v-show="open" id="substrate-fleet-table" class="border-border border-t p-3 sm:p-4">
      <div class="mb-3 flex items-center justify-between px-1">
        <p class="text-caption text-ink-subtle font-mono tracking-widest uppercase">Per-device telemetry</p>
        <span v-if="updatedLabel" class="text-caption text-ink-subtle font-mono">updated {{ updatedLabel }}</span>
      </div>

      <ul class="flex flex-col gap-2" role="list">
        <li
          v-for="d in rows"
          :key="d.nodeId"
          class="border-border bg-bg/40 rounded-xl border p-3 sm:p-3.5"
          :class="{ 'opacity-70': d.status === 'planned' }"
        >
          <div class="flex flex-wrap items-center gap-x-4 gap-y-3">
            <!-- Identity -->
            <NuxtLink :to="`/lab/substrate/${d.nodeId}`" class="group flex min-w-[8.5rem] flex-1 items-center gap-2.5">
              <span
                class="flex size-8 shrink-0 items-center justify-center rounded-lg"
                :class="
                  d.status === 'planned'
                    ? 'border-border text-ink-subtle border border-dashed'
                    : 'bg-accent/10 text-accent'
                "
              >
                <Icon :name="kindIcon(d.kind)" size="16" />
              </span>
              <span class="min-w-0">
                <span
                  class="text-body-sm text-ink group-hover:text-accent block truncate font-semibold transition-colors"
                >
                  {{ d.title }}
                </span>
                <span class="text-caption text-ink-subtle block font-mono">{{ kindLabel(d.kind) }}</span>
              </span>
            </NuxtLink>

            <!-- Status -->
            <span
              class="text-caption inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-mono font-medium"
              :class="statusOf(d.status).tint"
            >
              <span class="size-1.5 rounded-full" :class="statusOf(d.status).dot" />
              <span :class="statusOf(d.status).text">{{ statusOf(d.status).label }}</span>
            </span>

            <!-- Live telemetry (the reporting host only) -->
            <template v-if="isLive(d) && node">
              <!-- CPU -->
              <div class="w-24">
                <div class="flex items-baseline justify-between">
                  <span class="text-caption text-ink-subtle font-mono tracking-wider uppercase">CPU</span>
                  <span class="text-caption text-ink font-mono font-semibold">{{ node.cpuPct }}%</span>
                </div>
                <div class="bg-border/60 mt-1 h-1.5 overflow-hidden rounded-full">
                  <div
                    class="h-full rounded-full"
                    :class="tone(node.cpuPct).bar"
                    :style="{ width: Math.min(100, node.cpuPct) + '%' }"
                  />
                </div>
                <DataSparkLine
                  :points="cpuSeries"
                  :width="96"
                  :height="16"
                  class="mt-1.5"
                  :class="tone(node.cpuPct).text"
                />
              </div>

              <!-- RAM -->
              <div class="w-24">
                <div class="flex items-baseline justify-between">
                  <span class="text-caption text-ink-subtle font-mono tracking-wider uppercase">RAM</span>
                  <span class="text-caption text-ink font-mono font-semibold">{{ node.mem.usedPct }}%</span>
                </div>
                <div class="bg-border/60 mt-1 h-1.5 overflow-hidden rounded-full">
                  <div
                    class="h-full rounded-full"
                    :class="tone(node.mem.usedPct).bar"
                    :style="{ width: Math.min(100, node.mem.usedPct) + '%' }"
                  />
                </div>
                <DataSparkLine
                  :points="memSeries"
                  :width="96"
                  :height="16"
                  class="mt-1.5"
                  :class="tone(node.mem.usedPct).text"
                />
              </div>

              <!-- Uptime -->
              <div class="w-16">
                <p class="text-caption text-ink-subtle font-mono tracking-wider uppercase">Up</p>
                <p class="text-body-sm text-ink mt-0.5 font-mono font-semibold">{{ formatUptime(node.uptimeSec) }}</p>
              </div>

              <!-- Services -->
              <div class="w-16">
                <p class="text-caption text-ink-subtle font-mono tracking-wider uppercase">Svc</p>
                <p class="text-body-sm text-ink mt-0.5 font-mono font-semibold">{{ guests ? guests.running : 0 }}</p>
              </div>
            </template>

            <span v-else class="text-caption text-ink-subtle font-mono italic">
              {{ d.kind === 'hypervisor' ? 'awaiting check-in' : 'no live telemetry' }}
            </span>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
