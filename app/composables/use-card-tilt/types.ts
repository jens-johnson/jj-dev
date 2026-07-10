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
 * ████████████████████████████████████████ #composables/use-card-tilt/types.ts ████████████████████████████████████████
 *
 * Type definitions for the card-tilt composable.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { CSSProperties } from 'vue';

/**
 * An interface representing the configurable options for the `useCardTilt` composable
 * @public
 * @interface
 */
export interface ICardTiltOptions {
  /* The maximum rotation in degrees applied symmetrically to the X and Y axes; defaults to 10 */
  intensity?: number;

  /* The uniform scale factor applied on hover; defaults to 1.025 */
  scale?: number;

  /* The peak opacity of the radial shine overlay; defaults to 0.12 */
  shineOpacity?: number;
}

/**
 * An interface representing the return value from the `useCardTilt` composable
 * @public
 * @interface
 */
export interface IUseCardTiltReturn {
  /* A callback handler for an event where the mouse is entering the card */
  readonly onMouseEnter: () => void;

  /* A callback handler for an event where the mouse is leaving the card */
  readonly onMouseLeave: () => void;

  /* A callback handler for an event where the mouse is moving over the card */
  readonly onMouseMove: (e: MouseEvent) => void;

  /* The shine style settings to apply to the card based off the composable's internal state */
  readonly shineStyle: ComputedRef<CSSProperties>;

  /* The tilt style settings to apply to the card based off the composable's internal state */
  readonly tiltStyle: ComputedRef<CSSProperties>;
}
