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
 * █████████████████████████████████████████████ #utils/service-visuals.ts █████████████████████████████████████████████
 *
 * Shared visual lookups for the Substrate "Services" layer — status colours, service-kind icons, and human labels,
 * plus a normaliser that coerces a queried doc into a fully-populated service. Auto-imported by Nuxt; exports are
 * prefixed `service*` so they sit alongside the hardware-side `substrate-visuals` helpers without colliding.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • #utils/substrate-visuals.ts — the sibling lookups for hardware nodes
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { HomelabService } from '~/types/services';

/** Tailwind class bundle for a status — dot fill, text colour, and a faint tinted background. */
export interface ServiceStatusVisual {
  label: string;
  dot: string;
  text: string;
  tint: string;
}

const SERVICE_ONLINE: ServiceStatusVisual = {
  label: 'Online',
  dot: 'bg-accent-secondary',
  text: 'text-accent-secondary',
  tint: 'bg-accent-secondary/10',
};

const SERVICE_STATUS: Record<string, ServiceStatusVisual> = {
  online: SERVICE_ONLINE,
  offline: { label: 'Offline', dot: 'bg-terra-600', text: 'text-terra-600', tint: 'bg-terra-600/10' },
  planned: { label: 'Planned', dot: 'bg-ink-subtle', text: 'text-ink-subtle', tint: 'bg-ink-subtle/10' },
  maintenance: { label: 'Maintenance', dot: 'bg-terra-400', text: 'text-terra-400', tint: 'bg-terra-400/10' },
  degraded: { label: 'Degraded', dot: 'bg-terra-400', text: 'text-terra-400', tint: 'bg-terra-400/10' },
};

/** Visual treatment for a service status, defaulting to "planned" (the common case before a service is stood up). */
export function serviceStatusOf(status: string): ServiceStatusVisual {
  return SERVICE_STATUS[status] ?? SERVICE_STATUS.planned!;
}

const SERVICE_OTHER_ICON = 'lucide:box';

const SERVICE_KIND_ICON: Record<string, string> = {
  'game-server': 'lucide:gamepad-2',
  media: 'lucide:clapperboard',
  monitoring: 'lucide:activity',
  network: 'lucide:network',
  automation: 'lucide:workflow',
  storage: 'lucide:database',
  web: 'lucide:globe',
  other: SERVICE_OTHER_ICON,
};

/** Lucide icon name for a service kind. */
export function serviceKindIcon(kind: string): string {
  return SERVICE_KIND_ICON[kind] ?? SERVICE_OTHER_ICON;
}

const SERVICE_KIND_LABEL: Record<string, string> = {
  'game-server': 'Game Server',
  media: 'Media',
  monitoring: 'Monitoring',
  network: 'Network',
  automation: 'Automation',
  storage: 'Storage',
  web: 'Web',
  other: 'Service',
};

/** Human-readable label for a service kind. */
export function serviceKindLabel(kind: string): string {
  return SERVICE_KIND_LABEL[kind] ?? kind;
}

/**
 * Loose shape of a services doc straight from `queryCollection` — every field optional, mirroring how
 * @nuxt/content widens schema columns to `T | undefined`. Normalised into a concrete service below.
 */
export interface RawServiceDoc {
  serviceId?: string;
  title?: string;
  description?: string;
  kind?: string;
  status?: string;
  icon?: string;
  summary?: string;
  host?: string;
  address?: string;
  stack?: string[];
  links?: { live?: string; map?: string; github?: string; docs?: string };
  plugins?: Array<{ name?: string; side?: string; category?: string; purpose?: string; url?: string }>;
  metrics?: Array<{ key?: string; label?: string; icon?: string; unit?: string; hint?: string }>;
  tags?: string[];
  order?: number;
  path?: string;
}

/** Coerce a queried doc into a fully-populated service, applying schema defaults so consumers never see undefined. */
export function normalizeService(d: RawServiceDoc): HomelabService {
  return {
    serviceId: d.serviceId ?? d.path?.split('/').pop() ?? '',
    title: d.title ?? 'Untitled',
    description: d.description ?? '',
    kind: d.kind ?? 'other',
    status: d.status ?? 'planned',
    icon: d.icon,
    summary: d.summary,
    host: d.host,
    address: d.address,
    stack: d.stack ?? [],
    links: d.links,
    plugins: (d.plugins ?? [])
      .map((p) => ({
        name: p.name ?? '',
        side: (p.side === 'client' ? 'client' : 'server') as 'server' | 'client',
        category: p.category ?? 'other',
        purpose: p.purpose ?? '',
        url: p.url,
      }))
      .filter((p) => p.name),
    metrics: (d.metrics ?? [])
      .map((m) => ({ key: m.key ?? '', label: m.label ?? '', icon: m.icon, unit: m.unit, hint: m.hint }))
      .filter((m) => m.key),
    tags: d.tags ?? [],
    order: d.order ?? 100,
    path: d.path,
  };
}

/** Normalise a list of queried docs, sorted by ascending `order`. */
export function normalizeServices(docs: RawServiceDoc[]): HomelabService[] {
  return docs.map(normalizeService).sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}
