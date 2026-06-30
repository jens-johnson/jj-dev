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
 * ███████████████████████ #components/content/GoalsCarouselVisual.vue ███████████████████████████████████████████████
 *
 * Small SVG illustration that lives in the top of each GoalsCarousel card. Animates on parent `.goal-card:hover`.
 * Three variants; `layers` (stacked bare-metal blocks), `leaf` (organic curve), `branch` (git diagram).
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

defineProps<{
  variant: 'layers' | 'leaf' | 'branch';
  icon: string;
}>();
</script>

<template>
  <div class="relative h-16 w-16">
    <!-- Subtle background blob -->
    <div
      class="absolute inset-0 rounded-2xl transition-all duration-500"
      style="background-color: color-mix(in oklch, var(--color-accent) 8%, transparent)"
    />

    <!-- ── LAYERS variant ─────────────────────────────────────────────── -->
    <svg
      v-if="variant === 'layers'"
      class="text-accent absolute inset-0 m-auto h-12 w-12"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect class="layer-1" x="8" y="24" width="32" height="8" rx="2" />
      <rect class="layer-2" x="11" y="14" width="26" height="8" rx="2" />
      <rect class="layer-3" x="14" y="4" width="20" height="8" rx="2" />
    </svg>

    <!-- ── LEAF variant ──────────────────────────────────────────────── -->
    <svg
      v-else-if="variant === 'leaf'"
      class="text-accent absolute inset-0 m-auto h-12 w-12"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path class="leaf-shape" d="M 12 38 C 12 18, 28 6, 40 8 C 42 22, 32 38, 14 40 Z" />
      <line class="leaf-vein" x1="12" y1="38" x2="40" y2="8" />
      <path class="leaf-vein-2" d="M 20 32 L 28 28" />
      <path class="leaf-vein-3" d="M 22 24 L 32 18" />
    </svg>

    <!-- ── BRANCH variant ────────────────────────────────────────────── -->
    <svg
      v-else-if="variant === 'branch'"
      class="text-accent absolute inset-0 m-auto h-12 w-12"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <line x1="14" y1="6" x2="14" y2="42" />
      <path class="branch-fork" d="M 14 18 C 14 24, 32 22, 32 28 L 32 38" />
      <circle class="git-node-1" cx="14" cy="10" r="3" fill="currentColor" />
      <circle class="git-node-2" cx="14" cy="38" r="3" fill="currentColor" />
      <circle class="git-node-3" cx="32" cy="32" r="3" fill="currentColor" />
    </svg>
  </div>
</template>

<style scoped>
/* ─── LAYERS animation: stack assembles on hover ─────────────────────────────────────────────────────────────────── */
.layer-1,
.layer-2,
.layer-3 {
  transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
  transform-box: fill-box;
  transform-origin: center;
}

:global(.goal-card:hover) .layer-1 {
  transform: translateY(-1px);
}

:global(.goal-card:hover) .layer-2 {
  transform: translateY(-3px);
}

:global(.goal-card:hover) .layer-3 {
  transform: translateY(-6px);
}

/* ─── LEAF animation: vein traces draw in on hover ───────────────────────────────────────────────────────────────── */
.leaf-shape {
  stroke-dasharray: 120;
  stroke-dashoffset: 0;
  transition: fill 500ms ease;
}

.leaf-vein,
.leaf-vein-2,
.leaf-vein-3 {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  transition: stroke-dashoffset 700ms cubic-bezier(0.16, 1, 0.3, 1);
}

:global(.goal-card:hover) .leaf-vein {
  stroke-dashoffset: 0;
}

:global(.goal-card:hover) .leaf-vein-2 {
  stroke-dashoffset: 0;
  transition-delay: 100ms;
}

:global(.goal-card:hover) .leaf-vein-3 {
  stroke-dashoffset: 0;
  transition-delay: 200ms;
}

:global(.goal-card:hover) .leaf-shape {
  fill: color-mix(in oklch, var(--color-accent) 14%, transparent);
}

/* ─── BRANCH animation: nodes pulse + fork extends on hover ──────────────────────────────────────────────────────── */
.branch-fork {
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  transition: stroke-dashoffset 700ms cubic-bezier(0.16, 1, 0.3, 1);
}

:global(.goal-card:hover) .branch-fork {
  stroke-dashoffset: 0;
}

.git-node-1,
.git-node-2,
.git-node-3 {
  transition: r 300ms ease;
}

:global(.goal-card:hover) .git-node-3 {
  animation: node-pulse 1.4s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes node-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

/* Reduced motion: hold the static composition. */
@media (prefers-reduced-motion: reduce) {
  .layer-1,
  .layer-2,
  .layer-3,
  .leaf-shape,
  .leaf-vein,
  .leaf-vein-2,
  .leaf-vein-3,
  .branch-fork,
  .git-node-1,
  .git-node-2,
  .git-node-3 {
    transition: none;
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
