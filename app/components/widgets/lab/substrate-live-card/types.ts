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
 * ███████████████████████████████ #components/widgets/lab/substrate-live-card/types.ts ████████████████████████████████
 *
 * Type definitions for the substrate live node-health card: the headline metric tile shape.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * A headline metric tile on the live node-health card
 * @public
 * @interface
 */
export interface ITile {
  /* The tile label, e.g. "CPU" */
  label: string;

  /* The formatted headline value */
  value: string;

  /* The secondary line under the value; empty renders nothing */
  sub: string;

  /* An optional recent-history series rendered as a sparkline */
  series?: number[];
}
