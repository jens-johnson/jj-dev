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
 * ███████████████████████████████ #components/widgets/lab/substrate-topology/index.vue ████████████████████████████████
 *
 * Interactive network diagram of the homelab. Devices are placed in horizontal bands by `layer`; connections are drawn
 * as curved SVG wires behind HTML node cards, with animated dashes conveying live data flow. Hovering or selecting a
 * node spotlights its wiring and dims everything else.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <WidgetsLabSubstrateTopology :devices="devices" v-model:selected-id="selectedId" />
 *
 * Layout is deterministic (SSR-safe): SVG uses a fixed 1000×620 viewBox and HTML nodes are positioned by the same
 * percentage coordinates, so wires and cards stay aligned at any scale. Honours prefers-reduced-motion.
 *
 * ─── PROPS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • devices
 *     - Description: The device inventory to place and wire; layout derives from each device's layer and order
 *     - Type: ISubstrateDevice[]
 *     - Required: true
 *
 * ─── MODEL ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • selectedId
 *     - Description: Two-way bound selected node id; null when nothing is inspected
 *     - Type: string | null
 *     - Required: false
 *     - Default: null
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type { CSSProperties } from 'vue';

import type { ISubstrateDevice } from '~/types/substrate';

import {
  EDGE_STROKE_BY_KIND,
  FALLBACK_DEVICE_ORDER,
  LAYER_ORDER,
  STROKE_ACCENT,
  STROKE_DATA,
  STROKE_MUTED,
  TOPOLOGY_PAD,
  TOPOLOGY_VIEW_BOX,
} from './constants';
import type { IEdge, ISubstrateTopologyProps, TSubstrateLayer } from './types';

/* ─── PROPS ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Component props; the device inventory to place and wire
 * @internal
 * @constant
 */
const props = defineProps<ISubstrateTopologyProps>();

/**
 * Two-way bound selected node id; null when nothing is inspected
 * @internal
 * @constant
 */
const selectedId = defineModel<string | null>('selectedId', { default: null });

/* ─── Interaction state ───────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The node id currently under the pointer (or holding focus); null when none is
 * @internal
 * @constant
 */
const hoveredId: Ref<string | null> = ref<string | null>(null);

/**
 * The node driving the spotlight. Hover wins over selection, so the diagram feels responsive before you commit a
 * click
 * @internal
 * @constant
 */
const activeId: ComputedRef<string | null> = computed((): string | null => hoveredId.value ?? selectedId.value);

/* ─── Layout ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The bands that actually contain a device; empty bands are not rendered
 * @internal
 * @constant
 */
const activeLayers: ComputedRef<TSubstrateLayer[]> = computed((): TSubstrateLayer[] =>
  LAYER_ORDER.filter((layer: TSubstrateLayer): boolean =>
    props.devices.some((device: ISubstrateDevice): boolean => device.layer === layer),
  ),
);

/**
 * The id → center point map, in viewBox units
 * @internal
 * @constant
 */
const layout: ComputedRef<Map<string, { x: number; y: number }>> = computed(
  (): Map<string, { x: number; y: number }> => {
    // Derive the vertical spacing from the number of populated bands
    const map: Map<string, { x: number; y: number }> = new Map<string, { x: number; y: number }>();
    const rows: TSubstrateLayer[] = activeLayers.value;
    const usableH: number = TOPOLOGY_VIEW_BOX.h - TOPOLOGY_PAD.top - TOPOLOGY_PAD.bottom;
    const rowGap: number = rows.length > 1 ? usableH / (rows.length - 1) : 0;

    rows.forEach((layer, ri) => {
      // Place each band's devices in a stable order, spread evenly across the row width
      const y: number = rows.length > 1 ? TOPOLOGY_PAD.top + ri * rowGap : TOPOLOGY_VIEW_BOX.h / 2;
      const inRow: ISubstrateDevice[] = props.devices
        .filter((d) => d.layer === layer)
        .sort(
          (a, b) =>
            (a.order ?? FALLBACK_DEVICE_ORDER) - (b.order ?? FALLBACK_DEVICE_ORDER) || a.title.localeCompare(b.title),
        );

      inRow.forEach((d, ci) => {
        map.set(d.nodeId, { x: (TOPOLOGY_VIEW_BOX.w * (ci + 1)) / (inRow.length + 1), y });
      });
    });

    return map;
  },
);

/** Flatten every device's connections into drawable edges, dropping any that reference a missing node. */
const edges: ComputedRef<IEdge[]> = computed((): IEdge[] => {
  // Walk every device's connection list, skipping wires whose endpoints were never placed
  const out: IEdge[] = [];
  for (const device of props.devices) {
    for (const connection of device.connections ?? []) {
      if (!layout.value.has(device.nodeId) || !layout.value.has(connection.to)) {
        continue;
      }
      out.push({
        from: device.nodeId,
        to: connection.to,
        kind: connection.kind ?? 'network',
        label: connection.label,
      });
    }
  }
  return out;
});

