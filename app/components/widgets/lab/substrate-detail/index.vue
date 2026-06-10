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
 * █████████████████████████ #components/widgets/lab/substrate-detail/index.vue █████████████████████████████████████████
 *
 * Inspector panel for the device selected in the Substrate topology. Renders the structured frontmatter — status,
 * vendor/model, specs, wiring, power, tags — and exposes a `#notes` slot for the device's rendered markdown body.
 * Shows a hint state when nothing is selected.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <WidgetsLabSubstrateDetail :device="selected" :devices="devices" :has-notes="!!selectedDoc">
 *   <template #notes><ContentRenderer :value="selectedDoc" /></template>
 * </WidgetsLabSubstrateDetail>
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { SubstrateDevice } from '~/types/substrate';

const props = defineProps<{
  device: SubstrateDevice | null;
  devices: SubstrateDevice[];
  hasNotes?: boolean;
}>();

/* ─── Connection resolution ───────────────────────────────────────────────────────────────────────────────────────── */

const byId = computed(() => new Map(props.devices.map((d) => [d.nodeId, d])));
const titleOf = (id: string) => byId.value.get(id)?.title ?? id;

const CONN_ICON: Record<string, string> = {
  uplink: 'lucide:arrow-up-right',
  network: 'lucide:share-2',
  data: 'lucide:arrow-left-right',
  power: 'lucide:zap',
};
const FALLBACK_CONN_ICON = 'lucide:share-2';
const connIcon = (kind?: string) => CONN_ICON[kind ?? 'network'] ?? FALLBACK_CONN_ICON;

const CONN_LABEL: Record<string, string> = {
  uplink: 'Uplink',
  network: 'Network',
  data: 'Data',
  power: 'Power',
};
const connLabel = (kind?: string) => CONN_LABEL[kind ?? 'network'] ?? 'Link';

const vendorModel = computed(() =>
  props.device ? [props.device.vendor, props.device.model].filter(Boolean).join(' · ') : '',
);

/* ─── Live metrics (shown only for the live Proxmox host) ──────────────────────────────────────────────────────────── */

const { data: liveData, state: liveState, updatedLabel: liveUpdated } = useSubstrateMetrics();
const liveNode = computed(() =>
  props.device?.kind === 'hypervisor' && liveState.value !== 'offline' ? (liveData.value?.node ?? null) : null,
);
</script>

