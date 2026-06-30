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

/**
 * An interface representing the configurable options for the card-tilt composable
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
