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
 * ██████████████████████████████████████ #components/data/category-tag/types.ts ███████████████████████████████████████
 *
 * Type definitions for the category tag component: the props contract and the per-category visual treatment shape.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The props accepted by the category tag; the category value is optional and unknown values fall back to a neutral tag.
 * @public
 * @interface
 */
export interface ICategoryTagProps {
  /* The pick category to render; a known category or any raw value for the neutral fallback */
  category?: string;
}

/**
 * The visual treatment rendered for a category: the human-readable label and the leading dot's color.
 * @public
 * @interface
 */
export interface ICategoryTagVisual {
  /* The human-readable label rendered as an uppercase mono eyebrow */
  label: string;

  /* The Tailwind background color class applied to the small leading dot */
  dot: string;
}
