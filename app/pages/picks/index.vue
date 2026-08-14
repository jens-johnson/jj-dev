<script setup lang="ts">
/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                 ██        ██                     ▄▄
 *                                 ▀▀        ▀▀                     ██
 *                               ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                 ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                 ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                 ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                 ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                              ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * ██████████████████████████████████████████████ #pages/picks/index.vue ███████████████████████████████████████████████
 *
 * Picks index; lists published bento editions newest-first, each linking to its grid.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
useSeoMeta({
  title: 'Picks · Jens Johnson',
  description:
    "This month's hyperfixations — a bento grid of what I'm into lately: clothing, media, food, culture, quotes, and code.",
  ogTitle: 'Picks · Jens Johnson',
  ogDescription: "This month's hyperfixations — a bento grid of what I'm into lately.",
});

/* ─── DATA ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * All published bento editions, newest first; drafts are filtered out
 * @internal
 * @constant
 */
const { data: editions } = await useAsyncData('bento-index', () =>
  queryCollection('bento').where('draft', '=', false).order('publishedAt', 'DESC').all(),
);

/* ─── HELPERS ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Formats an ISO date string as a long en-US date (i.e. "August 14, 2026") for the edition listing metadata
 * @internal
 * @function
 * @param iso - The ISO date string to format
 * @returns The formatted date
 */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>

<template>
  <div class="bg-bg min-h-screen">
    <!-- ─── Hero ──────────────────────────────────────────────────────────────── -->
    <section class="border-border border-b">
      <div class="mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-32">
        <p class="text-caption text-accent mb-4 font-mono tracking-widest uppercase">Picks</p>

        <h1 class="font-display text-h1 text-ink leading-tight font-bold tracking-tight">
          This month's hyperfixations.
        </h1>

        <p class="font-body text-body-lg text-ink-muted mt-6 max-w-2xl leading-relaxed">
          A recurring bento grid of whatever I'm into lately — clothing, media, food, culture, quotes, and code. Less
          essay, more scrapbook.
        </p>
      </div>
    </section>

    <!-- ─── Editions ──────────────────────────────────────────────────────────── -->
    <section class="mx-auto max-w-6xl px-6 py-16">
      <!-- Empty state -->
      <div
        v-if="!editions?.length"
        class="flex flex-col items-center py-24 text-center"
      >
        <p class="text-caption text-ink-subtle font-mono tracking-widest uppercase">No editions yet</p>

        <p class="font-body text-body text-ink-muted mt-3 max-w-sm">The first edition of picks is on the way.</p>
      </div>

      <!-- Edition list -->
      <ul
        v-else
        class="space-y-0"
        role="list"
      >
        <li
          v-for="ed in editions"
          :key="ed.path"
          class="border-border border-t first:border-t-0"
        >
          <NuxtLink
            :to="ed.path"
            class="group grid gap-4 py-8 md:grid-cols-[180px_1fr] md:gap-8"
          >
            <p class="text-caption text-ink-subtle font-mono">
              {{ ed.edition ?? formatDate(ed.publishedAt) }}
            </p>

            <div>
              <h2 class="font-display text-h4 text-ink group-hover:text-accent mb-1 font-bold transition-colors">
                {{ ed.title }}
              </h2>

              <p
                v-if="ed.description"
                class="font-body text-body text-ink-muted max-w-3xl"
              >
                {{ ed.description }}
              </p>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
