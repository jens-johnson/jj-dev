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
 * ███████████████████████████████ #components/widgets/home/about-animation/constants.ts ███████████████████████████████
 *
 * Constants tuning the topographic contour-line canvas animation: line density, accent color, peak shape, and speed.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The number of contour lines drawn across the canvas
 * @public
 * @constant
 */
export const NUM_LINES: number = 24;

/**
 * The base accent color (earth brown) as R,G,B components for rgba() composition
 * @public
 * @constant
 */
export const ACCENT_RGB: string = '139, 101, 52';

/**
 * The Gaussian sigma-squared controlling how far the mouse peak spreads, in squared pixels
 * @public
 * @constant
 */
export const PEAK_SIGMA: number = 22_000;

/**
 * The maximum vertical displacement of the mountain peak at the cursor center, in pixels
 * @public
 * @constant
 */
export const PEAK_HEIGHT: number = 110;

/**
 * The animation speed multiplier; lower is calmer
 * @public
 * @constant
 */
export const SPEED: number = 0.0032;
