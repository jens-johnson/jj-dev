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
 * ████████████████████████████████████████████████ #types/substrate.ts ████████████████████████████████████████████████
 *
 * Shared TypeScript shapes for the Substrate homelab topology. A structural mirror of the `substrate` content
 * collection's frontmatter — narrow enough that queried docs satisfy it, so the topology widget, inspector panel,
 * and page can share one device type without importing generated content types.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • content.config.ts — the authoritative Zod schema these mirror
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/** A drawn edge from one device to another. `kind` styles the wire. */
export interface SubstrateConnection {
  /** `id` of the device this links to. */
  to: string;
  /** Edge styling: one of uplink (toward internet/gateway), network (LAN), data (storage traffic), power (UPS feed). */
  kind?: string;
  /** Optional short label, e.g. "NFS", "WAN". */
  label?: string;
}

/** A single labelled spec row shown in the inspector. */
export interface SubstrateSpec {
  label: string;
  value: string;
}

/** Operational state of a device — drives status dots and badge colour. */
export type SubstrateStatus = 'online' | 'offline' | 'planned' | 'maintenance';

/** One piece of homelab hardware — a node in the topology. */
export interface SubstrateDevice {
  /** Stable node id (named `nodeId` to avoid @nuxt/content's reserved `id`), referenced by `connections[].to`. */
  nodeId: string;
  title: string;
  description?: string;
  /** Device class — drives the icon. */
  kind: string;
  /** Topology band — drives vertical placement. */
  layer: string;
  status: SubstrateStatus | string;
  vendor?: string;
  model?: string;
  /** Typical idle draw in watts. */
  power?: number;
  specs?: SubstrateSpec[];
  connections?: SubstrateConnection[];
  tags?: string[];
  /** Sort weight within a layer — lower sits further left. */
  order?: number;
  /** Content route (e.g. /substrate/pve-01) when sourced from @nuxt/content. */
  path?: string;
}
