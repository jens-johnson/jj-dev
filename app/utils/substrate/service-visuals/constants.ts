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
 * ███████████████████████████████████ #utils/substrate/service-visuals/constants.ts ███████████████████████████████████
 *
 * Constant definitions for the substrate service visuals.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { IServiceStatusVisual } from './types';

/**
 * The per-status visual treatments for the Services layer.
 * @internal
 * @constant
 */
export const SERVICE_STATUS: Record<string, IServiceStatusVisual> = {
  online: {
    label: 'Online',
    dot: 'bg-accent-secondary',
    text: 'text-accent-secondary',
    tint: 'bg-accent-secondary/10',
  },
  offline: { label: 'Offline', dot: 'bg-terra-600', text: 'text-terra-600', tint: 'bg-terra-600/10' },
  planned: { label: 'Planned', dot: 'bg-ink-subtle', text: 'text-ink-subtle', tint: 'bg-ink-subtle/10' },
  maintenance: { label: 'Maintenance', dot: 'bg-terra-400', text: 'text-terra-400', tint: 'bg-terra-400/10' },
  degraded: { label: 'Degraded', dot: 'bg-terra-400', text: 'text-terra-400', tint: 'bg-terra-400/10' },
};

/**
 * The icon value to use for "other" type services
 * @internal
 * @constant
 */
export const SERVICE_OTHER_ICON = 'lucide:box';

/**
 * The icon values to use for different service types
 * @internal
 * @constant
 */
export const SERVICE_KIND_ICON: Record<string, string> = {
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
 * The label values to use for different service types
 * @internal
 * @constant
 */
export const SERVICE_KIND_LABEL: Record<string, string> = {
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
 * A regex that matches Substrate device ids like `srv-01`, `fw-01`, `gw-01` (case-insensitive) so prose can link them
 * to their page
 * @internal
 * @constant
 */
export const DEVICE_ID_REGEX = /\b((?:srv|fw|gw|sw|ap|ups|nas|pi)-\d+)\b/gi;
