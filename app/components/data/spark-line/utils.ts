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
 * ███████████████████████████████████████ #components/data/spark-line/utils.ts ████████████████████████████████████████
 *
 * Sparkline component module: props/geometry types, drawing constants, and the pure geometry builder with its tests.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { defineSymbol } from '#shared/utils/symbol';

import { SPARK_LINE_PADDING_PX } from './constants';
import type { ISparkLineGeometry } from './types';

/**
 * Builds the sparkline SVG geometry for a numeric series: scales the points into the padded viewport, then renders
 * the stroked-line and area-fill path strings. A pure core: the component wraps this in a computed, and tests
 * exercise it directly
 * @public
 * @function
 * @param points - The numeric series to plot
 * @param width - The rendered SVG width in pixels
 * @param height - The rendered SVG height in pixels
 * @returns The line/area paths and final-point coordinates, or null when the series has fewer than two points
 */
export function buildSparkLineGeometry(points: number[], width: number, height: number): ISparkLineGeometry | null {
  // A single point has no line to draw; the component renders its placeholder glyph instead
  if (points.length < 2) {
    return null;
  }

  // Scale the series into the padded viewport; a flat series falls back to a range of one so it renders along the bottom pad line
  const min: number = Math.min(...points);
  const max: number = Math.max(...points);
  const range: number = max - min || 1;
  const stepX: number = (width - SPARK_LINE_PADDING_PX * 2) / (points.length - 1);
  const coords: (readonly [number, number])[] = points.map(
    (value: number, index: number): readonly [number, number] => {
      const x: number = SPARK_LINE_PADDING_PX + index * stepX;
      const y: number = SPARK_LINE_PADDING_PX + (1 - (value - min) / range) * (height - SPARK_LINE_PADDING_PX * 2);
      return [x, y] as const;
    },
  );

  // Guard the endpoints for the noUncheckedIndexedAccess narrowing; length >= 2 guarantees both exist
  const first: readonly [number, number] | undefined = coords[0];
  const last: readonly [number, number] | undefined = coords[coords.length - 1];
  if (!first || !last) {
    return null;
  }

  // Render the stroked line, then close the area fill along the bottom edge
  const line: string = coords
    .map(
      ([x, y]: readonly [number, number], index: number): string =>
        `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`,
    )
    .join(' ');
  const area: string = `${line} L${last[0].toFixed(1)},${height} L${first[0].toFixed(1)},${height} Z`;

  return {
    line,
    area,
    end: last,
  };
}

/* ─── Metadata ───────────────────────────────────────────────────────────────────────────────────────────────────── */

// Register a readable name/description so the unit suites can title their describe blocks from the source symbol
defineSymbol(buildSparkLineGeometry, {
  name: 'Build Spark Line Geometry',
  description: 'Builds the SVG line and area path geometry for a numeric sparkline series.',
});
