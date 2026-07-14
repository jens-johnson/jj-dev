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
 * Shared visual lookups for the Substrate "Services" layer: status colors, service-kind icons, and human labels, plus
 * a normalizer that coerces a queried doc into a fully-populated service. Auto-imported by Nuxt; exports are prefixed
 * `service*` so they sit alongside the hardware-side substrate-visuals helpers without colliding.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • #utils/substrate/substrate-visuals; the sibling lookups for hardware nodes
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { defineSymbol } from '#shared/utils/symbol';
import type { IHomelabService } from '~/types/services';

import {
  DEVICE_ID_REGEX,
  SERVICE_KIND_ICON,
  SERVICE_KIND_LABEL,
  SERVICE_OTHER_ICON,
  SERVICE_STATUS,
} from './constants';
import type { IRawServiceDoc, IServiceStatusVisual, ITextSegment } from './types';

/**
 * Resolves the visual treatment for a service status, defaulting to "planned" (the common case before a service is
 * stood up)
 * @public
 * @function
 * @param status - The service status key
 * @returns The matching visual treatment, or the "planned" treatment when unknown
 */
export function serviceStatusOf(status: string): IServiceStatusVisual {
  return SERVICE_STATUS[status] ?? SERVICE_STATUS.planned!;
}

/**
 * Resolves the Lucide icon name for a service kind
 * @public
 * @function
 * @param kind - The service kind key
 * @returns The matching Lucide icon name, or the fallback icon when unknown
 */
export function serviceKindIcon(kind: string): string {
  return SERVICE_KIND_ICON[kind] ?? SERVICE_OTHER_ICON;
}

/**
 * Resolves the human-readable label for a service kind
 * @public
 * @function
 * @param kind - The service kind key
 * @returns The matching label, or the kind itself when unknown
 */
export function serviceKindLabel(kind: string): string {
  return SERVICE_KIND_LABEL[kind] ?? kind;
}

/**
 * Coerces a queried Nuxt content doc into a fully-populated service, applying schema defaults so consumers never see
 * `undefined`
 * @public
 * @function
 * @param doc - The loosely-typed service doc from `queryCollection`
 * @returns The fully-populated service
 */
export function normalizeService(doc: IRawServiceDoc): IHomelabService {
  return {
    serviceId: doc.serviceId ?? doc.path?.split('/').pop() ?? '',
    title: doc.title ?? 'Untitled',
    description: doc.description ?? '',
    kind: doc.kind ?? 'other',
    status: doc.status ?? 'planned',
    icon: doc.icon,
    summary: doc.summary,
    host: doc.host,
    address: doc.address,
    stack: doc.stack ?? [],
    links: doc.links,
    plugins: (doc.plugins ?? [])
      .map((plugin) => ({
        name: plugin.name ?? '',
        side: (plugin.side === 'client' ? 'client' : 'server') as 'server' | 'client',
        category: plugin.category ?? 'other',
        purpose: plugin.purpose ?? '',
        url: plugin.url,
      }))
      .filter((plugin) => plugin.name),
    metrics: (doc.metrics ?? [])
      .map((metric) => ({
        key: metric.key ?? '',
        label: metric.label ?? '',
        icon: metric.icon,
        unit: metric.unit,
        hint: metric.hint,
      }))
      .filter((metric) => metric.key),
    tags: doc.tags ?? [],
    order: doc.order ?? 100,
    path: doc.path,
  };
}

/**
 * Normalizes a list of queried docs, sorted by ascending `order`
 * @public
 * @function
 * @param docs - The loosely-typed service docs from queryCollection
 * @returns The normalized services, sorted by ascending order
 */
export function normalizeServices(docs: IRawServiceDoc[]): IHomelabService[] {
  return docs
    .map(normalizeService)
    .sort((first: IHomelabService, second: IHomelabService): number => (first.order ?? 100) - (second.order ?? 100));
}

/**
 * Splits a plain string into plain + linked segments, turning any Substrate device id (i.e. `srv-01`) into a link to
 * that device page. Lets a frontmatter string (no markdown) still render wiki-style device links plus monospace
 * @public
 * @function
 * @param text - The raw body text
 * @returns The ordered text segments, with device mentions carrying an href
 */
export function splitDeviceMentions(text: string): ITextSegment[] {
  const segments: ITextSegment[] = [];
  let last: number = 0;
  for (const match of text.matchAll(DEVICE_ID_REGEX)) {
    const start: number = match.index ?? 0;
    if (start > last) {
      segments.push({ text: text.slice(last, start) });
    }
    segments.push({ text: match[0], href: `/lab/substrate/${match[0].toLowerCase()}` });
    last = start + match[0].length;
  }
  if (last < text.length) {
    segments.push({ text: text.slice(last) });
  }
  return segments;
}

/* ─── Metadata ───────────────────────────────────────────────────────────────────────────────────────────────────── */

// Register readable names/descriptions so the unit suites can title their describe blocks from the source symbols
defineSymbol(serviceStatusOf, {
  name: 'Resolve Service Status',
  description: 'Resolves the visual treatment for a service status, defaulting to planned.',
});

defineSymbol(serviceKindIcon, {
  name: 'Resolve Service Kind Icon',
  description: 'Resolves the Lucide icon name for a service kind, falling back when unknown.',
});

defineSymbol(serviceKindLabel, {
  name: 'Resolve Service Kind Label',
  description: 'Resolves the human-readable label for a service kind, echoing the kind when unknown.',
});

defineSymbol(normalizeService, {
  name: 'Normalize Service',
  description: 'Coerces a queried content doc into a fully-populated service with schema defaults.',
});

defineSymbol(normalizeServices, {
  name: 'Normalize Services',
  description: 'Normalizes a list of queried docs, sorted by ascending order.',
});
