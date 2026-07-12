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

import type { PadPreset } from './enums';

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
