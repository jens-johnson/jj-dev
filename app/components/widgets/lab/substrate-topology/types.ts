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
 * ████████████████████████████████ #components/widgets/lab/substrate-topology/types.ts ████████████████████████████████
 *
 * Type definitions for the substrate topology diagram: the layer enum, its derived union, the props contract, and the
 * drawable edge shape.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { ISubstrateDevice } from '~/types/substrate';

/**
 * An enumeration of the topology bands; the horizontal rows devices are placed into
 * @public
 * @enum
 */
export enum SubstrateLayer {
  /* End-user machines: laptops, phones, workstations */
  client = 'client',

  /* Hypervisors and bare-metal compute */
  compute = 'compute',

  /* The internet-facing edge: WAN handoff and gateway */
  edge = 'edge',

  /* LAN fabric: firewall, switches, access points */
  network = 'network',

  /* Power delivery: UPS and PDU feeds */
  power = 'power',

  /* Hosted services and containers */
  service = 'service',

  /* Disk shelves and NAS appliances */
  storage = 'storage',
}

/**
 * A type representing a topology band; one of {@link SubstrateLayer}
 * @public
 */
export type TSubstrateLayer = `${SubstrateLayer}`;

/**
 * The props accepted by the topology diagram: the device inventory to place and wire
 * @public
 * @interface
 */
export interface ISubstrateTopologyProps {
  /* The device inventory to place and wire; layout derives from each device's layer and order */
  devices: ISubstrateDevice[];
}

/**
 * A drawable wire between two placed nodes, flattened from the device connection lists
 * @public
 * @interface
 */
export interface IEdge {
  /* The source node id */
  from: string;

  /* The target node id */
  to: string;

  /* The connection kind driving the wire's styling */
  kind: string;

  /* An optional short label, e.g. "NFS" */
  label?: string;
}
