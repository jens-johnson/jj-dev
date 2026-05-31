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
 * ████████████████████████████████████████████ #pages/blog/[...slug].vue ██████████████████████████████████████████████
 *
 * Blog post detail — renders a single markdown post from the `blog` Nuxt Content collection. The catch-all slug
 * means `/blog/2026-building-jj-dev` maps to `content/blog/2026-building-jj-dev.md`. Includes hero header, prose
 * body, and a footer with a back link to the index.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

const route = useRoute();

/* ─── Data ────────────────────────────────────────────────────────────────────────────────────────────────────────── */

const { data: post } = await useAsyncData(`blog-${route.path}`, () => queryCollection('blog').path(route.path).first());

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Post not found',
    fatal: true,
  });
}

useSeoMeta({
  title: `${post.value.title} — Jens Johnson`,
  description: post.value.description,
  ogTitle: post.value.title,
  ogDescription: post.value.description,
  ogImage: post.value.cover?.src,
});

/* ─── Formatting helpers ──────────────────────────────────────────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>

<template>
  <article v-if="post" class="bg-bg min-h-screen">
    <!-- ─── Header ────────────────────────────────────────────────────────────── -->
    <header class="border-border border-b">
      <div class="mx-auto max-w-3xl px-6 pt-20 pb-12 md:pt-28">
        <!-- Back link -->
        <NuxtLink
          to="/blog"
          class="text-caption text-ink-subtle hover:text-accent mb-8 inline-flex items-center gap-1.5 font-mono tracking-widest uppercase transition-colors"
        >
          <Icon name="lucide:arrow-left" size="13" /> All writing
        </NuxtLink>

        <!-- Meta -->
        <div class="mb-6 flex flex-wrap items-center gap-3">
          <p class="text-caption text-ink-subtle font-mono">{{ formatDate(post.publishedAt) }}</p>
          <span v-if="post.series" class="text-caption text-ink-subtle font-mono">
            · {{ post.series.name }} · Part {{ post.series.part }}
          </span>
          <span v-if="post.readingTime" class="text-caption text-ink-subtle font-mono">
            · {{ post.readingTime }} min read
          </span>
        </div>

        <!-- Title -->
        <h1 class="font-display text-h2 text-ink mb-6 leading-tight font-bold tracking-tight">
          {{ post.title }}
        </h1>

        <!-- Description -->
        <p class="font-body text-body-lg text-ink-muted mb-8 leading-relaxed">
          {{ post.description }}
        </p>

        <!-- Tags -->
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="bg-surface text-caption text-ink-muted rounded-full px-3 py-1 font-mono"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </header>

    <!-- ─── Body ──────────────────────────────────────────────────────────────── -->
    <div class="mx-auto max-w-3xl px-6 py-16">
      <div class="prose-jj">
        <ContentRenderer :value="post" />
      </div>
    </div>

    <!-- ─── Footer ────────────────────────────────────────────────────────────── -->
    <footer class="border-border bg-surface border-t">
      <div class="mx-auto max-w-3xl px-6 py-12">
        <p class="text-caption text-ink-subtle mb-4 font-mono tracking-widest uppercase">Keep reading</p>
        <NuxtLink
          to="/blog"
          class="font-display text-h5 text-ink hover:text-accent inline-flex items-center gap-1.5 font-bold transition-colors"
        >
          All writing <Icon name="lucide:arrow-right" size="15" />
        </NuxtLink>
      </div>
    </footer>
  </article>
</template>

<style scoped>
/* ─── Prose styling for rendered markdown ─────────────────────────────────────────────────────────────────────────── */

/* Custom rather than @tailwindcss/typography to keep our earth-tone tokens and Syne/Plus Jakarta type system intact. */

.prose-jj :deep(h2) {
  margin-top: 3rem;
  margin-bottom: 1.25rem;
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--color-ink);
}

.prose-jj :deep(h3) {
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  font-family: var(--font-display);
  font-size: var(--text-h4);
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-ink);
}

.prose-jj :deep(h4) {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  font-family: var(--font-display);
  font-size: var(--text-h5);
  font-weight: 700;
  color: var(--color-ink);
}

.prose-jj :deep(p) {
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
  font-family: var(--font-body);
  font-size: var(--text-body-lg);
  line-height: 1.7;
  color: var(--color-ink-muted);
}

.prose-jj :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  transition: opacity 150ms ease;
}

.prose-jj :deep(a:hover) {
  opacity: 0.7;
}

.prose-jj :deep(strong) {
  font-weight: 600;
  color: var(--color-ink);
}

.prose-jj :deep(em) {
  font-style: italic;
}

.prose-jj :deep(ul),
.prose-jj :deep(ol) {
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
  font-family: var(--font-body);
  font-size: var(--text-body-lg);
  line-height: 1.7;
  color: var(--color-ink-muted);
}

.prose-jj :deep(ul) {
  list-style-type: disc;
}

.prose-jj :deep(ol) {
  list-style-type: decimal;
}

.prose-jj :deep(li) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.prose-jj :deep(blockquote) {
  margin: 2rem 0;
  padding: 0.5rem 0 0.5rem 1.5rem;
  border-left: 3px solid var(--color-accent);
  font-style: italic;
  color: var(--color-ink);
}

.prose-jj :deep(blockquote p) {
  margin: 0;
}

.prose-jj :deep(code) {
  padding: 0.15em 0.4em;
  border-radius: 4px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--color-accent);
}

.prose-jj :deep(pre) {
  margin: 1.75rem 0;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-ink);
}

.prose-jj :deep(pre code) {
  padding: 0;
  background-color: transparent;
  border: none;
  color: inherit;
  font-size: inherit;
}

.prose-jj :deep(hr) {
  margin: 3rem 0;
  border: none;
  border-top: 1px solid var(--color-border);
}

.prose-jj :deep(img) {
  margin: 2rem 0;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  max-width: 100%;
  height: auto;
}

.prose-jj :deep(table) {
  margin: 2rem 0;
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-body);
  font-size: var(--text-body);
  color: var(--color-ink-muted);
}

.prose-jj :deep(th),
.prose-jj :deep(td) {
  padding: 0.65rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.prose-jj :deep(th) {
  font-family: var(--font-mono);
  font-size: var(--text-caption);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-ink-subtle);
  font-weight: 600;
}
</style>
