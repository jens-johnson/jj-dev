<script setup lang="ts">
/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                ██        ██                     ▄▄
 *                                ▀▀        ▀▀                     ██
 *                              ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                             ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * ███████████████████████████████████████████ #components/data/spark-line/index.vue ████████████████████████████████████
 *
 * A tiny dependency-free sparkline: an inline SVG polyline (with a faint area fill and an end-point dot) plotting a
 * short numeric series. Auto-scales to the series' own min/max so flat, low-variance data still reads as a trend.
 * Colour comes from `currentColor`, so callers set it with a Tailwind text-* class.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <DataSparkLine :points="cpuSeries" class="text-accent-secondary" />
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

const props = withDefaults(
  defineProps<{
    points: number[];
    width?: number;
    height?: number;
    fill?: boolean;
  }>(),
  { width: 88, height: 24, fill: true },
);

const PAD = 2;

const geom = computed(() => {
  const pts = props.points;
  if (pts.length < 2) return null;

  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const range = max - min || 1;
  const stepX = (props.width - PAD * 2) / (pts.length - 1);

  const coords = pts.map((v, i) => {
    const x = PAD + i * stepX;
    const y = PAD + (1 - (v - min) / range) * (props.height - PAD * 2);
    return [x, y] as const;
  });

  const first = coords[0];
  const last = coords[coords.length - 1];
  if (!first || !last) return null;

  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${last[0].toFixed(1)},${props.height} L${first[0].toFixed(1)},${props.height} Z`;

  return { line, area, end: last };
});
</script>

<template>
  <svg v-if="geom" :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" fill="none" aria-hidden="true">
    <path v-if="fill" :d="geom.area" fill="currentColor" class="opacity-10" />
    <path :d="geom.line" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <circle :cx="geom.end[0]" :cy="geom.end[1]" r="1.7" fill="currentColor" />
  </svg>
  <span v-else class="text-ink-subtle font-mono text-[10px]">—</span>
</template>
