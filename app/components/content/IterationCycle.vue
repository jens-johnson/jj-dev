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
 * ████████████████████████████████ #components/content/IterationCycle.vue ████████████████████████████████████████████
 *
 * MDC component embedded as `::iteration-cycle`. Renders the "build → momentum → ??? → drop-off" loop as an animated
 * orbital diagram: four nodes arranged in a circle, a pulse traveling around the connector ring, and each step
 * highlights in sequence to suggest the inevitable cycle.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

const steps = [
  { num: '01', label: 'Excited', body: 'A new framework. A new aesthetic. I start iterating on a design.' },
  { num: '02', label: 'Momentum', body: 'A few half-baked pages, a strong trajectory, real progress.' },
  { num: '03', label: '???', body: 'Something stalls. The plot is lost. The unknown happens.' },
  { num: '04', label: 'Drop-off', body: 'Maintenance burden. Boredom. The project quietly tapers off.' },
];

const activeIdx = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  timer = setInterval(() => {
    activeIdx.value = (activeIdx.value + 1) % steps.length;
  }, 2200);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <div class="not-prose my-12">
    <div class="relative mx-auto max-w-3xl">
      <!-- ── Mobile: vertical list ───────────────────────────────────────── -->
      <ol class="space-y-3 md:hidden">
        <li
          v-for="(step, i) in steps"
          :key="step.num"
          class="border-border bg-surface relative flex gap-4 rounded-xl border p-4 transition-colors"
          :class="{ 'border-accent': i === activeIdx }"
        >
          <span
            class="text-caption flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono transition-colors"
            :class="i === activeIdx ? 'bg-accent text-stone-50' : 'bg-bg text-ink-subtle'"
          >
            {{ step.num }}
          </span>
          <div class="min-w-0">
            <p class="font-display text-h5 text-ink mb-1 font-bold">{{ step.label }}</p>
            <p class="font-body text-body-sm text-ink-muted">{{ step.body }}</p>
          </div>
        </li>
      </ol>

      <!-- ── Desktop: 2x2 grid with center connector ────────────────────── -->
      <div class="relative hidden md:block">
        <!-- Center orbital ring (decorative) -->
        <svg
          class="text-accent absolute inset-0 m-auto h-48 w-48 opacity-25"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
          aria-hidden="true"
          style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
        >
          <circle cx="50" cy="50" r="48" stroke-dasharray="2 4" />
          <!-- Orbit dot -->
          <circle r="3" fill="currentColor" stroke="none" class="orbit-dot">
            <animateMotion dur="8.8s" repeatCount="indefinite">
              <mpath href="#orbit-path" />
            </animateMotion>
          </circle>
          <path id="orbit-path" d="M 50 2 A 48 48 0 1 1 49.99 2 Z" stroke="none" />
        </svg>

        <!-- Cycle indicator at center -->
        <div
          class="absolute inset-0 m-auto flex h-20 w-20 items-center justify-center"
          style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
        >
          <Icon name="lucide:rotate-cw" size="32" class="text-accent opacity-40" />
        </div>

        <div class="grid grid-cols-2 gap-x-32 gap-y-8">
          <div
            v-for="(step, i) in steps"
            :key="step.num"
            class="border-border bg-surface relative rounded-2xl border p-6 transition-all duration-500"
            :class="i === activeIdx ? 'border-accent -translate-y-1 shadow-lg' : ''"
          >
            <div class="mb-3 flex items-center justify-between">
              <span
                class="text-caption flex h-9 w-9 items-center justify-center rounded-full font-mono font-medium transition-colors"
                :class="i === activeIdx ? 'bg-accent text-stone-50' : 'bg-bg text-ink-subtle'"
              >
                {{ step.num }}
              </span>
              <span v-if="i === activeIdx" class="bg-accent h-2 w-2 animate-pulse rounded-full" aria-hidden="true" />
            </div>
            <p class="font-display text-h5 text-ink mb-2 font-bold">{{ step.label }}</p>
            <p class="font-body text-body-sm text-ink-muted leading-relaxed">{{ step.body }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
