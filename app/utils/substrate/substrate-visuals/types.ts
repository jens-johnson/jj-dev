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
 * ████████████████████████████████████ #utils/substrate/substrate-visuals/types.ts ████████████████████████████████████
 *
 * Type definitions for the Substrate hardware visual lookups.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An interface representing the Tailwind class bundle for a status: dot fill, text colour, and a faint tinted background
 * @interface
 */
export interface IStatusVisual {
  /* The human-readable status label */
  label: string;

  /* The Tailwind background class for the status dot */
  dot: string;

  /* The Tailwind text-colour class */
  text: string;

  /* The Tailwind tinted-background class */
  tint: string;
}

/**
 * An interface representing the loose shape of a substrate doc straight from `queryCollection`; every field optional,
 * mirroring how @nuxt/content widens schema columns to `T | undefined`. Normalised into a concrete device by the
 * helpers in this module
 * @interface
 */
export interface IRawSubstrateDoc {
  /* The stable node id */
  nodeId?: string;

  /* The device title */
  title?: string;

  /* The device description */
  description?: string;

  /* The device kind */
  kind?: string;

  /* The topology layer */
  layer?: string;

  /* The operational status */
  status?: string;

  /* The hardware vendor */
  vendor?: string;

  /* The specific model */
  model?: string;

  /* The idle power draw in watts */
  power?: number;

  /* The labelled spec rows */
  specs?: Array<{ label?: string; value?: string }>;

  /* The edges to other devices */
  connections?: Array<{ to?: string; kind?: string; label?: string }>;

  /* The free-form tags */
  tags?: string[];

  /* The sort weight */
  order?: number;

  /* The content route */
  path?: string;
}
