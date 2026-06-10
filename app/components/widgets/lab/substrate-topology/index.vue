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
 * ████████████████████████ #components/widgets/lab/substrate-topology/index.vue ████████████████████████████████████████
 *
 * Interactive network diagram of the homelab. Devices are placed in horizontal bands by `layer`; connections are
 * drawn as curved SVG wires behind HTML node cards, with animated dashes conveying live data flow. Hovering or
 * selecting a node spotlights its wiring and dims everything else.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <WidgetsLabSubstrateTopology :devices="devices" v-model:selected-id="selectedId" />
 *
 * Layout is deterministic (SSR-safe): SVG uses a fixed 1000×620 viewBox and HTML nodes are positioned by the same
 * percentage coordinates, so wires and cards stay aligned at any scale. Honours prefers-reduced-motion.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { SubstrateDevice } from '~/types/substrate';

const props = defineProps<{ devices: SubstrateDevice[] }>();

/** Two-way bound selected node id — null when nothing is inspected. */
const selectedId = defineModel<string | null>('selectedId', { default: null });

/* ─── Interaction state ───────────────────────────────────────────────────────────────────────────────────────────── */

const hoveredId = ref<string | null>(null);

/** Hover wins over selection for the spotlight, so the diagram feels responsive before you commit a click. */
const activeId = computed(() => hoveredId.value ?? selectedId.value);

/* ─── Layout ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Vertical band order, top (faces the internet) to bottom (power). */
const LAYER_ORDER = ['edge', 'network', 'compute', 'storage', 'service', 'client', 'power'] as const;

/** Fixed SVG coordinate space. HTML nodes map onto it by percentage. */
const VB = { w: 1000, h: 620 };
const PAD = { top: 64, bottom: 64 };

/** Only render bands that actually contain a device. */
const activeLayers = computed(() => LAYER_ORDER.filter((l) => props.devices.some((d) => d.layer === l)));

/** id → centre point in viewBox units. */
const layout = computed(() => {
  const map = new Map<string, { x: number; y: number }>();
  const rows = activeLayers.value;
  const usableH = VB.h - PAD.top - PAD.bottom;
  const rowGap = rows.length > 1 ? usableH / (rows.length - 1) : 0;

  rows.forEach((layer, ri) => {
    const y = rows.length > 1 ? PAD.top + ri * rowGap : VB.h / 2;
    const inRow = props.devices
      .filter((d) => d.layer === layer)
      .sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.title.localeCompare(b.title));

    inRow.forEach((d, ci) => {
      map.set(d.nodeId, { x: (VB.w * (ci + 1)) / (inRow.length + 1), y });
    });
  });

  return map;
});

interface Edge {
  from: string;
  to: string;
  kind: string;
  label?: string;
}

/** Flatten every device's connections into drawable edges, dropping any that reference a missing node. */
const edges = computed<Edge[]>(() => {
  const out: Edge[] = [];
  for (const d of props.devices) {
    for (const c of d.connections ?? []) {
      if (!layout.value.has(d.nodeId) || !layout.value.has(c.to)) continue;
      out.push({ from: d.nodeId, to: c.to, kind: c.kind ?? 'network', label: c.label });
    }
  }
  return out;
});

/** Cubic-bezier wire between two node centres — eases along x when near-horizontal, along y otherwise. */
function edgePath(e: Edge): string {
  const a = layout.value.get(e.from);
  const b = layout.value.get(e.to);
  if (!a || !b) return '';
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (Math.abs(dy) < 60) {
    return `M ${a.x} ${a.y} C ${a.x + dx * 0.4} ${a.y}, ${b.x - dx * 0.4} ${b.y}, ${b.x} ${b.y}`;
  }
  const k = Math.abs(dy) * 0.5 * (dy > 0 ? 1 : -1);
  return `M ${a.x} ${a.y} C ${a.x} ${a.y + k}, ${b.x} ${b.y - k}, ${b.x} ${b.y}`;
}

/** Absolute-position style for a node card, centred on its layout point. */
function nodeStyle(id: string) {
  const p = layout.value.get(id);
  if (!p) return {};
  return { left: `${(p.x / VB.w) * 100}%`, top: `${(p.y / VB.h) * 100}%` };
}

/* ─── Spotlight ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Ids directly wired to the active node (either direction). */
const connectedIds = computed(() => {
  const set = new Set<string>();
  const id = activeId.value;
  if (!id) return set;
  for (const e of edges.value) {
    if (e.from === id) set.add(e.to);
    if (e.to === id) set.add(e.from);
  }
  return set;
});

const edgeActive = (e: Edge) => !!activeId.value && (e.from === activeId.value || e.to === activeId.value);
const edgeDimmed = (e: Edge) => !!activeId.value && !edgeActive(e);
const nodeDimmed = (id: string) => !!activeId.value && id !== activeId.value && !connectedIds.value.has(id);

/* ─── Visual maps ─────────────────────────────────────────────────────────────────────────────────────────────────── */

const STROKE_ACCENT = 'stroke-accent';
const STROKE_MUTED = 'stroke-ink-subtle';
const STROKE_DATA = 'stroke-accent-secondary';

const EDGE_BASE: Record<string, string> = {
  uplink: STROKE_ACCENT,
  network: STROKE_MUTED,
  data: STROKE_DATA,
  power: STROKE_MUTED,
};

