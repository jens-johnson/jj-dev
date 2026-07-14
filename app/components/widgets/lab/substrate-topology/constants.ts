/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                 ██        ██                     ▄▄
 *                                 ▀▀        ▀▀                     ██
 *                               ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                 ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                 ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                 ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                 ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                              ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * ██████████████████████████████ #components/widgets/lab/substrate-topology/constants.ts ██████████████████████████████
 *
 * Constants for the substrate topology diagram: band order, the SVG coordinate space, and the wire stroke classes.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { TSubstrateLayer } from './types';

/**
 * The vertical band order, top (faces the internet) to bottom (power)
 * @public
 * @constant
 */
export const LAYER_ORDER: readonly TSubstrateLayer[] = [
  'edge',
  'network',
  'compute',
  'storage',
  'service',
  'client',
  'power',
];

/**
 * The fixed SVG coordinate space; HTML node cards map onto it by percentage so wires and cards stay aligned at any
 * scale
 * @public
 * @constant
 */
export const TOPOLOGY_VIEW_BOX: { w: number; h: number } = { w: 1000, h: 620 };

/**
 * The vertical padding, in viewBox units, above the first band and below the last
 * @public
 * @constant
 */
export const TOPOLOGY_PAD: { top: number; bottom: number } = { top: 64, bottom: 64 };

/**
 * The sort weight assumed for devices that do not declare an order; sorts them after explicitly ordered peers
 * @public
 * @constant
 */
export const FALLBACK_DEVICE_ORDER: number = 100;

/**
 * The Tailwind stroke class for spotlighted and uplink wires (the warm accent)
 * @public
 * @constant
 */
export const STROKE_ACCENT: string = 'stroke-accent';

/**
 * The Tailwind stroke class for resting LAN and power wires (the subtle ink)
 * @public
 * @constant
 */
export const STROKE_MUTED: string = 'stroke-ink-subtle';

/**
 * The Tailwind stroke class for data/storage-traffic wires (the secondary accent)
 * @public
 * @constant
 */
export const STROKE_DATA: string = 'stroke-accent-secondary';

/**
 * The resting stroke color class for each connection kind
 * @public
 * @constant
 */
export const EDGE_STROKE_BY_KIND: Record<string, string> = {
  uplink: STROKE_ACCENT,
  network: STROKE_MUTED,
  data: STROKE_DATA,
  power: STROKE_MUTED,
};
