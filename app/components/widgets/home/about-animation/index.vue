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
 * position — hovering raises a "mountain peak" that pushes nearby contours apart.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Drop into any fixed-size container. The canvas stretches to fill via absolute inset-0.
 * Mouse events are handled internally — no props required.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/* ─── Constants ──────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Number of contour lines drawn across the canvas. */
const NUM_LINES = 24;
/** Base accent colour (earth brown) as R,G,B components for rgba() composition. */
const ACCENT_RGB = '139, 101, 52';
/** Gaussian sigma² controlling how far the mouse peak spreads (px²). */
const PEAK_SIGMA = 22_000;
/** Maximum vertical displacement of the mountain peak at cursor centre (px). */
const PEAK_HEIGHT = 110;
/** Animation speed multiplier — lower is calmer. */
const SPEED = 0.0032;

/* ─── State ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

const canvasRef = useTemplateRef<HTMLCanvasElement>('canvas');

let raf: number;
let ctx: CanvasRenderingContext2D | null = null;
let W = 0;
let H = 0;
let t = 0;

const mouseX = ref(-1);
const mouseY = ref(-1);
const mouseActive = ref(false);
/** Smoothed mouse position used in the draw loop (lerped toward actual mouse). */
const smoothMX = ref(-1);
const smoothMY = ref(-1);

/* ─── Setup ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

function resize() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  W = canvas.offsetWidth;
  H = canvas.offsetHeight;
  if (W === 0 || H === 0) return;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx = canvas.getContext('2d');
  ctx?.scale(dpr, dpr);
}

/* ─── Draw helpers ───────────────────────────────────────────────────────────────────────────────────────────────── */

/** Lerp smoothed mouse position one step toward the raw mouse position. */
function lerpMouse() {
  if (!mouseActive.value) return;
  const snap = smoothMX.value < 0;
  smoothMX.value = snap ? mouseX.value : smoothMX.value + (mouseX.value - smoothMX.value) * 0.08;
  smoothMY.value = snap ? mouseY.value : smoothMY.value + (mouseY.value - smoothMY.value) * 0.08;
}

/** Gaussian mountain displacement at (x, baseY) for a mouse at (mx, my). */
function computePeak(x: number, baseY: number, mx: number, my: number): number {
  const dx = x - mx;
  const dy = baseY - my;
  const bump = PEAK_HEIGHT * Math.exp(-(dx * dx + dy * dy) / PEAK_SIGMA);
  return (baseY < my ? -1 : 1) * bump;
}

/** Trace a single contour path onto ctx (call beginPath before, stroke after). */
function traceContour(baseY: number, phase: number, mx: number, my: number, active: boolean) {
  for (let x = 0; x <= W; x += 3) {
    const wave =
      Math.sin(x * 0.0075 + t * 0.9 + phase) * 26 +
      Math.sin(x * 0.014 - t * 0.65 + phase * 1.6) * 15 +
      Math.sin(x * 0.024 + t * 1.2 + phase * 0.7) * 7 +
      Math.cos(x * 0.0046 + t * 0.45 - phase * 0.4) * 11;
    const peak = active ? computePeak(x, baseY, mx, my) : 0;
    const y = baseY + wave + peak;
    if (x === 0) {
      ctx!.moveTo(x, y);
    } else {
      ctx!.lineTo(x, y);
    }
  }
}

/** Draw a soft radial glow centred on the cursor. */
function drawGlow(mx: number, my: number) {
  const grad = ctx!.createRadialGradient(mx, my, 0, mx, my, 180);
  grad.addColorStop(0, `rgba(${ACCENT_RGB}, 0.07)`);
  grad.addColorStop(0.5, `rgba(${ACCENT_RGB}, 0.025)`);
  grad.addColorStop(1, `rgba(${ACCENT_RGB}, 0)`);
  ctx!.fillStyle = grad;
  ctx!.fillRect(0, 0, W, H);
}

/* ─── Draw ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

function draw() {
  raf = requestAnimationFrame(draw);
  if (!ctx || W === 0 || H === 0) return;

  ctx.clearRect(0, 0, W, H);
  t += SPEED;
  lerpMouse();

  const mx = smoothMX.value;
  const my = smoothMY.value;
  const active = mouseActive.value && mx >= 0;

  for (let i = 0; i < NUM_LINES; i++) {
    const frac = i / (NUM_LINES - 1); // 0 → 1 top to bottom
    const baseY = frac * H;
    const phase = i * 0.38; // per-line phase offset

    const proximity = active ? Math.exp(-((baseY - my) ** 2) / 18_000) : 0;
    const midBoost = 1 - Math.abs(frac - 0.5) * 2; // peaks at vertical centre
    const baseOpacity = 0.06 + midBoost * 0.14 + proximity * 0.28;

    ctx.beginPath();
    ctx.strokeStyle = `rgba(${ACCENT_RGB}, ${Math.min(baseOpacity, 0.55)})`;
    ctx.lineWidth = 0.65 + midBoost * 0.35 + proximity * 0.7;
    traceContour(baseY, phase, mx, my, active);
    ctx.stroke();
  }

  if (active) {
    drawGlow(mx, my);
  }
}

/* ─── Mouse handlers ─────────────────────────────────────────────────────────────────────────────────────────────── */

function onMove(e: MouseEvent) {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const r = canvas.getBoundingClientRect();
  mouseX.value = e.clientX - r.left;
  mouseY.value = e.clientY - r.top;
  mouseActive.value = true;
}

function onLeave() {
  mouseActive.value = false;
  smoothMX.value = -1;
  smoothMY.value = -1;
}

/* ─── Lifecycle ──────────────────────────────────────────────────────────────────────────────────────────────────── */

onMounted(() => {
  nextTick(() => {
    resize();
    raf = requestAnimationFrame(draw);
  });
  window.addEventListener('resize', resize, {
    passive: true,
  });
});

onUnmounted(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener('resize', resize);
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
