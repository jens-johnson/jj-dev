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
 * Bento tile showing live GitHub contributions and Strava YTD running stats. Data is
 * fetched server-side via /api/metrics and rendered as twin weekly sparklines.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { MetricsResponse } from '../../../../server/api/metrics.get';

/* ─── Data fetch ──────────────────────────────────────────────────────────────────────────────────────────────────── */

const { data, status } = await useFetch<MetricsResponse>('/api/metrics');

/* ─── GitHub sparkline ────────────────────────────────────────────────────────────────────────────────────────────── */

/** Sum day-level counts into weekly totals, last 16 weeks to match the Strava sparkline. */
const weeklyContributions = computed<number[]>(() =>
  (data.value?.github.weeks ?? []).slice(-16).map((w) => w.days.reduce((sum, d) => sum + d.count, 0)),
);

const maxWeeklyContributions = computed(() => Math.max(...weeklyContributions.value, 1));

function ghBarHeight(count: number): string {
  if (count === 0) return '3px';
  const pct = count / maxWeeklyContributions.value;
  return `${Math.max(6, Math.round(pct * 52))}px`;
}

/* ─── Strava sparkline ────────────────────────────────────────────────────────────────────────────────────────────── */

const maxWeeklyMiles = computed(() => Math.max(...(data.value?.strava.weeklyMiles ?? [1])));

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
        <div class="bg-border h-4 w-24 rounded" />
        <div class="bg-border h-16 rounded" />
        <div class="bg-border h-4 w-24 rounded" />
        <div class="bg-border h-12 rounded" />
      </div>
    </template>

    <!-- Error state -->
    <template v-else-if="status === 'error' || !data">
      <div class="flex flex-1 flex-col items-start justify-between">
        <Icon name="lucide:activity" size="20" class="text-ink-subtle" />
        <div>
          <p class="font-display text-h5 text-ink-subtle font-bold">Offline</p>
          <p class="text-caption text-ink-subtle font-mono">Metrics unavailable</p>
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
            <p class="text-caption text-ink-subtle font-mono tracking-widest uppercase">GitHub</p>
          </div>
          <p class="text-caption text-ink-subtle font-mono">
            <span class="text-ink font-semibold">{{ data.github.totalContributions }}</span> contributions
          </p>
        </div>

        <!-- Weekly contributions sparkline -->
        <div>
          <p class="text-ink-subtle/60 mb-2 font-mono text-[10px] tracking-widest uppercase">
            Weekly contributions · last 16 wks
          </p>
          <div class="flex h-[52px] items-end gap-[3px]">
            <div
              v-for="(count, i) in weeklyContributions"
              :key="i"
              class="flex-1 rounded-sm transition-all duration-300"
              :class="count > 0 ? 'bg-accent/80' : 'bg-border'"
              :style="{ height: ghBarHeight(count) }"
              :title="`${count} contribution${count !== 1 ? 's' : ''}`"
            />
          </div>
          <p class="text-ink-subtle/50 mt-2 font-mono text-[9px] italic">
            * Public contributions only; excludes activity in enterprise GitHub organizations.
          </p>
        </div>
      </div>

      <!-- Divider -->
      <div class="bg-border h-px" />

      <!-- ── Strava ──────────────────────────────────────────────────────────── -->
      <div class="flex flex-1 flex-col justify-between">
        <!-- Header -->
        <div class="mb-3 flex items-center gap-1.5">
          <!-- Strava's brand colour -->
          <svg class="size-[13px]" viewBox="0 0 24 24" fill="#FC4C02" aria-hidden="true">
            <path
              d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"
            />
          </svg>
          <p class="text-caption text-ink-subtle font-mono tracking-widest uppercase">Strava</p>
        </div>

        <!-- Stats row -->
        <div class="mb-4 flex gap-4">
          <div>
            <p class="font-display text-h4 text-ink leading-none font-bold">{{ data.strava.ytdMiles }}</p>
            <p class="text-caption text-ink-subtle mt-1 font-mono">miles</p>
          </div>
          <div class="bg-border w-px" />
          <div>
            <p class="font-display text-h4 text-ink leading-none font-bold">{{ data.strava.ytdRuns }}</p>
            <p class="text-caption text-ink-subtle mt-1 font-mono">runs</p>
          </div>
          <div class="bg-border w-px" />
          <div>
            <p class="font-display text-h4 text-ink leading-none font-bold">
              {{ data.strava.ytdElevationFt.toLocaleString() }}
            </p>
            <p class="text-caption text-ink-subtle mt-1 font-mono">ft gain</p>
          </div>
        </div>

        <!-- Weekly mileage sparkline -->
        <div>
          <p class="text-ink-subtle/60 mb-2 font-mono text-[10px] tracking-widest uppercase">
            Weekly miles · last 16 wks
          </p>
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
