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
 * █████████████████████████████████ #components/widgets/lab/substrate-detail/types.ts █████████████████████████████████
 *
 * Type definitions for the substrate inspector panel: the props contract.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { ISubstrateDevice } from '~/types/substrate';

/**
 * The props accepted by the inspector panel: the device under inspection, the inventory used to resolve connection
 * targets, and the notes-slot flag
 * @public
 * @interface
 */
export interface ISubstrateDetailProps {
  /* The device being inspected; null renders the select-a-node hint state */
  device: ISubstrateDevice | null;

  /* The full device inventory, used to resolve connection targets to their titles */
  devices: ISubstrateDevice[];

  /* Whether the page is providing rendered markdown for the #notes slot */
  hasNotes?: boolean;
}
