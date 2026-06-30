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
 * █████████████████████████████████████████████ #types/services/types.ts ██████████████████████████████████████████████
 *
 * Shared TypeScript shapes for the Substrate "Services" layer; what runs on the homelab hardware. A structural mirror
 * of the `services` content collection frontmatter, narrow enough that queried docs satisfy it, so the services grid,
 * detail page, and metrics dashboard share one type without importing generated content types.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • content.config.ts; the authoritative Zod schema these mirror
 * • #types/substrate; the sibling shape for hardware nodes
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An interface representing a plugin / add-on installed on a service
 * @interface
 */
export interface IServicePlugin {
  /* The plugin name */
  name: string;

  /* Where the plugin lives: "server" (installed on the box) or "client" (recommended for players to install) */
  side: 'server' | 'client';

  /* The grouping bucket used to section the plugin list in the UI */
  category: string;

  /* A one-line summary of what the plugin does and why it is here */
  purpose: string;

  /* An optional outbound link to the plugin homepage or docs */
  url?: string;
}

/**
 * An interface representing a declared dashboard tile; the live feed fills the value, until then the UI shows
 * "awaiting feed"
 * @interface
 */
export interface IServiceMetricTile {
  /* The stable key matching the published metrics payload field */
  key: string;

  /* The human-readable tile label */
  label: string;

  /* An optional Lucide icon name for the tile */
  icon?: string;

  /* An optional unit suffix, e.g. "ms", "%", "TPS" */
  unit?: string;

  /* A short explanation of what the tile will show once live */
  hint?: string;
}

/**
 * An interface representing the outbound links surfaced on the detail page; "map" is the public web map (BlueMap etc.)
 * @interface
 */
export interface IServiceLinks {
  /* The live service URL */
  live?: string;

  /* The public web map URL (e.g. BlueMap) */
  map?: string;

  /* The source repository URL */
  github?: string;

  /* The documentation URL */
  docs?: string;
}

/**
 * A type representing the operational state of a service; drives status dots and badge colour
 * @typedef
 */
export type TServiceStatus = 'online' | 'offline' | 'planned' | 'maintenance' | 'degraded';

/**
 * An interface representing one deployed (or planned) homelab service; a card in the Services layer
 * @interface
 */
export interface IHomelabService {
  /* The stable service id (named "serviceId" to avoid @nuxt/content reserved "id"); used in routes + metrics key */
  serviceId: string;

  /* The service title */
  title: string;

  /* An optional longer description of the service */
  description?: string;

  /* The service class; drives the icon */
  kind: string;

  /* The operational status (a known status or a free-form string from content) */
  status: TServiceStatus | string;

  /* An optional explicit Lucide icon name, overriding the per-kind default */
  icon?: string;

  /* A short tagline for the card (falls back to the description) */
  summary?: string;

  /* The "nodeId" of the substrate device this runs on, e.g. "srv-01" */
  host?: string;

  /* The player/visitor-facing connect address, e.g. "jenscraft.world" */
  address?: string;

  /* The primary technologies / stack powering the service */
  stack?: string[];

  /* The outbound links surfaced on the detail page */
  links?: IServiceLinks;

  /* The installed plugins / add-ons */
  plugins?: IServicePlugin[];

  /* The declared dashboard metric tiles */
  metrics?: IServiceMetricTile[];

  /* The free-form tags */
  tags?: string[];

  /* The sort weight on the grid; lower sits first */
  order?: number;

  /* The content route (e.g. /lab/substrate/services/jenscraft) when sourced from @nuxt/content */
  path?: string;
}
