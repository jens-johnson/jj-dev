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
 * ████████████████████████████████████████████████ #types/services.ts █████████████████████████████████████████████████
 *
 * Shared TypeScript shapes for the Substrate "Services" layer — what *runs* on the homelab hardware. A structural
 * mirror of the `services` content collection's frontmatter, narrow enough that queried docs satisfy it, so the
 * services grid, detail page, and metrics dashboard can share one type without importing generated content types.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • content.config.ts — the authoritative Zod schema these mirror
 * • #types/substrate.ts — the sibling shape for hardware nodes
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/** A plugin / add-on installed on a service. `side` marks server-side vs. a client-side recommendation. */
export interface ServicePlugin {
  name: string;
  /** Where it lives: `server` (installed on the box) or `client` (recommended for players to install). */
  side: 'server' | 'client';
  /** Grouping bucket used to section the plugin list in the UI. */
  category: string;
  /** One-line "what it does / why it's here". */
  purpose: string;
  url?: string;
}

/** A declared dashboard tile — the live feed fills `value`; until then the UI shows "awaiting feed". */
export interface ServiceMetricTile {
  /** Stable key matching the published metrics payload field. */
  key: string;
  label: string;
  /** Optional Lucide icon name for the tile. */
  icon?: string;
  /** Unit suffix, e.g. `ms`, `%`, `TPS`. */
  unit?: string;
  /** Short explanation of what the tile will show once live. */
  hint?: string;
}

/** Outbound links surfaced on the detail page. `map` is the public web map (BlueMap etc.). */
export interface ServiceLinks {
  live?: string;
  map?: string;
  github?: string;
  docs?: string;
}

/** Operational state of a service — drives status dots and badge colour. */
export type ServiceStatus = 'online' | 'offline' | 'planned' | 'maintenance' | 'degraded';

/** One deployed (or planned) homelab service — a card in the Services layer. */
export interface HomelabService {
  /** Stable service id (named `serviceId` to avoid @nuxt/content's reserved `id`); used in routes + metrics key. */
  serviceId: string;
  title: string;
  description?: string;
  /** Service class — drives the icon. */
  kind: string;
  status: ServiceStatus | string;
  /** Optional explicit Lucide icon name, overriding the per-kind default. */
  icon?: string;
  /** Short tagline for the card (falls back to `description`). */
  summary?: string;
  /** `nodeId` of the substrate device this runs on, e.g. `srv-01`. */
  host?: string;
  /** Player/visitor-facing connect address, e.g. `jenscraft.world`. */
  address?: string;
  stack?: string[];
  links?: ServiceLinks;
  plugins?: ServicePlugin[];
  metrics?: ServiceMetricTile[];
  tags?: string[];
  /** Sort weight on the grid — lower sits first. */
  order?: number;
  /** Content route (e.g. /lab/substrate/services/jenscraft) when sourced from @nuxt/content. */
  path?: string;
}
