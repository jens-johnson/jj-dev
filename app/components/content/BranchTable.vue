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
 * ███████████████████████████████████████ #components/content/BranchTable.vue ███████████████████████████████████████
 *
 * MDC component embedded in blog posts as `::branch-table`. Renders the three-branch / three-environment deploy
 * model as a styled card grid (rather than a flat table) so it reads visually rather than as data.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * A single branch/environment row rendered as a card in the deploy-model grid
 * @internal
 * @interface
 */
interface IBranchRow {
  /* The git branch or branch pattern (i.e. "feat/*") */
  branch: string;

  /* The environment name shown as the card's eyebrow label */
  env: string;

  /* The deployment URL for the environment */
  url: string;

  /* The accent-stripe tone keyed to the environment's promotion stage */
  tone: 'muted' | 'sage' | 'accent';
}

/**
 * The three branch/environment rows rendered as cards, in promotion order; the tone picks the accent stripe color
 * @internal
 * @constant
 */
const rows: IBranchRow[] = [
  {
    branch: 'feat/*',
    env: 'Preview',
    url: 'Vercel preview URL',
    tone: 'muted' as const,
  },
  {
    branch: 'staging',
    env: 'Pre-prod',
    url: 'staging.jens-johnson.com',
    tone: 'sage' as const,
  },
  {
    branch: 'main',
    env: 'Production',
    url: 'jens-johnson.com',
    tone: 'accent' as const,
  },
];
</script>

<template>
  <div class="not-prose border-border bg-surface my-10 overflow-hidden rounded-2xl border">
    <div class="divide-border grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
      <div
        v-for="row in rows"
        :key="row.branch"
        class="relative p-6"
      >
        <!-- Accent stripe -->
        <span
          class="absolute top-0 left-0 h-1 w-full"
          :class="{
            'bg-accent': row.tone === 'accent',
            'bg-accent-secondary': row.tone === 'sage',
            'bg-border': row.tone === 'muted',
          }"
        />

        <!-- Env label -->
        <p class="text-caption text-ink-subtle mb-3 font-mono tracking-widest uppercase">
          {{ row.env }}
        </p>

        <!-- Branch name -->
        <p class="text-h5 text-ink mb-2 font-mono font-bold">
          {{ row.branch }}
        </p>

        <!-- URL -->
        <p class="text-caption text-ink-muted font-mono break-all">
          {{ row.url }}
        </p>
      </div>
    </div>
  </div>
</template>
