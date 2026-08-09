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
 * ████████████████████████████████ #components/widgets/blog/ethereal-header/index.vue █████████████████████████████████
 *
 * Ethereal full-bleed backdrop for the blog post detail header, selected per-post via the `hero: ethereal`
 * frontmatter. Layered, slowly drifting blurred colour fields breathe behind the title to evoke stillness. Pure
 * CSS; theme-aware via the accent tokens and held static under prefers-reduced-motion. Kept subtle so header text
 * stays legible.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
</script>

<template>
  <div
    class="ethereal-header"
    aria-hidden="true"
  >
    <div class="ethereal-header__orb ethereal-header__orb--a" />

    <div class="ethereal-header__orb ethereal-header__orb--b" />

    <div class="ethereal-header__orb ethereal-header__orb--c" />

    <div class="ethereal-header__orb ethereal-header__orb--d" />

    <div class="ethereal-header__grain" />
  </div>
</template>

<style scoped>
/* ─── Backdrop ───────────────────────────────────────────────────────────────────────────────────────────────────── */

.ethereal-header {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  isolation: isolate;
}

/* ─── Drifting colour fields (theme-adaptive via the accent tokens) ──────────────────────────────────────────────── */

.ethereal-header__orb {
  position: absolute;
  aspect-ratio: 1;
  border-radius: 50%;
  filter: blur(72px);
  opacity: 0.42;
  will-change: transform, opacity;
}

.ethereal-header__orb--a {
  width: 44%;
  top: -30%;
  left: -6%;
  background: radial-gradient(circle at center, var(--color-accent-secondary), transparent 68%);
  animation:
    eh-drift-a 28s ease-in-out infinite,
    eh-breathe 9s ease-in-out infinite;
}

.ethereal-header__orb--b {
  width: 42%;
  top: -18%;
  right: -6%;
  background: radial-gradient(circle at center, var(--color-accent), transparent 68%);
  animation:
    eh-drift-b 34s ease-in-out infinite,
    eh-breathe 11s ease-in-out infinite 1.5s;
}

.ethereal-header__orb--c {
  width: 40%;
  bottom: -34%;
  left: 22%;
  background: radial-gradient(circle at center, var(--color-accent), transparent 70%);
  animation:
    eh-drift-c 31s ease-in-out infinite,
    eh-breathe 10s ease-in-out infinite 0.7s;
}

.ethereal-header__orb--d {
  width: 28%;
  right: 24%;
  bottom: -18%;
  opacity: 0.3;
  background: radial-gradient(circle at center, var(--color-accent-secondary), transparent 70%);
  animation:
    eh-drift-d 38s ease-in-out infinite,
    eh-breathe 13s ease-in-out infinite 2.2s;
}

@keyframes eh-drift-a {
  0%,
  100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(14%, 10%);
  }
}

@keyframes eh-drift-b {
  0%,
  100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(-12%, 12%);
  }
}

@keyframes eh-drift-c {
  0%,
  100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(10%, -12%);
  }
}

@keyframes eh-drift-d {
  0%,
  100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(-10%, -8%);
  }
}

@keyframes eh-breathe {
  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.5;
  }
}

/* ─── Grain + edge fade so the field melts into the header ────────────────────────────────────────────────────────── */

.ethereal-header__grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.35;
  mix-blend-mode: soft-light;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.ethereal-header::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 40%, color-mix(in oklch, var(--color-bg) 45%, transparent));
}

/* ─── Reduced motion: hold everything still ──────────────────────────────────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .ethereal-header__orb {
    animation: none;
  }
}
</style>
