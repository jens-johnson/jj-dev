<script setup lang="ts">
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
 * ███████████████████████████████████████ #components/data/spark-line/index.vue ███████████████████████████████████████
 *
 * A tiny dependency-free sparkline: an inline SVG polyline (with a faint area fill and an end-point dot) plotting a
 * short numeric series. Auto-scales to the series' own min/max so flat, low-variance data still reads as a trend. Color
 * comes from `currentColor`, so callers set it with a Tailwind text-* class.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <DataSparkLine :points="cpuSeries" class="text-accent-secondary" />
 *
 * ─── PROPS ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • points
 *     - Description: The numeric series to plot; fewer than two points renders a placeholder glyph instead
 *     - Type: number[]
 *     - Required: true
 *   • width
 *     - Description: The rendered SVG width in pixels
 *     - Type: number
 *     - Required: false
 *     - Default: 88
 *   • height
 *     - Description: The rendered SVG height in pixels
 *     - Type: number
 *     - Required: false
 *     - Default: 24
 *   • fill
 *     - Description: Whether to render the faint area fill beneath the line
 *     - Type: boolean
 *     - Required: false
 *     - Default: true
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type { TPropsWithDefaults } from '@jens-johnson/style-guide/types/vue';

import { SPARK_LINE_END_DOT_RADIUS_PX } from './constants';
import type { ISparkLineGeometry, ISparkLineProps } from './types';
import { buildSparkLineGeometry } from './utils';

/* ─── PROPS ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Component props; the numeric series to plot plus optional sizing and area-fill tuning
 * @internal
 * @constant
 */
const props: TPropsWithDefaults<ISparkLineProps, 'width' | 'height' | 'fill'> = withDefaults(
  defineProps<ISparkLineProps>(),
  {
    width: 88,
    height: 24,
    fill: true,
  },
);

/* ─── COMPUTED ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The sparkline SVG geometry for the current series and sizing; null when the series is too short to draw, which
 * flips the template to its placeholder glyph. The math itself is the pure core in ./utils, exercised by its tests
 * @internal
 * @constant
 */
const geometry: ComputedRef<ISparkLineGeometry | null> = computed((): ISparkLineGeometry | null =>
  buildSparkLineGeometry(props.points, props.width, props.height),
);
</script>

<template>
  <svg
    v-if="geometry"
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    fill="none"
    aria-hidden="true"
  >
    <!-- The faint area fill beneath the line, when enabled -->
    <path
      v-if="fill"
      :d="geometry.area"
      fill="currentColor"
      class="opacity-10"
    />

    <!-- The stroked series line -->
    <path
      :d="geometry.line"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- The dot marking the series' final point -->
    <circle
      :cx="geometry.end[0]"
      :cy="geometry.end[1]"
      :r="SPARK_LINE_END_DOT_RADIUS_PX"
      fill="currentColor"
    />
  </svg>

  <!-- The placeholder glyph when the series is too short to draw -->
  <span
    v-else
    class="text-ink-subtle font-mono text-[10px]"
    >;
  </span>
</template>
