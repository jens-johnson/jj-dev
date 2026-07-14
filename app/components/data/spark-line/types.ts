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
 * ███████████████████████████████████████ #components/data/spark-line/types.ts ████████████████████████████████████████
 *
 * Sparkline component module: props/geometry types, drawing constants, and the pure geometry builder with its tests.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The props accepted by the sparkline: the numeric series to plot plus optional sizing and area-fill tuning
 * @public
 * @interface
 */
export interface ISparkLineProps {
  /* The numeric series to plot; fewer than two points renders a placeholder glyph instead */
  points: number[];

  /* The rendered SVG width in pixels */
  width?: number;

  /* The rendered SVG height in pixels */
  height?: number;

  /* Whether to render the faint area fill beneath the line */
  fill?: boolean;
}

/**
 * The rendered sparkline geometry: the line and area SVG path strings plus the coordinates of the final point
 * @public
 * @interface
 */
export interface ISparkLineGeometry {
  /* The SVG path for the stroked line */
  line: string;

  /* The SVG path for the area fill beneath the line, closed along the bottom edge */
  area: string;

  /* The [x, y] coordinates of the series' final point, where the end dot renders */
  end: readonly [number, number];
}
