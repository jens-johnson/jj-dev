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
 * ██████████████████████████ #components/widgets/home/about-animation/index.vue ████████████████████████████████████████
 *
 * Topographic contour-line canvas animation for the About panel. Animated terrain lines react to mouse
 * position; hovering raises a "mountain peak" that pushes nearby contours apart.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Drop into any fixed-size container. The canvas stretches to fill via absolute inset-0.
 * Mouse events are handled internally; no props required.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { useEventListener, useRafFn } from '@vueuse/core';

import { ACCENT_RGB, NUM_LINES, PEAK_HEIGHT, PEAK_SIGMA, SPEED } from './constants';

/* ─── STATE ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The template ref for the canvas element the contour animation draws onto
 * @internal
 * @constant
 */
const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas');

/**
 * The cached 2D rendering context; refreshed by resize and null until the canvas is laid out
 * @internal
 */
let ctx: CanvasRenderingContext2D | null = null;

/**
 * The rendered canvas width in CSS pixels; kept in sync by resize
 * @internal
 */
let W = 0;

/**
 * The rendered canvas height in CSS pixels; kept in sync by resize
 * @internal
 */
let H = 0;

/**
 * The animation clock; advanced by SPEED each frame and fed into the contour wave functions
 * @internal
 */
let t = 0;

/**
 * The raw cursor x position in canvas coordinates; -1 until the mouse first enters
 * @internal
 * @constant
 */
const mouseX: Ref<number> = ref(-1);

/**
 * The raw cursor y position in canvas coordinates; -1 until the mouse first enters
 * @internal
 * @constant
 */
const mouseY: Ref<number> = ref(-1);

/**
 * Whether the cursor is currently over the canvas; gates the peak displacement and glow
 * @internal
 * @constant
 */
const mouseActive: Ref<boolean> = ref(false);

/**
 * The smoothed cursor x position used in the draw loop (lerped toward the raw mouse position)
 * @internal
 * @constant
 */
const smoothMX: Ref<number> = ref(-1);

/**
 * The smoothed cursor y position used in the draw loop (lerped toward the raw mouse position)
 * @internal
 * @constant
 */
const smoothMY: Ref<number> = ref(-1);

/* ─── SETUP ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A utility method to size the canvas backing store to its rendered dimensions at the device pixel ratio and refresh
 * the cached 2D context
 * @internal
 * @function
 */
function resize(): void {
  const canvas: HTMLCanvasElement | null = canvasRef.value;
  if (!canvas) {
    return;
  }
  // Measure the rendered size; a zero dimension means the canvas is not laid out yet
  const dpr: number = window.devicePixelRatio || 1;
  W = canvas.offsetWidth;
  H = canvas.offsetHeight;
  if (W === 0 || H === 0) {
    return;
  }
  // Scale the backing store by the device pixel ratio and refresh the cached context
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx = canvas.getContext('2d');
  ctx?.scale(dpr, dpr);
}

/* ─── DRAW HELPERS ───────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A utility method to lerp the smoothed mouse position one step toward the raw mouse position
 * @internal
 * @function
 */
function lerpMouse(): void {
  if (!mouseActive.value) {
    return;
  }
  // Snap on first entry (no stale position to ease from), otherwise ease toward the raw position
  const snap: boolean = smoothMX.value < 0;
  smoothMX.value = snap ? mouseX.value : smoothMX.value + (mouseX.value - smoothMX.value) * 0.08;
  smoothMY.value = snap ? mouseY.value : smoothMY.value + (mouseY.value - smoothMY.value) * 0.08;
}

/**
 * A utility method to compute the Gaussian mountain displacement at (x, baseY) for a mouse at (mx, my)
 * @internal
 * @function
 * @param x - The sample x position along the contour, in canvas coordinates
 * @param baseY - The contour's undisplaced y position, in canvas coordinates
 * @param mx - The smoothed cursor x position, in canvas coordinates
 * @param my - The smoothed cursor y position, in canvas coordinates
 * @returns The signed vertical displacement to add to the contour at this sample
 */
function computePeak(x: number, baseY: number, mx: number, my: number): number {
  // Gaussian falloff by squared distance from the cursor
  const dx: number = x - mx;
  const dy: number = baseY - my;
  const bump: number = PEAK_HEIGHT * Math.exp(-(dx * dx + dy * dy) / PEAK_SIGMA);
  // Lines above the cursor push up, lines below push down
  return (baseY < my ? -1 : 1) * bump;
}

/**
 * A utility method to trace a single contour path onto the cached context (call beginPath before, stroke after)
 * @internal
 * @function
 * @param baseY - The contour's undisplaced y position, in canvas coordinates
 * @param phase - The per-line phase offset applied to the layered sine waves
 * @param mx - The smoothed cursor x position, in canvas coordinates
 * @param my - The smoothed cursor y position, in canvas coordinates
 * @param active - Whether the mouse peak displacement should be applied
 */
