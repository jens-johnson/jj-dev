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
 * ████████████████████████████████████ #composables/use-substrate-metrics/types.ts ████████████████████████████████████
 *
 * Type definitions for the substrate live-metrics composable.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An interface representing a per-state visual treatment (Tailwind class bundle) for the metrics UI
 * @interface
 */
export interface IStateVisual {
  /* The human-readable state label */
  label: string;

  /* The Tailwind background class for the status dot */
  dot: string;

  /* The Tailwind text-colour class */
  text: string;

  /* Whether the dot should pulse */
  pulse: boolean;
}
