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
 * █████████████████████████████████████████████ #types/substrate/types.ts █████████████████████████████████████████████
 *
 * Shared TypeScript shapes for the Substrate homelab topology. A structural mirror of the `substrate` content
 * collection frontmatter, narrow enough that queried docs satisfy it, so the topology widget, inspector panel, and page
 * share one device type without importing generated content types.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • content.config.ts; the authoritative Zod schema these mirror
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An interface representing a drawn edge from one device to another; "kind" styles the wire
 * @interface
 */
export interface ISubstrateConnection {
  /* The "id" of the device this links to */
  to: string;

  /* The edge styling: uplink (toward internet/gateway), network (LAN), data (storage traffic), or power (UPS feed) */
  kind?: string;

  /* An optional short label, e.g. "NFS", "WAN" */
  label?: string;
}

/**
 * An interface representing a single labelled spec row shown in the inspector
 * @interface
 */
export interface ISubstrateSpec {
  /* The spec label, e.g. "CPU" */
  label: string;

  /* The spec value, e.g. "i5-1235U" */
  value: string;
}

/**
 * A type representing the operational state of a device; drives status dots and badge colour
 * @typedef
 */
export type TSubstrateStatus = 'online' | 'offline' | 'planned' | 'maintenance';

/**
 * An interface representing one piece of homelab hardware; a node in the topology
 * @interface
 */
export interface ISubstrateDevice {
  /* The stable node id (named "nodeId" to avoid @nuxt/content reserved "id"), referenced by "connections[].to" */
  nodeId: string;

  /* The device title */
  title: string;

  /* An optional longer description of the device */
  description?: string;

  /* The device class; drives the icon */
  kind: string;

  /* The topology band; drives vertical placement */
  layer: string;

  /* The operational status (a known status or a free-form string from content) */
  status: TSubstrateStatus | string;

  /* The hardware vendor */
  vendor?: string;

  /* The specific model */
  model?: string;

  /* The typical idle draw in watts */
  power?: number;

  /* The labelled spec rows shown in the inspector */
  specs?: ISubstrateSpec[];

  /* The drawn edges to other devices */
  connections?: ISubstrateConnection[];

  /* The free-form tags */
  tags?: string[];

  /* The sort weight within a layer; lower sits further left */
  order?: number;

  /* The content route (e.g. /substrate/pve-01) when sourced from @nuxt/content */
  path?: string;
}
