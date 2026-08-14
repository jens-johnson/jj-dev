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
 * ███████████████████████████████████ #components/widgets/blog/bento-grid/utils.ts ████████████████████████████████████
 *
 * Pure layout helper for the bento grid: resolves a tile footprint to its responsive grid-span classes.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { DEFAULT_SPAN_CLASS, SPAN_CLASS_BY_SIZE } from './constants';

/**
 * Resolves the responsive grid-span classes for a tile footprint. Unknown or missing sizes collapse to a single
 * `sm` cell so an unrecognized value from content never breaks the layout.
 * @public
 * @function
 * @param size - The tile footprint (`sm` | `wide` | `tall` | `large`), or any raw content value
 * @returns The Tailwind `lg:` column/row span class string for the tile
 */
export function bentoSpanClass(size?: string): string {
  if (!size) {
    return DEFAULT_SPAN_CLASS;
  }
  return SPAN_CLASS_BY_SIZE[size] ?? DEFAULT_SPAN_CLASS;
}
