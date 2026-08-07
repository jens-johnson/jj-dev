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
 * ███████████████████████████████████████ #components/content/EtherealField.vue ███████████████████████████████████████
 *
 * Decorative full-bleed ethereal backdrop for the "A Habit of Nothing" post. Layered, slowly drifting blurred
 * colour fields breathe against a soft base while a faint display word hovers at centre, evoking stillness. Pure
 * CSS; theme-aware via design tokens and honours prefers-reduced-motion by holding the composition static.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
</script>

<template>
  <div
    class="ethereal"
    aria-hidden="true"
  >
    <div class="ethereal__orb ethereal__orb--a" />

    <div class="ethereal__orb ethereal__orb--b" />

    <div class="ethereal__orb ethereal__orb--c" />

    <div class="ethereal__orb ethereal__orb--d" />

    <div class="ethereal__grain" />

    <span class="ethereal__word">nothing</span>
  </div>
</template>

<style scoped>
/* ─── Field ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

.ethereal {
  position: relative;
  width: 100%;
  height: clamp(280px, 46vh, 480px);
  margin: 2.75rem 0;
  border-radius: 20px;
  overflow: hidden;
  isolation: isolate;
  border: 1px solid var(--color-border);
  background: radial-gradient(
    130% 90% at 50% 0%,
    color-mix(in oklch, var(--color-accent) 7%, var(--color-surface)),
    var(--color-surface)
  );
}

/* ─── Drifting colour fields (theme-adaptive via the accent tokens) ──────────────────────────────────────────────── */

.ethereal__orb {
  position: absolute;
  aspect-ratio: 1;
  border-radius: 50%;
  filter: blur(64px);
  opacity: 0.5;
  will-change: transform, opacity;
}

.ethereal__orb--a {
  width: 54%;
  top: -22%;
  left: -8%;
  background: radial-gradient(circle at center, var(--color-accent-secondary), transparent 68%);
  animation:
    drift-a 26s ease-in-out infinite,
    breathe 9s ease-in-out infinite;
}

.ethereal__orb--b {
  width: 50%;
  top: 4%;
  right: -6%;
  background: radial-gradient(circle at center, var(--color-accent), transparent 68%);
  animation:
    drift-b 32s ease-in-out infinite,
    breathe 11s ease-in-out infinite 1.5s;
}

.ethereal__orb--c {
  width: 46%;
  bottom: -26%;
  left: 16%;
  background: radial-gradient(circle at center, var(--color-accent), transparent 70%);
  animation:
    drift-c 30s ease-in-out infinite,
    breathe 10s ease-in-out infinite 0.7s;
}

.ethereal__orb--d {
  width: 32%;
  right: 20%;
  bottom: -12%;
  opacity: 0.38;
  background: radial-gradient(circle at center, var(--color-accent-secondary), transparent 70%);
  animation:
    drift-d 36s ease-in-out infinite,
    breathe 13s ease-in-out infinite 2.2s;
}

@keyframes drift-a {
  0%,
  100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(12%, 8%);
  }
}

@keyframes drift-b {
  0%,
  100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(-10%, 10%);
  }
}

@keyframes drift-c {
  0%,
  100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(9%, -11%);
  }
}

@keyframes drift-d {
  0%,
  100% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(-9%, -7%);
  }
}

@keyframes breathe {
  0%,
  100% {
    opacity: 0.36;
  }

  50% {
    opacity: 0.6;
  }
}

/* ─── Grain + edge vignette so the field melts into the page ──────────────────────────────────────────────────────── */

.ethereal__grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.4;
  mix-blend-mode: soft-light;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.ethereal::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    125% 95% at 50% 45%,
    transparent 52%,
    color-mix(in oklch, var(--color-bg) 55%, transparent)
  );
}

/* ─── Hovering display word ──────────────────────────────────────────────────────────────────────────────────────── */

.ethereal__word {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2.75rem, 11vw, 7.5rem);
  letter-spacing: -0.03em;
  color: var(--color-ink);
  opacity: 0.07;
  user-select: none;
  animation: word-breathe 8s ease-in-out infinite;
}

@keyframes word-breathe {
  0%,
  100% {
    opacity: 0.05;
  }

  50% {
    opacity: 0.11;
  }
}

/* ─── Reduced motion: hold everything still ──────────────────────────────────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
  .ethereal__orb,
  .ethereal__word {
    animation: none;
  }
}
</style>
