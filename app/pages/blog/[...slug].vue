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
 * Blog post detail; renders a single markdown post from the `blog` Nuxt Content collection. The catch-all slug
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
  title: `${post.value.title} · Jens Johnson`,
  description: post.value.description,
  ogTitle: post.value.title,
  ogDescription: post.value.description,
  ogImage: post.value.cover?.src,
});

/* ─── Table of contents ───────────────────────────────────────────────────────────────────────────────────────────── */

/** Flat list of h2 headings extracted from the rendered body, used for the sidebar TOC. */
const toc = computed<{ id: string; text: string }[]>(() => {
  const links = post.value?.body?.toc?.links ?? [];
  return links.map((link: { id: string; text: string }) => ({
    id: link.id,
    text: link.text,
  }));
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
    <header class="border-border relative overflow-hidden border-b">
      <WidgetsBlogHeaderAnimation />
      <div class="relative mx-auto max-w-3xl px-6 pt-20 pb-12 md:pt-28">
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
        <h1 class="font-display text-h2 text-ink mb-3 leading-tight font-bold tracking-tight">
          {{ post.title }}
        </h1>

        <!-- Subtitle -->
        <p v-if="post.subtitle" class="font-display text-h5 text-ink-muted mb-6 leading-snug font-medium italic">
          {{ post.subtitle }}
        </p>

        <!-- Description -->
        <p class="font-body text-body-lg text-ink-muted mb-8 leading-relaxed">
          {{ post.description }}
        </p>

        <!-- Tags (clickable → filtered blog index) -->
        <div class="flex flex-wrap items-center gap-2">
          <NuxtLink
            v-for="tag in post.tags"
            :key="tag"
            :to="{ path: '/blog', query: { tag } }"
            class="bg-surface text-caption text-ink-muted hover:bg-accent rounded-full px-3 py-1 font-mono transition-colors hover:text-stone-50"
          >
            {{ tag }}
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- ─── Body ──────────────────────────────────────────────────────────────── -->
    <div class="mx-auto max-w-6xl px-6 py-16">
      <div class="lg:grid lg:grid-cols-[1fr_220px] lg:gap-16">
        <!-- Main column: rendered markdown -->
        <article class="prose-jj max-w-[68ch] min-w-0">
          <ContentRenderer :value="post" />
        </article>

        <!-- TOC sidebar (desktop only) -->
        <aside v-if="toc.length > 0" class="hidden lg:block">
          <div class="sticky top-24">
            <p class="text-caption text-ink-subtle mb-5 font-mono tracking-widest uppercase">In this piece</p>
            <ol class="space-y-3">
              <li v-for="(link, i) in toc" :key="link.id" class="flex gap-3">
                <span class="text-caption text-ink-subtle/60 mt-0.5 shrink-0 font-mono leading-snug">
                  {{ String(i + 1).padStart(2, '0') }}
                </span>
                <a
                  :href="`#${link.id}`"
                  class="font-body text-body-sm text-ink-muted hover:text-accent leading-snug transition-colors"
                >
                  {{ link.text }}
                </a>
              </li>
            </ol>
          </div>
        </aside>
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

.prose-jj {
  counter-reset: section;
}

/* ─── Headings ─────────────────────────────────────────────────────────────────────────────────────────────────── */

.prose-jj :deep(h2),
.prose-jj :deep(h3),
.prose-jj :deep(h4) {
  position: relative;
  color: var(--color-ink);
  scroll-margin-top: 5rem;
}

.prose-jj :deep(h2) {
  counter-increment: section;
  margin-top: 4rem;
  margin-bottom: 1.5rem;
  padding-top: 2.5rem;
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;
  border-top: 1px solid var(--color-border);
}

/* Auto-numbered section badge above each h2. First h2 keeps the number but loses the top border. */
.prose-jj :deep(h2)::before {
  content: counter(section, decimal-leading-zero);
  display: block;
  margin-bottom: 0.75rem;
  font-family: var(--font-mono);
  font-size: var(--text-caption);
  font-weight: 500;
  color: var(--color-accent);
  letter-spacing: 0.2em;
}

.prose-jj :deep(h2:first-of-type) {
  margin-top: 2rem;
  padding-top: 0;
  border-top: none;
}

.prose-jj :deep(h3) {
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  font-family: var(--font-display);
  font-size: var(--text-h4);
  font-weight: 700;
  line-height: 1.3;
}

.prose-jj :deep(h4) {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  font-family: var(--font-display);
  font-size: var(--text-h5);
  font-weight: 700;
}

/* Nuxt Content auto-injects an anchor link into each heading for deep-linking. Hide the visible `#` glyph and
   position the link offscreen-style so it doesn't bleed into the heading text on hover. Hover reveals a subtle
   muted `#` in the left margin instead. */
.prose-jj :deep(h2 > a),
.prose-jj :deep(h3 > a),
.prose-jj :deep(h4 > a) {
  position: absolute;
  left: -1.25em;
  top: 0;
  font-size: 0.8em;
  line-height: inherit;
  color: var(--color-ink-subtle);
  text-decoration: none;
  opacity: 0;
  transition: opacity 200ms ease;
  font-weight: 400;
}

.prose-jj :deep(h2:hover > a),
.prose-jj :deep(h3:hover > a),
.prose-jj :deep(h4:hover > a) {
  opacity: 0.6;
}

.prose-jj :deep(h2 > a:hover),
.prose-jj :deep(h3 > a:hover),
.prose-jj :deep(h4 > a:hover) {
  opacity: 1;
  color: var(--color-accent);
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

/* ─── Pull-quote (rendered blockquote) ───────────────────────────────────────────────────────────────────────────── */

.prose-jj :deep(blockquote) {
  position: relative;
  margin: 2.5rem 0;
  padding: 1.5rem 1.75rem 1.5rem 2rem;
  background-color: color-mix(in oklch, var(--color-accent) 6%, var(--color-bg));
  border-left: 3px solid var(--color-accent);
  border-radius: 0 12px 12px 0;
  font-family: var(--font-display);
  font-size: var(--text-h5);
  font-style: italic;
  font-weight: 500;
  line-height: 1.45;
  color: var(--color-ink);
}

.prose-jj :deep(blockquote)::before {
  content: '"';
  position: absolute;
  top: -0.15em;
  left: 0.5rem;
  font-family: var(--font-display);
  font-size: 4rem;
  line-height: 1;
  color: var(--color-accent);
  opacity: 0.25;
  pointer-events: none;
}

.prose-jj :deep(blockquote p) {
  margin: 0;
  font-size: inherit;
  font-family: inherit;
  color: inherit;
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

/* ─── Code blocks ───────────────────────────────────────────────────────────────────────────────────────────────── */

/* ProsePre wraps the <pre> in a `.prose-pre` div. Border + rounding live on the WRAPPER only; the inner <pre>
   is transparent so there's no double-border effect. */

.prose-jj :deep(.prose-pre) {
  position: relative;
  margin: 1.75rem 0;
  border-radius: 12px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.prose-jj :deep(.prose-pre pre),
.prose-jj :deep(pre) {
  position: relative;
  margin: 0;
  padding: 2.5rem 1.5rem 1.25rem;
  background-color: transparent;
  border: none;
  border-radius: 0;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-ink);
}

/* Bare <pre> blocks not wrapped by ProsePre (rare; fallback) keep their own border. */
.prose-jj :deep(pre:not(.prose-pre pre)) {
  margin: 1.75rem 0;
  border-radius: 12px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
}

/* Language label in the top-left of every code block (from Nuxt Content's data-language attr). */
.prose-jj :deep(.prose-pre pre[data-language])::before,
.prose-jj :deep(pre[data-language]:not(.prose-pre pre))::before {
  content: attr(data-language);
  position: absolute;
  top: 0.6rem;
  left: 0.9rem;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background-color: color-mix(in oklch, var(--color-accent) 12%, var(--color-bg));
  font-family: var(--font-mono);
  font-size: 0.625rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  pointer-events: none;
}

.prose-jj :deep(pre code) {
  padding: 0;
  background-color: transparent;
  border: none;
  color: inherit;
  font-size: inherit;
}

/* Copy-to-clipboard button (top-right of code block). Default placement clips against the rounded corner; pad it
   in and give it a proper hit target. Hidden until the block is hovered to keep the prose calm. */
.prose-jj :deep(.prose-pre button),
.prose-jj :deep(pre + button),
.prose-jj :deep(.prose-pre-copy) {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.4rem;
  border-radius: 6px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-ink-muted);
  opacity: 0;
  transition:
    opacity 150ms ease,
    color 150ms ease,
    border-color 150ms ease;
  cursor: pointer;
  z-index: 1;
}

.prose-jj :deep(.prose-pre:hover button),
.prose-jj :deep(pre:hover + button),
.prose-jj :deep(.prose-pre:hover .prose-pre-copy) {
  opacity: 1;
}

.prose-jj :deep(.prose-pre button:hover),
.prose-jj :deep(pre + button:hover),
.prose-jj :deep(.prose-pre-copy:hover) {
  color: var(--color-accent);
  border-color: var(--color-accent);
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