/** Cubic-bezier wire between two node centers; eases along x when near-horizontal, along y otherwise. */
function edgePath(edge: IEdge): string {
  // Resolve both endpoints; an unplaced endpoint yields no path
  const start: { x: number; y: number } | undefined = layout.value.get(edge.from);
  const end: { x: number; y: number } | undefined = layout.value.get(edge.to);
  if (!start || !end) {
    return '';
  }
  const dx: number = end.x - start.x;
  const dy: number = end.y - start.y;

  // Near-horizontal wires ease along x; everything else eases along y
  if (Math.abs(dy) < 60) {
    return `M ${start.x} ${start.y} C ${start.x + dx * 0.4} ${start.y}, ${end.x - dx * 0.4} ${end.y}, ${end.x} ${end.y}`;
  }
  const curveOffset: number = Math.abs(dy) * 0.5 * (dy > 0 ? 1 : -1);
  return `M ${start.x} ${start.y} C ${start.x} ${start.y + curveOffset}, ${end.x} ${end.y - curveOffset}, ${end.x} ${end.y}`;
}

/** Absolute-position style for a node card, centered on its layout point. */
function nodeStyle(id: string): CSSProperties {
  // Resolve the node's layout point; an unplaced node gets no positioning
  const p: { x: number; y: number } | undefined = layout.value.get(id);
  if (!p) {
    return {};
  }
  // Convert viewBox units to percentages so the HTML card tracks the SVG wires at any scale
  return { left: `${(p.x / TOPOLOGY_VIEW_BOX.w) * 100}%`, top: `${(p.y / TOPOLOGY_VIEW_BOX.h) * 100}%` };
}

/* ─── Spotlight ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Ids directly wired to the active node (either direction). */
const connectedIds: ComputedRef<Set<string>> = computed((): Set<string> => {
  // Nothing is spotlighted when no node is active
  const set: Set<string> = new Set<string>();
  const id: string | null = activeId.value;
  if (!id) {
    return set;
  }
  // Collect the far end of every edge touching the active node
  for (const edge of edges.value) {
    if (edge.from === id) {
      set.add(edge.to);
    }
    if (edge.to === id) {
      set.add(edge.from);
    }
  }
  return set;
});

/**
 * A utility method to determine whether a wire touches the active node and joins the spotlight
 * @internal
 * @function
 * @param edge - The edge being drawn
 * @returns Whether the edge is spotlighted
 */
const edgeActive = (edge: IEdge): boolean =>
  !!activeId.value && (edge.from === activeId.value || edge.to === activeId.value);

/**
 * A utility method to determine whether a wire dims because another node holds the spotlight
 * @internal
 * @function
 * @param edge - The edge being drawn
 * @returns Whether the edge is dimmed
 */
const edgeDimmed = (edge: IEdge): boolean => !!activeId.value && !edgeActive(edge);

/**
 * A utility method to determine whether a node card dims; anything neither active nor wired to the active node
 * @internal
 * @function
 * @param id - The node id being rendered
 * @returns Whether the node card is dimmed
 */
const nodeDimmed = (id: string): boolean => !!activeId.value && id !== activeId.value && !connectedIds.value.has(id);

/* ─── Visual maps ─────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A utility method to pick the base stroke color class for a wire; the accent when spotlighted, otherwise mapped
 * from the connection kind
 * @internal
 * @function
 * @param edge - The edge being drawn
 * @returns The Tailwind stroke class for the static wire
 */
function edgeBaseClass(edge: IEdge): string {
  return edgeActive(edge) ? STROKE_ACCENT : (EDGE_STROKE_BY_KIND[edge.kind] ?? STROKE_MUTED);
}
/**
 * A utility method to pick the opacity class for a wire; full when spotlighted, faint when dimmed, and a subtler
 * resting level for power feeds
 * @internal
 * @function
 * @param edge - The edge being drawn
 * @returns The Tailwind opacity class for the static wire
 */
function edgeBaseOpacity(edge: IEdge): string {
  // Spotlighted and dimmed states win before the resting per-kind level applies
  if (edgeActive(edge)) {
    return 'opacity-100';
  }
  if (edgeDimmed(edge)) {
    return 'opacity-10';
  }
  return edge.kind === 'power' ? 'opacity-25' : 'opacity-60';
}
/**
 * A utility method to pick the stroke color class for the animated data-flow overlay on a wire
 * @internal
 * @function
 * @param edge - The edge being drawn
 * @returns The Tailwind stroke class for the flow dashes
 */
function edgeFlowClass(edge: IEdge): string {
  return edgeActive(edge) ? STROKE_ACCENT : edge.kind === 'data' ? STROKE_DATA : STROKE_ACCENT;
}

// Status colors + kind icons come from the auto-imported #utils/substrate-visuals (statusOf, kindIcon),
// shared with the inspector panel so a node looks identical wherever it appears.

/** Toggle selection; clicking the selected node again clears the inspector. */
function toggle(id: string): void {
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
      <div
        class="substrate-grid pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      <!-- Wires (behind the nodes; clicks pass through) -->
      <svg
        class="pointer-events-none absolute inset-0 h-full w-full"
        :viewBox="`0 0 ${TOPOLOGY_VIEW_BOX.w} ${TOPOLOGY_VIEW_BOX.h}`"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        aria-hidden="true"
      >
        <g
          v-for="(e, i) in edges"
          :key="`${e.from}-${e.to}-${i}`"
        >
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
            <Icon
              :name="kindIcon(d.kind)"
              size="16"
            />
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

            <span
              class="relative inline-flex size-2 rounded-full"
              :class="statusOf(d.status).dot"
            />
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
