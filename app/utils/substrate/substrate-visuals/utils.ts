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
 * ████████████████████████████████████ #utils/substrate/substrate-visuals/utils.ts ████████████████████████████████████
 *
 * Shared visual lookups for the Substrate homelab section: status colours, device-kind icons, and human labels.
 * Auto-imported by Nuxt, so the topology widget and inspector panel render the same node consistently. Tailwind class
 * strings (not raw colours) so all three themes stay in sync via the token layer.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { ISubstrateDevice } from '~/types/substrate';

import type { IRawSubstrateDoc, IStatusVisual } from './types';

// The visual treatment for an online device, reused as the default-online lookup.
const ONLINE: IStatusVisual = {
  label: 'Online',
  dot: 'bg-accent-secondary',
  text: 'text-accent-secondary',
  tint: 'bg-accent-secondary/10',
};

// The per-status visual treatments for substrate hardware.
const STATUS: Record<string, IStatusVisual> = {
  online: ONLINE,
  offline: { label: 'Offline', dot: 'bg-terra-600', text: 'text-terra-600', tint: 'bg-terra-600/10' },
  planned: { label: 'Planned', dot: 'bg-ink-subtle', text: 'text-ink-subtle', tint: 'bg-ink-subtle/10' },
  maintenance: { label: 'Maintenance', dot: 'bg-terra-400', text: 'text-terra-400', tint: 'bg-terra-400/10' },
};

/**
 * Resolves the visual treatment for a device status, defaulting to "online"
 * @param status - The device status key
 * @returns The matching visual treatment, or the "online" treatment when unknown
 */
export function statusOf(status: string): IStatusVisual {
  return STATUS[status] ?? ONLINE;
}

// The fallback icon for an unknown device kind.
const OTHER_ICON = 'lucide:box';

// The per-kind Lucide icon lookup for substrate hardware.
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

/**
 * Resolves the Lucide icon name for a device kind
 * @param kind - The device kind key
 * @returns The matching Lucide icon name, or the fallback icon when unknown
 */
export function kindIcon(kind: string): string {
  return KIND_ICON[kind] ?? OTHER_ICON;
}

// The per-kind human-readable label lookup for substrate hardware.
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

/**
 * Resolves the human-readable label for a device kind
 * @param kind - The device kind key
 * @returns The matching label, or the kind itself when unknown
 */
export function kindLabel(kind: string): string {
  return KIND_LABEL[kind] ?? kind;
}

/**
 * Coerces a queried doc into a fully-populated device, applying schema defaults so consumers never see undefined
 * @param d - The loosely-typed substrate doc from queryCollection
 * @returns The fully-populated device
 */
export function normalizeDevice(d: IRawSubstrateDoc): ISubstrateDevice {
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

/**
 * Normalises a list of queried docs
 * @param docs - The loosely-typed substrate docs from queryCollection
 * @returns The normalised devices
 */
export function normalizeDevices(docs: IRawSubstrateDoc[]): ISubstrateDevice[] {
  return docs.map(normalizeDevice);
}
