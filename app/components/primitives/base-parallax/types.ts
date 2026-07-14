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
 * ███████████████████████████████████ #components/primitives/base-parallax/types.ts ███████████████████████████████████
 *
 * Type definitions for the parallax behavior primitive: the props contract tuning the lerp feel and hero sizing.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The props accepted by the parallax primitive; both tune the feel of the effect and are optional
 * @public
 * @interface
 */
export interface IBaseParallaxProps {
  /* The lerp factor applied per frame; lower = smoother/slower. Defaults to 0.055 */
  lerp?: number;

  /* The hero height as a fraction of the viewport, used to derive markStyle scroll progress. Defaults to 0.92 */
  heroFraction?: number;
}
