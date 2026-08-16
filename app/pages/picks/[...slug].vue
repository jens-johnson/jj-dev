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
 * ████████████████████████████████████████████ #pages/picks/[...slug].vue █████████████████████████████████████████████
 *
 * Picks edition detail; renders one bento edition as an interactive grid from the bento Nuxt Content collection.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type { TBentoCard } from '~/types/bento';

/**
 * The current route; its path keys the content query for this edition
 * @internal
 * @constant
 */
const route = useRoute();

/* ─── DATA ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The queried bento edition for the current path; a missing doc 404s before render
 * @internal
 * @constant
 */
const { data: edition } = await useAsyncData(`bento-${route.path}`, () =>
  queryCollection('bento').path(route.path).first(),
);

if (!edition.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Edition not found',
    fatal: true,
  });
}

/* ─── DERIVED ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The edition's tiles, coerced to the shared bento card union the grid consumes
 * @internal
 * @constant
 */
const cards: ComputedRef<TBentoCard[]> = computed((): TBentoCard[] => (edition.value?.cards ?? []) as TBentoCard[]);

/**
 * The first image tile's source, used as the social share image when present
 * @internal
 * @constant
 */
const ogImage: ComputedRef<string | undefined> = computed(
  (): string | undefined =>
    cards.value.find((card): card is Extract<TBentoCard, { type: 'image' }> => card.type === 'image')?.src,
);

useSeoMeta({
  title: `${edition.value.title} · Jens Johnson`,
  description: edition.value.description,
  ogTitle: edition.value.title,
  ogDescription: edition.value.description,
  ogImage,
});

/* ─── HELPERS ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Formats an ISO date string as a long en-US date (i.e. "August 14, 2026") for the edition header metadata
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
  <article
    v-if="edition"
    class="bg-bg min-h-screen"
  >
    <!-- ─── Header ────────────────────────────────────────────────────────────── -->
    <header class="border-border border-b">
      <div class="mx-auto max-w-6xl px-6 pt-20 pb-12 md:pt-28">
        <!-- Back link -->
        <NuxtLink
          :to="{ path: '/blog', query: { view: 'picks' } }"
          class="text-caption text-ink-subtle hover:text-accent mb-8 inline-flex items-center gap-1.5 font-mono tracking-widest uppercase transition-colors"
        >
          <Icon
            name="lucide:arrow-left"
            size="13"
          />
          All picks
        </NuxtLink>

        <!-- Meta -->
        <div class="mb-6 flex flex-wrap items-center gap-3">
          <p class="text-caption text-ink-subtle font-mono">{{ formatDate(edition.publishedAt) }}</p>

          <span
            v-if="edition.edition"
            class="text-caption text-ink-subtle font-mono"
          >
            · {{ edition.edition }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="font-display text-h2 text-ink mb-4 leading-tight font-bold tracking-tight">
          {{ edition.title }}
        </h1>

        <!-- Description -->
        <p
          v-if="edition.description"
          class="font-body text-body-lg text-ink-muted max-w-2xl leading-relaxed"
        >
          {{ edition.description }}
        </p>
      </div>
    </header>

    <!-- ─── Grid ──────────────────────────────────────────────────────────────── -->
    <section class="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <WidgetsBlogBentoGrid :cards="cards" />
    </section>
  </article>
</template>
