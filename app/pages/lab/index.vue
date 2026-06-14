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
 * ███████████████████████████████████████████████ #pages/lab/index.vue ████████████████████████████████████████████████
 *
 * Lab hub; the home for experiments, demos, and the homelab. Substrate (the homelab project) is the first
 * flagship; creative-coding experiments land alongside it over time.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

useSeoMeta({
  title: 'Lab · Jens Johnson',
  description: 'Experiments, demos, and the homelab; things I build to learn. Home of Substrate, my homelab project.',
});

/** Devices feed the hub card's system-health indicator. No live metrics yet, so this reflects declared status. */
const { data: devices } = await useAsyncData('lab-substrate-devices', () =>
  queryCollection('substrate').where('draft', '=', false).all(),
);

/** Overall health for the Substrate card; wires to real metrics once the box reports in. */
const health = computed(() => {
  const d = devices.value ?? [];
  if (!d.length) return { label: 'No data', dot: 'bg-ink-subtle', pulse: false };
  if (d.some((x) => x.status === 'offline')) return { label: 'Degraded', dot: 'bg-terra-600', pulse: true };
  return { label: 'Operational', dot: 'bg-accent-secondary', pulse: true };
});

const revealed = ref(false);
onMounted(() => {
  setTimeout(() => {
    revealed.value = true;
  }, 80);
});
</script>

<template>
  <div class="bg-bg min-h-screen">
    <div class="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28">
      <!-- ─── Hero ──────────────────────────────────────────────────────────────── -->
      <header class="mb-12">
        <p
          class="text-caption text-accent mb-4 font-mono tracking-widest uppercase transition-all duration-700"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'"
        >
          Lab
        </p>
        <h1
          class="font-display text-ink font-bold tracking-tight transition-all delay-75 duration-700"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'"
          style="font-size: clamp(2.5rem, 6vw, 4.5rem)"
        >
          Things I build to learn.
        </h1>
        <p
          class="font-body text-body-lg text-ink-muted mt-5 max-w-2xl leading-relaxed transition-all delay-100 duration-700"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'"
        >
          Experiments, demos, and the homelab; a workshop for ideas that don't fit anywhere else.
        </p>
      </header>

      <!-- ─── Cards ─────────────────────────────────────────────────────────────── -->
      <div
        class="grid grid-cols-1 gap-6 transition-all delay-150 duration-700 md:grid-cols-3"
        :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'"
      >
        <!-- Featured: Substrate -->
        <NuxtLink
          to="/lab/substrate"
          class="group border-border bg-surface hover:border-accent/60 relative flex flex-col justify-between overflow-hidden rounded-2xl border p-7 transition-all hover:-translate-y-0.5 hover:shadow-lg md:col-span-2"
        >
          <!-- Dotted topology backdrop -->
          <div class="lab-grid pointer-events-none absolute inset-0" aria-hidden="true" />

          <div class="relative">
            <div class="mb-5 flex items-center gap-3">
              <span class="bg-accent/10 text-accent flex size-11 items-center justify-center rounded-xl">
                <Icon name="lucide:network" size="22" />
              </span>
              <span class="text-caption text-accent font-mono tracking-widest uppercase">Flagship · Homelab</span>
            </div>
            <h2 class="font-display text-h3 text-ink font-bold tracking-tight">Substrate</h2>
            <p class="font-body text-body text-ink-muted mt-3 max-w-md leading-relaxed">
              A living, interactive dashboard for my HomeLab project. The networking setup, the nitty-gritty sysadmin
              work, and everything in between.
            </p>
          </div>

          <div class="relative mt-7 flex items-center justify-between">
            <!-- System-health indicator -->
            <span class="text-caption text-ink-subtle inline-flex items-center gap-2 font-mono">
              <span class="relative flex size-2">
                <span
                  v-if="health.pulse"
                  class="absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden"
                  :class="health.dot"
                />
                <span class="relative inline-flex size-2 rounded-full" :class="health.dot" />
              </span>
              {{ health.label }}
            </span>

            <span
              class="text-body-sm text-ink group-hover:text-accent inline-flex items-center gap-1.5 font-semibold transition-colors"
            >
              Explore the setup
              <Icon name="lucide:arrow-right" size="15" class="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </NuxtLink>

        <!-- Teaser: more experiments -->
        <div class="border-border bg-surface/40 flex flex-col justify-between rounded-2xl border border-dashed p-7">
          <div>
            <span
              class="bg-bg text-ink-subtle border-border flex size-11 items-center justify-center rounded-xl border"
            >
              <Icon name="lucide:flask-conical" size="22" />
            </span>
            <h2 class="font-display text-h4 text-ink mt-5 font-bold tracking-tight">More brewing</h2>
            <p class="font-body text-body-sm text-ink-muted mt-3 leading-relaxed">
              Generative sketches, interaction demos, and bits of creative code; landing here as I make them.
            </p>
          </div>
          <span class="text-caption text-ink-subtle mt-6 font-mono tracking-widest uppercase">Coming soon</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lab-grid {
  background-image: radial-gradient(circle, var(--color-border) 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.4;
  mask-image: linear-gradient(135deg, #000 0%, transparent 55%);
}
</style>
