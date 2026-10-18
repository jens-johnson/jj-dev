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
 * █████████████████████ #components/widgets/projects/neighborhood-explorer/lens-controls/types.ts █████████████████████
 *
 * Prop and emit types for the neighborhood explorer lens controls.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { TNeighborhoodMatchScope, TNeighborhoodWeights } from '#shared/neighborhood-explorer';

/**
 * An interface representing the lens controls' props
 * @public
 * @interface
 */
export interface INeighborhoodLensControlsProps {
  /* The lens weights on 0–100 */
  weights: TNeighborhoodWeights;

  /* Which metros the ranking covers */
  scope: TNeighborhoodMatchScope;
}

/**
 * An interface representing the lens controls' emits
 * @public
 * @interface
 */
export interface INeighborhoodLensControlsEmits {
  /* Fired with the full weights whenever one slider moves */
  'update:weights': [weights: TNeighborhoodWeights];

  /* Fired when the scope toggle flips */
  'update:scope': [scope: TNeighborhoodMatchScope];

  /* Fired when the user resets every slider */
  reset: [];
}
