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
 * █████████████████████████████████ #components/widgets/lab/substrate-fleet/types.ts ██████████████████████████████████
 *
 * Type definitions for the substrate fleet card: the props contract, summary counters, and gauge tone classes.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { ISubstrateDevice } from '~/types/substrate';

/**
 * The props accepted by the fleet card: the static device inventory whose rows populate the telemetry table
 * @public
 * @interface
 */
export interface ISubstrateFleetProps {
  /* The static device inventory from content; rows are sorted by topology order */
  devices: ISubstrateDevice[];
}

/**
 * A single counter on the collapsed summary surface
 * @public
 * @interface
 */
export interface IFleetSummaryStat {
  /* The counter label, e.g. "Nodes" */
  label: string;

  /* The counted value */
  value: number;
}

/**
 * The Tailwind classes tinting a gauge bar and its sparkline for a given utilization level
 * @public
 * @interface
 */
export interface IFleetTone {
  /* The background class for the gauge bar */
  bar: string;

  /* The text class for the sparkline */
  text: string;
}