<template>
  <aside class="border-border bg-surface flex h-full min-h-[340px] flex-col rounded-2xl border p-6">
    <!-- ─── Hint state ─────────────────────────────────────────────────────────── -->
    <div v-if="!device" class="flex flex-1 flex-col items-center justify-center text-center">
      <span
        class="bg-bg text-ink-subtle border-border mb-4 flex size-12 items-center justify-center rounded-full border"
      >
        <Icon name="lucide:mouse-pointer-click" size="20" />
      </span>
      <p class="font-display text-h5 text-ink font-bold">Select a node</p>
      <p class="font-body text-body-sm text-ink-muted mt-2 max-w-[28ch] leading-relaxed">
        Tap any device in the topology to inspect its specs, wiring, and notes.
      </p>
    </div>

    <!-- ─── Device detail ──────────────────────────────────────────────────────── -->
    <div v-else class="flex flex-1 flex-col gap-5">
      <!-- Header -->
      <div class="flex items-start gap-3">
        <span
          class="flex size-11 shrink-0 items-center justify-center rounded-xl"
          :class="
            device.status === 'planned'
              ? 'border-border text-ink-subtle border border-dashed'
              : 'bg-accent/10 text-accent'
          "
        >
          <Icon :name="kindIcon(device.kind)" size="22" />
        </span>

        <div class="min-w-0 flex-1">
          <p class="text-accent mb-0.5 font-mono text-[10px] tracking-widest uppercase">{{ kindLabel(device.kind) }}</p>
          <h3 class="font-display text-h5 text-ink leading-tight font-bold">{{ device.title }}</h3>
          <p v-if="vendorModel" class="text-caption text-ink-subtle mt-0.5 font-mono">{{ vendorModel }}</p>
        </div>

        <!-- Status pill -->
        <span
          class="text-caption inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-mono font-medium"
          :class="statusOf(device.status).tint"
        >
          <span class="size-1.5 rounded-full" :class="statusOf(device.status).dot" />
          <span :class="statusOf(device.status).text">{{ statusOf(device.status).label }}</span>
        </span>
      </div>

      <!-- Description -->
      <p v-if="device.description" class="font-body text-body-sm text-ink-muted leading-relaxed">
        {{ device.description }}
      </p>

      <!-- Live metrics (host only) -->
      <div v-if="liveNode" class="border-border bg-bg/40 rounded-xl border p-3">
        <div class="mb-2 flex items-center justify-between">
          <span
            class="text-caption text-accent-secondary inline-flex items-center gap-1.5 font-mono tracking-widest uppercase"
          >
            <span class="bg-accent-secondary size-1.5 animate-pulse rounded-full motion-reduce:animate-none" />
            Live
          </span>
          <span v-if="liveUpdated" class="text-caption text-ink-subtle font-mono">{{ liveUpdated }}</span>
        </div>
        <div class="flex flex-wrap gap-x-4 gap-y-1">
          <span class="text-caption text-ink-muted font-mono">
            CPU <span class="text-ink font-semibold">{{ liveNode.cpuPct }}%</span>
          </span>
          <span class="text-caption text-ink-muted font-mono">
            RAM <span class="text-ink font-semibold">{{ liveNode.mem.usedPct }}%</span>
          </span>
          <span class="text-caption text-ink-muted font-mono">
            up <span class="text-ink font-semibold">{{ formatUptime(liveNode.uptimeSec) }}</span>
          </span>
        </div>
      </div>

      <!-- Specs -->
      <div v-if="device.specs?.length">
        <p class="text-ink-subtle mb-2 font-mono text-[10px] tracking-widest uppercase">Specs</p>
        <dl class="border-border divide-border divide-y overflow-hidden rounded-xl border">
          <div
            v-for="s in device.specs"
            :key="s.label"
            class="bg-bg/40 flex items-baseline justify-between gap-4 px-3 py-2"
          >
            <dt class="text-caption text-ink-subtle shrink-0 font-mono uppercase">{{ s.label }}</dt>
            <dd class="text-body-sm text-ink text-right font-medium">{{ s.value }}</dd>
          </div>
        </dl>
      </div>

      <!-- Connections -->
      <div v-if="device.connections?.length">
        <p class="text-ink-subtle mb-2 font-mono text-[10px] tracking-widest uppercase">Connections</p>
        <ul class="flex flex-col gap-1.5" role="list">
          <li
            v-for="c in device.connections"
            :key="`${c.to}-${c.kind}`"
            class="border-border bg-bg/40 flex items-center gap-2.5 rounded-lg border px-3 py-2"
          >
            <Icon :name="connIcon(c.kind)" size="14" class="text-ink-subtle shrink-0" />
            <span class="text-body-sm text-ink flex-1 truncate font-medium">{{ titleOf(c.to) }}</span>
            <span class="text-caption text-ink-subtle bg-surface rounded-full px-2 py-0.5 font-mono">
              {{ c.label ?? connLabel(c.kind) }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Meta: power + tags -->
      <div
        v-if="device.power != null || device.tags?.length"
        class="border-border flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t pt-4"
      >
        <span v-if="device.power != null" class="text-caption text-ink-muted inline-flex items-center gap-1 font-mono">
          <Icon name="lucide:zap" size="12" class="text-ink-subtle" />
          ~{{ device.power }} W idle
        </span>
        <span v-for="t in device.tags" :key="t" class="text-caption text-ink-subtle font-mono"> #{{ t }} </span>
      </div>

      <!-- Open the full per-device page -->
      <NuxtLink
        :to="`/lab/substrate/${device.nodeId}`"
        class="border-border bg-bg/40 hover:border-accent/60 text-body-sm text-ink hover:text-accent flex w-fit items-center gap-1.5 rounded-lg border px-3 py-2 font-semibold transition-colors"
      >
        Open full page
        <Icon name="lucide:arrow-up-right" size="14" />
      </NuxtLink>

      <!-- Notes (rendered markdown body, provided by the page) -->
      <div v-if="hasNotes" class="border-border border-t pt-4">
        <p class="text-ink-subtle mb-2 font-mono text-[10px] tracking-widest uppercase">Notes</p>
        <div class="substrate-notes">
          <slot name="notes" />
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Light prose treatment for the device's markdown body rendered into the #notes slot. */
.substrate-notes :deep(h2),
.substrate-notes :deep(h3) {
  font-family: var(--font-display);
  font-size: var(--text-body-sm);
  font-weight: 700;
  color: var(--color-ink);
  margin: 0.75rem 0 0.25rem;
}

.substrate-notes :deep(p) {
  font-size: var(--text-body-sm);
  line-height: 1.6;
  color: var(--color-ink-muted);
  margin: 0.4rem 0;
}

.substrate-notes :deep(ul) {
  margin: 0.4rem 0;
  padding-left: 1.1rem;
  list-style: disc;
}

.substrate-notes :deep(li) {
  font-size: var(--text-body-sm);
  line-height: 1.55;
  color: var(--color-ink-muted);
  margin: 0.2rem 0;
}

.substrate-notes :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.8em;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.05rem 0.3rem;
}

.substrate-notes :deep(strong) {
  color: var(--color-ink);
  font-weight: 700;
}

.substrate-notes :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
}
</style>
