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
 * ██████████████████████████ #components/widgets/blog/header-animation/index.vue ██████████████████████████████████████
 *
 * Decorative full-width SVG backdrop for the blog post detail page header. A central browser-wireframe "builds"
 * piece-by-piece in a staggered sequence, surrounded by independent ambient loops: a roaming cursor, pulsing nodes,
 * a rotating `</>` code symbol, flickering terminal log lines, a git-branch diagram, and floating wireframe panels.
 *
 * Every animation runs on its own period so the composition feels alive rather than mechanically synced. All paths
 * are stroked in `currentColor` so the parent controls tint via a `text-*` utility. Honours `prefers-reduced-motion`.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <svg
      class="text-accent absolute inset-0 h-full w-full opacity-[0.08]"
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <!-- ════════════════════════════════════════════════════════════════════════════════════════════════════════════
           CENTER — main browser wireframe build sequence
      ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ -->
      <g transform="translate(400, 50)">
        <!-- Browser frame -->
        <g class="part part-frame">
          <rect x="0" y="0" width="400" height="280" rx="8" />
          <line x1="0" y1="32" x2="400" y2="32" />
        </g>

        <!-- Window controls -->
        <g class="part part-dots">
          <circle cx="18" cy="16" r="3" fill="currentColor" stroke="none" />
          <circle cx="32" cy="16" r="3" fill="currentColor" stroke="none" />
          <circle cx="46" cy="16" r="3" fill="currentColor" stroke="none" />
        </g>

        <!-- URL bar -->
        <g class="part part-url">
          <rect x="90" y="9" width="220" height="14" rx="7" />
        </g>

        <!-- Nav bar -->
        <g class="part part-nav">
          <rect x="24" y="48" width="20" height="20" rx="3" />
          <rect x="54" y="55" width="46" height="6" rx="3" />
          <rect x="260" y="56" width="34" height="6" rx="3" />
          <rect x="302" y="56" width="34" height="6" rx="3" />
          <rect x="344" y="56" width="34" height="6" rx="3" />
        </g>

        <!-- Hero block -->
        <g class="part part-hero">
          <rect x="24" y="86" width="352" height="74" rx="4" />
          <line x1="44" y1="112" x2="240" y2="112" />
          <line x1="44" y1="124" x2="200" y2="124" />
          <rect x="44" y="136" width="60" height="10" rx="5" />
        </g>

        <!-- Content cards -->
        <g class="part part-card-1">
          <rect x="24" y="178" width="110" height="86" rx="4" />
          <line x1="44" y1="232" x2="100" y2="232" />
          <line x1="44" y1="244" x2="80" y2="244" />
        </g>
        <g class="part part-card-2">
          <rect x="146" y="178" width="110" height="86" rx="4" />
          <line x1="166" y1="232" x2="222" y2="232" />
          <line x1="166" y1="244" x2="200" y2="244" />
        </g>
        <g class="part part-card-3">
          <rect x="268" y="178" width="110" height="86" rx="4" />
          <line x1="288" y1="232" x2="344" y2="232" />
          <line x1="288" y1="244" x2="322" y2="244" />
        </g>
      </g>

      <!-- ════════════════════════════════════════════════════════════════════════════════════════════════════════════
           LEFT — code bracket + mini wireframe panel
      ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ -->

      <!-- Rotating code symbol </> — wrapped so we can rotate without losing the translate -->
      <g transform="translate(140, 130)">
        <g class="rotate-slow">
          <path d="M -22 -16 L -38 0 L -22 16" stroke-width="2" />
          <path d="M 22 -16 L 38 0 L 22 16" stroke-width="2" />
          <line x1="-8" y1="20" x2="8" y2="-20" stroke-width="2" />
        </g>
      </g>

      <!-- Mini wireframe panel (top-left) -->
      <g class="ambient float-1" transform="translate(80, 30)">
        <rect x="0" y="0" width="140" height="60" rx="4" />
        <line x1="0" y1="14" x2="140" y2="14" />
        <circle cx="8" cy="7" r="2" fill="currentColor" stroke="none" />
        <line x1="10" y1="28" x2="80" y2="28" />
        <line x1="10" y1="38" x2="110" y2="38" />
        <line x1="10" y1="48" x2="60" y2="48" />
      </g>

      <!-- Mini wireframe panel (bottom-left) -->
      <g class="ambient float-2" transform="translate(60, 260)">
        <rect x="0" y="0" width="170" height="100" rx="4" />
        <rect x="14" y="18" width="50" height="34" rx="3" />
        <line x1="74" y1="22" x2="150" y2="22" />
        <line x1="74" y1="34" x2="130" y2="34" />
        <line x1="74" y1="46" x2="140" y2="46" />
        <line x1="14" y1="68" x2="156" y2="68" />
        <line x1="14" y1="80" x2="120" y2="80" />
      </g>

      <!-- ════════════════════════════════════════════════════════════════════════════════════════════════════════════
           RIGHT — terminal + git diagram
      ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ -->

      <!-- Terminal panel with flickering log lines -->
      <g class="ambient float-3" transform="translate(900, 40)">
        <rect x="0" y="0" width="220" height="140" rx="4" />
        <line x1="0" y1="22" x2="220" y2="22" />
        <circle cx="12" cy="11" r="2" fill="currentColor" stroke="none" />
        <circle cx="22" cy="11" r="2" fill="currentColor" stroke="none" />
        <circle cx="32" cy="11" r="2" fill="currentColor" stroke="none" />
        <!-- Log lines that flicker on/off -->
        <g class="log-line log-line-1">
          <rect x="14" y="38" width="6" height="6" rx="1" fill="currentColor" stroke="none" />
          <line x1="26" y1="41" x2="130" y2="41" />
        </g>
        <g class="log-line log-line-2">
          <rect x="14" y="56" width="6" height="6" rx="1" fill="currentColor" stroke="none" />
          <line x1="26" y1="59" x2="160" y2="59" />
        </g>
        <g class="log-line log-line-3">
          <rect x="14" y="74" width="6" height="6" rx="1" fill="currentColor" stroke="none" />
          <line x1="26" y1="77" x2="110" y2="77" />
        </g>
        <g class="log-line log-line-4">
          <rect x="14" y="92" width="6" height="6" rx="1" fill="currentColor" stroke="none" />
          <line x1="26" y1="95" x2="180" y2="95" />
        </g>
        <!-- Blinking caret -->
        <line class="caret" x1="14" y1="116" x2="14" y2="126" stroke-width="2" />
      </g>

      <!-- Git branch diagram (bottom-right) -->
      <g class="ambient float-4" transform="translate(990, 240)">
        <line x1="0" y1="0" x2="0" y2="120" />
        <line x1="0" y1="30" x2="50" y2="50" />
        <line x1="50" y1="50" x2="50" y2="90" />
        <line x1="50" y1="80" x2="100" y2="100" />
        <line x1="100" y1="100" x2="100" y2="120" />
        <circle class="git-node git-node-1" cx="0" cy="20" r="5" />
        <circle class="git-node git-node-2" cx="0" cy="60" r="5" />
        <circle class="git-node git-node-3" cx="0" cy="100" r="5" />
        <circle class="git-node git-node-4" cx="50" cy="70" r="5" />
        <circle class="git-node git-node-5" cx="100" cy="115" r="5" fill="currentColor" />
      </g>

      <!-- ════════════════════════════════════════════════════════════════════════════════════════════════════════════
           SCATTERED — pulsing dots throughout the canvas
      ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ -->
      <g>
        <circle class="dot dot-1" cx="280" cy="350" r="3" fill="currentColor" stroke="none" />
        <circle class="dot dot-2" cx="350" cy="50" r="2" fill="currentColor" stroke="none" />
        <circle class="dot dot-3" cx="60" cy="200" r="3" fill="currentColor" stroke="none" />
        <circle class="dot dot-4" cx="850" cy="220" r="2" fill="currentColor" stroke="none" />
        <circle class="dot dot-5" cx="870" cy="360" r="3" fill="currentColor" stroke="none" />
        <circle class="dot dot-6" cx="1150" cy="50" r="2" fill="currentColor" stroke="none" />
        <circle class="dot dot-7" cx="1170" cy="200" r="3" fill="currentColor" stroke="none" />
        <circle class="dot dot-8" cx="240" cy="20" r="2" fill="currentColor" stroke="none" />
      </g>

      <!-- ════════════════════════════════════════════════════════════════════════════════════════════════════════════
           ROAMING CURSOR — travels around the canvas on a closed path
      ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ -->
      <g class="cursor-roam">
        <path d="M 0 0 L 0 14 L 4 10 L 8 16 L 11 14 L 7 9 L 13 9 Z" fill="currentColor" stroke="none" />
      </g>

      <!-- ════════════════════════════════════════════════════════════════════════════════════════════════════════════
           FLOATING GEOMETRY — abstract shapes drifting in the periphery
      ════════════════════════════════════════════════════════════════════════════════════════════════════════════════ -->

      <!-- Small triangle (left) -->
      <g class="ambient drift-1" transform="translate(30, 100)">
        <path d="M 0 0 L 18 30 L -18 30 Z" />
      </g>

      <!-- Diamond (right) -->
      <g class="ambient drift-2" transform="translate(1100, 280)">
        <path d="M 0 -14 L 14 0 L 0 14 L -14 0 Z" />
      </g>

      <!-- Small grid square (top center-left) -->
      <g class="ambient drift-3" transform="translate(320, 70)">
        <rect x="0" y="0" width="22" height="22" rx="2" />
        <line x1="0" y1="11" x2="22" y2="11" />
        <line x1="11" y1="0" x2="11" y2="22" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* ─── Main build sequence (center wireframe) ─────────────────────────────────────────────────────────────────────── */

