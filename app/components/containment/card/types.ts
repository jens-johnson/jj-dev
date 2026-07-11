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
 * ███████████████████████████████████████ #components/containment/card/types.ts ███████████████████████████████████████
 *
 * Type definitions for the card component: the padding-preset enum, its derived union, and the props contract.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An enumeration of the inner padding presets the card supports
 * @public
 * @enum
 */
export enum PadPreset {
  /* Large inner padding (p-8) */
  lg = 'lg',

  /* Medium inner padding (p-6); the default */
  md = 'md',

  /* No inner padding; the consumer owns spacing */
  none = 'none',

  /* Small inner padding (p-4) */
  sm = 'sm',
}

/**
 * A type representing an inner padding preset; one of {@link PadPreset}
 * @public
 */
export type TPadPreset = `${PadPreset}`;

/**
 * The props accepted by the card: the root element tag and the inner padding preset
 * @public
 * @interface
 */
export interface ICardProps {
  /* The root element tag; use "article", "li", etc. as needed */
  as?: string;

  /* The inner padding preset */
  pad?: TPadPreset;
}