function edgeBaseClass(e: Edge) {
  return edgeActive(e) ? STROKE_ACCENT : (EDGE_BASE[e.kind] ?? STROKE_MUTED);
}
function edgeBaseOpacity(e: Edge) {
  if (edgeActive(e)) return 'opacity-100';
  if (edgeDimmed(e)) return 'opacity-10';
  return e.kind === 'power' ? 'opacity-25' : 'opacity-60';
}
function edgeFlowClass(e: Edge) {
  return edgeActive(e) ? STROKE_ACCENT : e.kind === 'data' ? STROKE_DATA : STROKE_ACCENT;
}

// Status colours + kind icons come from the auto-imported #utils/substrate-visuals (statusOf, kindIcon),
// shared with the inspector panel so a node looks identical wherever it appears.

/** Toggle selection — clicking the selected node again clears the inspector. */
function toggle(id: string) {
  selectedId.value = selectedId.value === id ? null : id;
}
</script>

<template>
  <div class="overflow-x-auto">
    <div
      class="substrate-stage relative w-full min-w-[760px]"
      style="aspect-ratio: 1000 / 620"
      @mouseleave="hoveredId = null"
    >
      <!-- Dotted infrastructure backdrop -->
      <div class="substrate-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      <!-- Wires (behind the nodes; clicks pass through) -->
      <svg
        class="pointer-events-none absolute inset-0 h-full w-full"
        :viewBox="`0 0 ${VB.w} ${VB.h}`"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        aria-hidden="true"
      >
        <g v-for="(e, i) in edges" :key="`${e.from}-${e.to}-${i}`">
          <!-- Static wire -->
          <path
            :d="edgePath(e)"
            class="transition-opacity duration-300"
            :class="[edgeBaseClass(e), edgeBaseOpacity(e)]"
            :stroke-width="edgeActive(e) ? 2.5 : e.kind === 'uplink' ? 2 : 1.5"
            :stroke-dasharray="e.kind === 'power' ? '1 7' : undefined"
            stroke-linecap="round"
          />
          <!-- Animated data-flow overlay (skipped for power feeds) -->
          <path
            v-if="e.kind !== 'power'"
            :d="edgePath(e)"
            class="substrate-flow transition-opacity duration-300"
            :class="[edgeFlowClass(e), edgeActive(e) ? 'opacity-90' : activeId ? 'opacity-0' : 'opacity-40']"
            :stroke-width="edgeActive(e) ? 2.5 : 1.5"
            stroke-linecap="round"
            stroke-dasharray="3 9"
          />
        </g>
      </svg>

      <!-- Nodes -->
      <button
        v-for="d in devices"
        :key="d.nodeId"
        type="button"
        class="group absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 focus:outline-none"
        :style="nodeStyle(d.nodeId)"
        :class="nodeDimmed(d.nodeId) ? 'opacity-40' : 'opacity-100'"
        :aria-pressed="selectedId === d.nodeId"
        :aria-label="`Inspect ${d.title}, ${statusOf(d.status).label}`"
        @click="toggle(d.nodeId)"
        @mouseenter="hoveredId = d.nodeId"
        @focus="hoveredId = d.nodeId"
        @blur="hoveredId = null"
      >
        <div
          class="bg-surface/95 relative flex w-[140px] items-center gap-2.5 rounded-xl border px-3 py-2 text-left shadow-sm backdrop-blur-sm transition-all duration-200 group-focus-visible:ring-2"
          :class="[
            selectedId === d.nodeId
              ? 'border-accent ring-accent/40 -translate-y-0.5 shadow-md ring-2'
              : 'border-border group-hover:border-accent/60 group-focus-visible:border-accent ring-accent/40 group-hover:-translate-y-0.5 group-hover:shadow-md',
            d.status === 'planned' ? 'border-dashed' : '',
          ]"
        >
          <!-- Kind icon -->
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-lg"
            :class="
              d.status === 'planned' ? 'border-border text-ink-subtle border border-dashed' : 'bg-accent/10 text-accent'
            "
          >
            <Icon :name="kindIcon(d.kind)" size="16" />
          </span>

          <!-- Name + kind -->
          <span class="min-w-0 flex-1">
            <span class="text-body-sm text-ink block truncate leading-tight font-semibold">{{ d.title }}</span>
            <span class="text-ink-subtle block truncate font-mono text-[10px] tracking-wide uppercase">
              {{ d.kind }}
            </span>
          </span>

          <!-- Status dot (pings while online) -->
          <span class="absolute top-1.5 right-1.5 flex size-2">
            <span
              v-if="d.status === 'online'"
              class="absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden"
              :class="statusOf(d.status).dot"
            />
            <span class="relative inline-flex size-2 rounded-full" :class="statusOf(d.status).dot" />
          </span>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.substrate-grid {
  background-image: radial-gradient(circle, var(--color-border) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.45;
  mask-image: radial-gradient(ellipse 85% 80% at 50% 45%, #000 35%, transparent 100%);
}

.substrate-flow {
  animation: substrate-flow 1.4s linear infinite;
}

@keyframes substrate-flow {
  to {
    stroke-dashoffset: -24;
  }
}

@media (prefers-reduced-motion: reduce) {
  .substrate-flow {
    animation: none;
  }
}
</style>
