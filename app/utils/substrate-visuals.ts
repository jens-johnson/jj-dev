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
 * ███████████████████████████████████████████ #utils/substrate-visuals.ts ██████████████████████████████████████████████
 *
 * Shared visual lookups for the Substrate homelab section — status colours, device-kind icons, and human labels.
 * Auto-imported by Nuxt, so the topology widget and inspector panel render the same node consistently. Tailwind
 * class strings (not raw colours) so all three themes stay in sync via the token layer.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { SubstrateDevice } from '~/types/substrate';

/** Tailwind class bundle for a status — dot fill, text colour, and a faint tinted background. */
export interface StatusVisual {
  label: string;
  dot: string;
  text: string;
  tint: string;
}

const ONLINE: StatusVisual = {
  label: 'Online',
  dot: 'bg-accent-secondary',
  text: 'text-accent-secondary',
  tint: 'bg-accent-secondary/10',
};

const STATUS: Record<string, StatusVisual> = {
  online: ONLINE,
  offline: { label: 'Offline', dot: 'bg-terra-600', text: 'text-terra-600', tint: 'bg-terra-600/10' },
  planned: { label: 'Planned', dot: 'bg-ink-subtle', text: 'text-ink-subtle', tint: 'bg-ink-subtle/10' },
  maintenance: { label: 'Maintenance', dot: 'bg-terra-400', text: 'text-terra-400', tint: 'bg-terra-400/10' },
};

/** Visual treatment for a device status, defaulting to "online". */
export function statusOf(status: string): StatusVisual {
  return STATUS[status] ?? ONLINE;
}

const OTHER_ICON = 'lucide:box';

const KIND_ICON: Record<string, string> = {
  internet: 'lucide:globe',
  gateway: 'lucide:shield',
  firewall: 'lucide:shield-check',
  router: 'lucide:route',
  switch: 'lucide:network',
  ap: 'lucide:wifi',
  server: 'lucide:server',
  hypervisor: 'lucide:layers',
  nas: 'lucide:hard-drive',
  storage: 'lucide:database',
  pi: 'lucide:cpu',
  workstation: 'lucide:monitor',
  ups: 'lucide:battery-charging',
  iot: 'lucide:radio',
  other: OTHER_ICON,
};

/** Lucide icon name for a device kind. */
export function kindIcon(kind: string): string {
  return KIND_ICON[kind] ?? OTHER_ICON;
}

const KIND_LABEL: Record<string, string> = {
  internet: 'Internet',
  gateway: 'Gateway',
  firewall: 'Firewall',
  router: 'Router',
  switch: 'Switch',
  ap: 'Access Point',
  server: 'Server',
  hypervisor: 'Hypervisor',
  nas: 'NAS',
  storage: 'Storage',
  pi: 'Single-board',
  workstation: 'Workstation',
  ups: 'UPS',
  iot: 'IoT',
  other: 'Device',
};

/** Human-readable label for a device kind. */
export function kindLabel(kind: string): string {
  return KIND_LABEL[kind] ?? kind;
}

/**
 * Loose shape of a substrate doc straight from `queryCollection` — every field optional, mirroring how
 * @nuxt/content widens schema columns to `T | undefined`. Normalised into a concrete device below.
 */
export interface RawSubstrateDoc {
  nodeId?: string;
  title?: string;
  description?: string;
  kind?: string;
  layer?: string;
  status?: string;
  vendor?: string;
  model?: string;
  power?: number;
  specs?: Array<{ label?: string; value?: string }>;
  connections?: Array<{ to?: string; kind?: string; label?: string }>;
  tags?: string[];
  order?: number;
  path?: string;
}

/** Coerce a queried doc into a fully-populated device, applying schema defaults so consumers never see undefined. */
export function normalizeDevice(d: RawSubstrateDoc): SubstrateDevice {
  return {
    nodeId: d.nodeId ?? d.path ?? '',
    title: d.title ?? 'Untitled',
    description: d.description ?? '',
    kind: d.kind ?? 'other',
    layer: d.layer ?? 'compute',
    status: d.status ?? 'online',
    vendor: d.vendor,
    model: d.model,
    power: d.power,
    specs: (d.specs ?? []).map((s) => ({ label: s.label ?? '', value: s.value ?? '' })),
    connections: (d.connections ?? [])
      .map((c) => ({ to: c.to ?? '', kind: c.kind, label: c.label }))
      .filter((c) => c.to),
    tags: d.tags ?? [],
    order: d.order ?? 100,
    path: d.path,
  };
}

/** Normalise a list of queried docs. */
export function normalizeDevices(docs: RawSubstrateDoc[]): SubstrateDevice[] {
  return docs.map(normalizeDevice);
}
