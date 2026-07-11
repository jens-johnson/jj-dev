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

import type { IMetricsResponse } from '../../../../server/api/metrics.get';
import { SPARKLINE_EMPTY_BAR_HEIGHT, SPARKLINE_MAX_BAR_HEIGHT_PX, SPARKLINE_WEEK_COUNT } from './constants';

/* ─── DATA FETCH ─────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The combined GitHub/Strava metrics payload and its fetch status; drives the skeleton, error, and loaded states
 * @internal
 * @constant
 */
const { data, status } = await useFetch<IMetricsResponse>('/api/metrics');

/* ─── GITHUB SPARKLINE ───────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Day-level contribution counts summed into weekly totals, sliced to the trailing weeks matching the Strava sparkline
 * @internal
 * @constant
 */
const weeklyContributions = computed<number[]>(() =>
  (data.value?.github.weeks ?? [])
    .slice(-SPARKLINE_WEEK_COUNT)
    .map((week) => week.days.reduce((sum, day) => sum + day.count, 0)),
);

/**
 * The busiest week's contribution total (floored at 1); the scale ceiling for the GitHub bars
 * @internal
 * @constant
 */
const maxWeeklyContributions = computed(() => Math.max(...weeklyContributions.value, 1));

/**
 * A utility method to compute the rendered bar height for a weekly GitHub contribution total, scaled against the
 * busiest week; zero-contribution weeks render as a 3px baseline stub
 * @internal
 * @function
 * @param count - The total contributions for the week
 * @returns The CSS height value for the sparkline bar
 */
function ghBarHeight(count: number): string {
  if (count === 0) {
    return SPARKLINE_EMPTY_BAR_HEIGHT;
  }
  const pct = count / maxWeeklyContributions.value;
  return `${Math.max(6, Math.round(pct * SPARKLINE_MAX_BAR_HEIGHT_PX))}px`;
}

/* ─── STRAVA SPARKLINE ───────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The highest-mileage week (defaulting to 1 while data is absent); the scale ceiling for the Strava bars
 * @internal
 * @constant
 */
const maxWeeklyMiles = computed(() => Math.max(...(data.value?.strava.weeklyMiles ?? [1])));

/**
 * A utility method to compute the rendered bar height for a weekly Strava mileage total, scaled against the highest
 * mileage week; zero-mile weeks render as a 3px baseline stub
 * @internal
 * @function
 * @param miles - The total miles run for the week
 * @returns The CSS height value for the sparkline bar
 */
function barHeight(miles: number): string {
  if (!maxWeeklyMiles.value) {
    return '4px';
  }
  const pct = miles / maxWeeklyMiles.value;
  // Clamp between the empty-week stub and 100% of the available height
  return miles === 0 ? SPARKLINE_EMPTY_BAR_HEIGHT : `${Math.max(12, Math.round(pct * SPARKLINE_MAX_BAR_HEIGHT_PX))}px`;
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
        <Icon
          name="lucide:activity"
          size="20"
          class="text-ink-subtle"
        />

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
            <Icon
              name="lucide:github"
              size="13"
              class="text-ink-subtle"
            />

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
          <!-- Strava's brand color -->
          <svg
            class="size-[13px]"
            viewBox="0 0 24 24"
            fill="#FC4C02"
            aria-hidden="true"
          >
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
