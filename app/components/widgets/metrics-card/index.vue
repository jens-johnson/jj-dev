<script setup lang="ts">
/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                ██        ██                     ▄▄
 *                                ██        ██                     ██
 *                              ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                             ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * ████████████████████████████ #components/widgets/metrics-card/index.vue ██████████████████████████████████████████████
 *
 * Bento tile showing live GitHub contribution heatmap and Strava YTD running stats. Data is
 * fetched server-side via /api/metrics and rendered as a compact heatmap grid + mileage sparkline.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type {
  MetricsResponse,
} from '../../../../server/api/metrics.get';

/* ─── Data fetch ──────────────────────────────────────────────────────────────────────────────────────────────────── */

const { data, status } = await useFetch<MetricsResponse>('/api/metrics');

/* ─── GitHub heatmap ──────────────────────────────────────────────────────────────────────────────────────────────── */

/** Maps contribution level (0–4) to a Tailwind opacity class. */
const levelOpacity: Record<number, string> = {
  0: 'opacity-[0.08]',
  1: 'opacity-30',
  2: 'opacity-55',
  3: 'opacity-75',
  4: 'opacity-100',
};

/* ─── Strava sparkline ────────────────────────────────────────────────────────────────────────────────────────────── */

const maxWeeklyMiles = computed(() =>
  Math.max(...(data.value?.strava.weeklyMiles ?? [1])),
);

function barHeight(miles: number): string {
  if (!maxWeeklyMiles.value) return '4px';
  const pct = miles / maxWeeklyMiles.value;
  // Clamp between 4px (empty week) and 100% of available height
  return miles === 0 ? '3px' : `${Math.max(12, Math.round(pct * 52))}px`;
}
</script>

<template>
  <div class="flex h-full flex-col gap-5">

    <!-- Loading skeleton -->
    <template v-if="status === 'pending'">
      <div class="flex flex-1 animate-pulse flex-col gap-4">
        <div class="h-4 w-24 rounded bg-border" />
        <div class="h-16 rounded bg-border" />
        <div class="h-4 w-24 rounded bg-border" />
        <div class="h-12 rounded bg-border" />
      </div>
    </template>

    <!-- Error state -->
    <template v-else-if="status === 'error' || !data">
      <div class="flex flex-1 flex-col items-start justify-between">
        <Icon name="lucide:activity" size="20" class="text-ink-subtle" />
        <div>
          <p class="font-display text-h5 font-bold text-ink-subtle">Offline</p>
          <p class="font-mono text-caption text-ink-subtle">Metrics unavailable</p>
        </div>
      </div>
    </template>

    <!-- Loaded -->
    <template v-else>

      <!-- ── GitHub ─────────────────────────────────────────────────────────── -->
      <div>
        <!-- Header row -->
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <Icon name="lucide:github" size="13" class="text-ink-subtle" />
            <p class="font-mono text-caption uppercase tracking-widest text-ink-subtle">GitHub</p>
          </div>
          <p class="font-mono text-caption text-ink-subtle">
            <span class="font-semibold text-ink">{{ data.github.totalContributions }}</span> contributions
          </p>
        </div>

        <!-- Contribution heatmap — 26 weeks × 7 days -->
        <div class="flex gap-[3px]">
          <div
            v-for="(week, wi) in data.github.weeks"
            :key="wi"
            class="flex flex-col gap-[3px]"
          >
            <div
              v-for="(day, di) in week.days"
              :key="di"
              class="size-[7px] rounded-[2px] bg-accent"
              :class="levelOpacity[day.level]"
              :title="`${day.count} contribution${day.count !== 1 ? 's' : ''}`"
            />
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-border" />

      <!-- ── Strava ──────────────────────────────────────────────────────────── -->
      <div class="flex flex-1 flex-col justify-between">
        <!-- Header -->
        <div class="mb-3 flex items-center gap-1.5">
          <!-- Strava's brand colour -->
          <svg class="size-[13px]" viewBox="0 0 24 24" fill="#FC4C02" aria-hidden="true">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
          <p class="font-mono text-caption uppercase tracking-widest text-ink-subtle">Strava</p>
        </div>

        <!-- Stats row -->
        <div class="mb-4 flex gap-4">
          <div>
            <p class="font-display text-h4 font-bold leading-none text-ink">{{ data.strava.ytdMiles }}</p>
            <p class="mt-1 font-mono text-caption text-ink-subtle">miles</p>
          </div>
          <div class="w-px bg-border" />
          <div>
            <p class="font-display text-h4 font-bold leading-none text-ink">{{ data.strava.ytdRuns }}</p>
            <p class="mt-1 font-mono text-caption text-ink-subtle">runs</p>
          </div>
          <div class="w-px bg-border" />
          <div>
            <p class="font-display text-h4 font-bold leading-none text-ink">{{ data.strava.ytdElevationFt.toLocaleString() }}</p>
            <p class="mt-1 font-mono text-caption text-ink-subtle">ft gain</p>
          </div>
        </div>

        <!-- Weekly mileage sparkline -->
        <div>
          <p class="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-subtle/60">Weekly miles · last 16 wks</p>
          <div class="flex items-end gap-[3px]">
            <div
              v-for="(miles, i) in data.strava.weeklyMiles"
              :key="i"
              class="flex-1 rounded-sm transition-all duration-300"
              :class="miles > 0 ? 'bg-[#FC4C02]/70' : 'bg-border'"
              :style="{ height: barHeight(miles) }"
              :title="`${miles} mi`"
            />
          </div>
        </div>

      </div>
    </template>

  </div>
</template>
