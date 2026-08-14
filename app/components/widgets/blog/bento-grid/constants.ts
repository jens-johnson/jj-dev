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
 * █████████████████████████████████ #components/widgets/blog/bento-grid/constants.ts ██████████████████████████████████
 *
 * Constants for the bento grid: the tile-footprint-to-span-class lookup and the default span.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The responsive column/row span classes for each tile footprint, applied at the `lg` breakpoint on the 4-column
 * grid. Below `lg` every tile is a single cell (grid falls back to 1/2 columns), so these only qualify `lg:`.
 *
 * Kept as full literal class strings (not composed) so Tailwind's JIT scanner picks them up.
 * @public
 * @constant
 */
export const SPAN_CLASS_BY_SIZE: Record<string, string> = {
  sm: 'lg:col-span-1 lg:row-span-1',
  wide: 'lg:col-span-2 lg:row-span-1',
  tall: 'lg:col-span-1 lg:row-span-2',
  large: 'lg:col-span-2 lg:row-span-2',
};

/**
 * The span classes applied when a tile's `size` is missing or unknown; a single `sm` cell. A literal (rather than a
 * `SPAN_CLASS_BY_SIZE` lookup) so it types as a concrete `string`, not `string | undefined`.
 * @public
 * @constant
 */
export const DEFAULT_SPAN_CLASS = 'lg:col-span-1 lg:row-span-1';