.part {
  opacity: 0;
  transform: translateY(8px);
  animation: build 14s ease-in-out infinite;
}

.part-frame {
  animation-delay: 0s;
}

.part-dots {
  animation-delay: 0.5s;
}

.part-url {
  animation-delay: 0.9s;
}

.part-nav {
  animation-delay: 1.4s;
}

.part-hero {
  animation-delay: 2s;
}

.part-card-1 {
  animation-delay: 2.6s;
}

.part-card-2 {
  animation-delay: 2.9s;
}

.part-card-3 {
  animation-delay: 3.2s;
}

@keyframes build {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }

  6% {
    opacity: 1;
    transform: translateY(0);
  }

  80% {
    opacity: 1;
    transform: translateY(0);
  }

  94% {
    opacity: 0;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(8px);
  }
}

/* ─── Ambient elements: opacity breathing ────────────────────────────────────────────────────────────────────────── */

/* Float groups have inline SVG `transform="translate(...)"` attributes — we only animate opacity to avoid clobbering
   their position. Each one breathes on its own period for an asynchronous feel. */

.float-1 {
  animation: breathe 7s ease-in-out infinite;
}

.float-2 {
  animation: breathe 9s ease-in-out infinite 1.2s;
}

.float-3 {
  animation: breathe 8s ease-in-out infinite 0.6s;
}