function traceContour(baseY: number, phase: number, mx: number, my: number, active: boolean): void {
  for (let x = 0; x <= W; x += 3) {
    // Sum layered sine waves for organic terrain, then add the mouse peak displacement
    const wave: number =
      Math.sin(x * 0.0075 + t * 0.9 + phase) * 26 +
      Math.sin(x * 0.014 - t * 0.65 + phase * 1.6) * 15 +
      Math.sin(x * 0.024 + t * 1.2 + phase * 0.7) * 7 +
      Math.cos(x * 0.0046 + t * 0.45 - phase * 0.4) * 11;
    const peak: number = active ? computePeak(x, baseY, mx, my) : 0;
    const y: number = baseY + wave + peak;
    // Start the path on the first sample, extend it on every following one
    if (x === 0) {
      ctx!.moveTo(x, y);
    } else {
      ctx!.lineTo(x, y);
    }
  }
}

/**
 * A utility method to draw a soft radial glow centered on the cursor
 * @internal
 * @function
 * @param mx - The smoothed cursor x position, in canvas coordinates
 * @param my - The smoothed cursor y position, in canvas coordinates
 */
function drawGlow(mx: number, my: number): void {
  // Build a radial gradient that fades the accent out to transparent
  const grad: CanvasGradient = ctx!.createRadialGradient(mx, my, 0, mx, my, 180);
  grad.addColorStop(0, `rgba(${ACCENT_RGB}, 0.07)`);
  grad.addColorStop(0.5, `rgba(${ACCENT_RGB}, 0.025)`);
  grad.addColorStop(1, `rgba(${ACCENT_RGB}, 0)`);
  // Flood the full canvas; the gradient itself limits the visible halo
  ctx!.fillStyle = grad;
  ctx!.fillRect(0, 0, W, H);
}

/* ─── DRAW LOOP ──────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The main render loop; clears the canvas, advances the animation clock, lerps the mouse, strokes each contour line
 * with proximity-weighted opacity/width, and overlays the cursor glow while the mouse is active. Driven by useRafFn,
 * which schedules and cancels it with the component lifecycle
 * @internal
 * @function
 */
function draw(): void {
  if (!ctx || W === 0 || H === 0) {
    return;
  }

  // Clear the frame, advance the animation clock, and ease the mouse position
  ctx.clearRect(0, 0, W, H);
  t += SPEED;
  lerpMouse();

  const mx: number = smoothMX.value;
  const my: number = smoothMY.value;
  const active: boolean = mouseActive.value && mx >= 0;

  // Stroke each contour with proximity-weighted opacity and width
  for (let lineIndex = 0; lineIndex < NUM_LINES; lineIndex++) {
    const frac: number = lineIndex / (NUM_LINES - 1); // 0 → 1 top to bottom
    const baseY: number = frac * H;
    const phase: number = lineIndex * 0.38; // per-line phase offset

    const proximity: number = active ? Math.exp(-((baseY - my) ** 2) / 18_000) : 0;
    const midBoost: number = 1 - Math.abs(frac - 0.5) * 2; // peaks at vertical center
    const baseOpacity: number = 0.06 + midBoost * 0.14 + proximity * 0.28;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(${ACCENT_RGB}, ${Math.min(baseOpacity, 0.55)})`;
    ctx.lineWidth = 0.65 + midBoost * 0.35 + proximity * 0.7;
    traceContour(baseY, phase, mx, my, active);
    ctx.stroke();
  }

  // Overlay the cursor glow while the mouse is active
  if (active) {
    drawGlow(mx, my);
  }
}

/* ─── HANDLERS ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A utility method to handle mouse move events on the canvas; records the cursor position in canvas coordinates and
 * activates the mountain-peak effect
 * @internal
 * @function
 * @param event - The triggering mouse event
 */
function onMove(event: MouseEvent): void {
  const canvas: HTMLCanvasElement | null = canvasRef.value;
  if (!canvas) {
    return;
  }
  // Translate the viewport cursor position into canvas coordinates and activate the peak
  const rect: DOMRect = canvas.getBoundingClientRect();
  mouseX.value = event.clientX - rect.left;
  mouseY.value = event.clientY - rect.top;
  mouseActive.value = true;
}

/**
 * A utility method to handle mouse leave events on the canvas; deactivates the peak effect and resets the smoothed
 * mouse position so the next entry snaps to the cursor
 * @internal
 * @function
 */
function onLeave(): void {
  // Deactivate the peak and reset the smoothed position so the next entry snaps to the cursor
  mouseActive.value = false;
  smoothMX.value = -1;
  smoothMY.value = -1;
}

/* ─── LIFECYCLE ──────────────────────────────────────────────────────────────────────────────────────────────────── */

// Size the canvas once it is laid out; the render loop and resize listener auto-start client-side and tear down on
// unmount (useRafFn and useEventListener manage the raf handle and the listener, so no manual cleanup is needed)
onMounted((): void => {
  nextTick(resize);
});
useRafFn(draw);
useEventListener(window, 'resize', resize, {
  passive: true,
});
</script>

<template>
  <canvas
    ref="canvas"
    class="absolute inset-0 h-full w-full cursor-crosshair"
    aria-hidden="true"
    @mousemove="onMove"
    @mouseleave="onLeave"
  />
</template>
