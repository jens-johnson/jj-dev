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
 * █████████████████████████████████████ #utils/substrate/service-visuals/utils.ts █████████████████████████████████████
 *
 * Shared visual lookups for the Substrate "Services" layer: status colours, service-kind icons, and human labels, plus
 * a normaliser that coerces a queried doc into a fully-populated service. Auto-imported by Nuxt; exports are prefixed
 * `service*` so they sit alongside the hardware-side substrate-visuals helpers without colliding.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • #utils/substrate/substrate-visuals; the sibling lookups for hardware nodes
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { IHomelabService } from '~/types/services';

import type { IRawServiceDoc, IServiceStatusVisual, ITextSegment } from './types';

// The visual treatment for an online service, reused as the default-online lookup.
const SERVICE_ONLINE: IServiceStatusVisual = {
  label: 'Online',
  dot: 'bg-accent-secondary',
  text: 'text-accent-secondary',
  tint: 'bg-accent-secondary/10',
};

// The per-status visual treatments for the Services layer.
const SERVICE_STATUS: Record<string, IServiceStatusVisual> = {
  online: SERVICE_ONLINE,
  offline: { label: 'Offline', dot: 'bg-terra-600', text: 'text-terra-600', tint: 'bg-terra-600/10' },
  planned: { label: 'Planned', dot: 'bg-ink-subtle', text: 'text-ink-subtle', tint: 'bg-ink-subtle/10' },
  maintenance: { label: 'Maintenance', dot: 'bg-terra-400', text: 'text-terra-400', tint: 'bg-terra-400/10' },
  degraded: { label: 'Degraded', dot: 'bg-terra-400', text: 'text-terra-400', tint: 'bg-terra-400/10' },
};

/**
 * Resolves the visual treatment for a service status, defaulting to "planned" (the common case before a service is
 * stood up)
 * @param status - The service status key
 * @returns The matching visual treatment, or the "planned" treatment when unknown
 */
export function serviceStatusOf(status: string): IServiceStatusVisual {
  return SERVICE_STATUS[status] ?? SERVICE_STATUS.planned!;
}

// The fallback icon for an unknown service kind.
const SERVICE_OTHER_ICON = 'lucide:box';

// The per-kind Lucide icon lookup for the Services layer.
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

/**
 * Resolves the Lucide icon name for a service kind
 * @param kind - The service kind key
 * @returns The matching Lucide icon name, or the fallback icon when unknown
 */
export function serviceKindIcon(kind: string): string {
  return SERVICE_KIND_ICON[kind] ?? SERVICE_OTHER_ICON;
}

// The per-kind human-readable label lookup for the Services layer.
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

/**
 * Resolves the human-readable label for a service kind
 * @param kind - The service kind key
 * @returns The matching label, or the kind itself when unknown
 */
export function serviceKindLabel(kind: string): string {
  return SERVICE_KIND_LABEL[kind] ?? kind;
}

/**
 * Coerces a queried doc into a fully-populated service, applying schema defaults so consumers never see undefined
 * @param d - The loosely-typed service doc from queryCollection
 * @returns The fully-populated service
 */
export function normalizeService(d: IRawServiceDoc): IHomelabService {
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

/**
 * Normalises a list of queried docs, sorted by ascending `order`
 * @param docs - The loosely-typed service docs from queryCollection
 * @returns The normalised services, sorted by ascending order
 */
export function normalizeServices(docs: IRawServiceDoc[]): IHomelabService[] {
  return docs.map(normalizeService).sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}

// Matches Substrate device ids like `srv-01`, `fw-01`, `gw-01` (case-insensitive) so prose can link them to their page.
const DEVICE_ID_RE = /\b((?:srv|fw|gw|sw|ap|ups|nas|pi)-\d+)\b/gi;

/**
 * Splits a plain string into plain + linked segments, turning any Substrate device id (e.g. `srv-01`) into a link to
 * that device page. Lets a frontmatter string (no markdown) still render wiki-style device links plus monospace
 * @param text - The raw body text
 * @returns The ordered text segments, with device mentions carrying an href
 */
export function splitDeviceMentions(text: string): ITextSegment[] {
  const segments: ITextSegment[] = [];
  let last = 0;
  for (const m of text.matchAll(DEVICE_ID_RE)) {
    const start = m.index ?? 0;
    if (start > last) segments.push({ text: text.slice(last, start) });
    segments.push({ text: m[0], href: `/lab/substrate/${m[0].toLowerCase()}` });
    last = start + m[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments;
}