.float-4 {
  animation: breathe 11s ease-in-out infinite 2s;
}

@keyframes breathe {
  0%,
  100% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }
}

/* ─── Rotating code symbol ───────────────────────────────────────────────────────────────────────────────────────── */

.rotate-slow {
  transform-box: fill-box;
  transform-origin: center;
  animation:
    spin 14s linear infinite,
    breathe 6s ease-in-out infinite;
}

@keyframes spin {
  from {
    rotate: 0deg;
  }

  to {
    rotate: 360deg;
  }
}

/* ─── Terminal log lines: flicker on at staggered intervals ──────────────────────────────────────────────────────── */

.log-line {
  opacity: 0;
  animation: log-flicker 5s ease-in-out infinite;
}

.log-line-1 {
  animation-delay: 0s;
}

.log-line-2 {
  animation-delay: 0.6s;
}

.log-line-3 {
  animation-delay: 1.3s;
}

.log-line-4 {
  animation-delay: 2.1s;
}

@keyframes log-flicker {
  0% {
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  85% {
    opacity: 1;
  }

  95% {
    opacity: 0;
  }

  100% {
    opacity: 0;
  }
}

.caret {
  animation: caret-blink 1.1s steps(2, end) infinite;
}

@keyframes caret-blink {
  0%,
  49% {
    opacity: 1;
  }

  50%,
  100% {
    opacity: 0;
  }
}

/* ─── Git nodes: pulse at varying speeds ─────────────────────────────────────────────────────────────────────────── */

.git-node {
  transform-origin: center;
  transform-box: fill-box;
  animation: node-pulse 3s ease-in-out infinite;
}

.git-node-1 {
  animation-delay: 0s;
}

.git-node-2 {
  animation-delay: 0.5s;
}

.git-node-3 {
  animation-delay: 1s;
}

.git-node-4 {
  animation-delay: 1.5s;
}

.git-node-5 {
  animation-delay: 2s;
}

@keyframes node-pulse {
  0%,
  100% {
    opacity: 0.4;
    scale: 1;
  }

  50% {
    opacity: 1;
    scale: 1.4;
  }
}

/* ─── Scattered dots: independent pulse cycles ───────────────────────────────────────────────────────────────────── */

.dot {
  transform-origin: center;
  transform-box: fill-box;
  animation: dot-pulse 4s ease-in-out infinite;
}

.dot-1 {
  animation-duration: 3.2s;
  animation-delay: 0s;
}

.dot-2 {
  animation-duration: 4.5s;
  animation-delay: 0.8s;
}

.dot-3 {
  animation-duration: 3.7s;
  animation-delay: 1.5s;
}

.dot-4 {
  animation-duration: 5.1s;
  animation-delay: 0.3s;
}

.dot-5 {
  animation-duration: 3.4s;
  animation-delay: 2s;
}

.dot-6 {
  animation-duration: 4.8s;
  animation-delay: 1.1s;
}

.dot-7 {
  animation-duration: 3.9s;
  animation-delay: 0.5s;
}

.dot-8 {
  animation-duration: 4.3s;
  animation-delay: 1.8s;
}

@keyframes dot-pulse {
  0%,
  100% {
    opacity: 0.3;
    scale: 1;
  }

  50% {
    opacity: 1;
    scale: 1.6;
  }
}

/* ─── Roaming cursor: travels around the canvas ──────────────────────────────────────────────────────────────────── */

.cursor-roam {
  animation: cursor-path 16s ease-in-out infinite;
}

@keyframes cursor-path {
  0% {
    transform: translate(100px, 60px);
    opacity: 0;
  }

  5% {
    opacity: 1;
  }

  20% {
    transform: translate(600px, 100px);
    opacity: 1;
  }

  40% {
    transform: translate(800px, 250px);
    opacity: 1;
  }

  60% {
    transform: translate(450px, 320px);
    opacity: 1;
  }

  80% {
    transform: translate(180px, 220px);
    opacity: 1;
  }

  95% {
    opacity: 1;
  }

  100% {
    transform: translate(100px, 60px);
    opacity: 0;
  }
}

/* ─── Drifting geometric shapes ──────────────────────────────────────────────────────────────────────────────────── */

.drift-1 {
  animation:
    drift-spin 18s linear infinite,
    breathe 5s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

.drift-2 {
  animation:
    drift-spin-rev 22s linear infinite,
    breathe 7s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

.drift-3 {
  animation:
    drift-spin 25s linear infinite,
    breathe 6s ease-in-out infinite 1.5s;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes drift-spin {
  from {
    rotate: 0deg;
  }

  to {
    rotate: 360deg;
  }
}

@keyframes drift-spin-rev {
  from {
    rotate: 0deg;
  }

  to {
    rotate: -360deg;
  }
}

/* ─── Reduced motion: hold the composition static ────────────────────────────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .part,
  .ambient,
  .dot,
  .git-node,
  .log-line,
  .caret,
  .cursor-roam {
    opacity: 0.7;
    transform: none;
    animation: none;
  }
}
</style>
