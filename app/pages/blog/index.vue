<script setup lang="ts">
/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                ██        ██                     ▄▄
 *                                ▀▀        ▀▀                     ██
 *                              ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                             ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * ███████████████████████████████████████████████ #pages/blog/index.vue ███████████████████████████████████████████████
 *
 * Blog index — chronological listing of published writing, queried from the `blog` Nuxt Content collection. Drafts
 * are filtered out; supports `?tag=Foo` query param for tag filtering. Latest post features at the top with the
 * rest as a vertical timeline.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

const route = useRoute();

useSeoMeta({
  title: 'Writing · Jens Johnson',
  description:
    'Notes on craft, code, and the occasional rabbit hole. Long-form writing on building software, design systems, and the practice of engineering.',
  ogTitle: 'Writing · Jens Johnson',
  ogDescription: 'Notes on craft, code, and the occasional rabbit hole.',
});

/* ─── Data ────────────────────────────────────────────────────────────────────────────────────────────────────────── */

const { data: allPosts } = await useAsyncData('blog-index', () =>
  queryCollection('blog').where('draft', '=', false).order('publishedAt', 'DESC').all(),
);

const activeTag = computed<string | null>(() => {
  const t = route.query.tag;
  return typeof t === 'string' && t.length > 0 ? t : null;
});

const filteredPosts = computed(() => {
  if (!activeTag.value) return allPosts.value ?? [];
  return (allPosts.value ?? []).filter((p) =>
    (p.tags ?? []).some((t: string) => t.toLowerCase() === activeTag.value!.toLowerCase()),
  );
});

const featured = computed(() => filteredPosts.value[0] ?? null);
const rest = computed(() => filteredPosts.value.slice(1));

/* All distinct tags across all posts, sorted alphabetically. */
const allTags = computed(() => {
  const set = new Set<string>();
  for (const post of allPosts.value ?? []) {
    for (const tag of post.tags ?? []) set.add(tag);
  }
  return Array.from(set).sort();
});

/* ─── Formatting helpers ──────────────────────────────────────────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function tagHref(tag: string) {
  return { path: '/blog', query: { tag } };
}

/* ─── Entrance animation ──────────────────────────────────────────────────────────────────────────────────────────── */

const revealed = ref(false);
onMounted(() => {
  setTimeout(() => {
    revealed.value = true;
  }, 80);
});
</script>

<template>
  <div class="bg-bg min-h-screen">
    <!-- ─── Hero ──────────────────────────────────────────────────────────────── -->
    <section class="border-border border-b">
      <div class="mx-auto max-w-6xl px-6 pt-20 pb-16 md:pt-32">
        <p
          class="text-caption text-accent mb-4 font-mono tracking-widest uppercase"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'"
          style="
            transition:
              opacity 0.5s ease,
              transform 0.5s ease;
            transition-delay: 0ms;
          "
        >
          03 · Writing
        </p>
        <h1
          class="font-display text-h1 text-ink leading-tight font-bold tracking-tight"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'"
          style="
            transition:
              opacity 0.7s ease,
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
            transition-delay: 80ms;
          "
        >
          Notes on craft.
        </h1>
        <p
          class="font-body text-body-lg text-ink-muted mt-6 max-w-2xl leading-relaxed"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'"
          style="
            transition:
              opacity 0.7s ease,
              transform 0.7s ease;
            transition-delay: 200ms;
          "
        >
          My blog: a place for ramblings about technology, baking, and 100+ other things you may or may not want to hear
          about.
        </p>

        <!-- All tags pill row -->
        <div v-if="allTags.length > 0" class="mt-8 flex flex-wrap items-center gap-2">
          <NuxtLink
            to="/blog"
            class="text-caption rounded-full border px-3 py-1 font-mono tracking-widest uppercase transition-colors"
            :class="
              !activeTag
                ? 'border-accent bg-accent text-stone-50'
                : 'border-border bg-surface text-ink-muted hover:border-accent hover:text-accent'
            "
          >
            All
          </NuxtLink>
          <NuxtLink
            v-for="tag in allTags"
            :key="tag"
            :to="tagHref(tag)"
            class="text-caption rounded-full border px-3 py-1 font-mono tracking-widest uppercase transition-colors"
            :class="
              activeTag === tag
                ? 'border-accent bg-accent text-stone-50'
                : 'border-border bg-surface text-ink-muted hover:border-accent hover:text-accent'
            "
          >
            {{ tag }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ─── Posts ─────────────────────────────────────────────────────────────── -->
    <section class="mx-auto max-w-6xl px-6 py-16">
      <!-- Filter banner -->
      <div v-if="activeTag" class="border-border bg-surface mb-10 flex items-center gap-3 rounded-xl border px-5 py-4">
        <Icon name="lucide:filter" size="16" class="text-accent" />
        <p class="font-body text-body-sm text-ink-muted">
          Showing posts tagged
          <span class="text-ink font-medium">{{ activeTag }}</span>
        </p>
        <NuxtLink
          to="/blog"
          class="text-caption text-accent ml-auto inline-flex items-center gap-1 font-mono tracking-widest uppercase hover:underline"
        >
          Clear <Icon name="lucide:x" size="11" />
        </NuxtLink>
      </div>

      <!-- Empty state -->
      <div v-if="filteredPosts.length === 0" class="flex flex-col items-center py-24 text-center">
        <p class="text-caption text-ink-subtle font-mono tracking-widest uppercase">
          {{ activeTag ? `No posts tagged ${activeTag}` : 'No posts yet' }}
        </p>
        <p class="font-body text-body text-ink-muted mt-3 max-w-sm">
          {{ activeTag ? 'Try a different tag or clear the filter.' : 'First posts are on the way.' }}
        </p>
      </div>

      <template v-else>
        <!-- ─── Featured (latest) ───────────────────────────────────────────── -->
        <article
          v-if="featured"
          class="border-border bg-surface hover:border-accent block rounded-2xl border p-8 transition-colors md:p-12"
        >
          <div class="mb-6 flex flex-wrap items-center gap-3">
            <span
              v-if="!activeTag"
              class="bg-accent/10 text-caption text-accent rounded-full px-3 py-1 font-mono tracking-widest uppercase"
            >
              Latest
            </span>
            <p class="text-caption text-ink-subtle font-mono">
              {{ formatDate(featured.publishedAt) }}
            </p>
            <span v-if="featured.series" class="text-caption text-ink-subtle font-mono">
              · {{ featured.series.name }} · Part {{ featured.series.part }}
            </span>
          </div>

          <NuxtLink :to="featured.path" class="group block">
            <h2
              class="font-display text-h3 text-ink group-hover:text-accent mb-2 leading-tight font-bold tracking-tight transition-colors"
            >
              {{ featured.title }}
            </h2>
            <p
              v-if="featured.subtitle"
              class="font-display text-h5 text-ink-muted mb-4 leading-snug font-medium italic"
            >
              {{ featured.subtitle }}
            </p>
            <p class="font-body text-body-lg text-ink-muted mb-6 max-w-3xl leading-relaxed">
              {{ featured.description }}
            </p>

            <p class="text-caption text-accent inline-flex items-center gap-1.5 font-mono tracking-widest uppercase">
              Read post
              <Icon name="lucide:arrow-right" size="13" class="transition-transform group-hover:translate-x-1" />
            </p>
          </NuxtLink>

          <div class="mt-6 flex flex-wrap items-center gap-2">
            <NuxtLink
              v-for="tag in featured.tags"
              :key="tag"
              :to="tagHref(tag)"
              class="bg-bg text-caption text-ink-muted hover:bg-accent rounded-full px-3 py-1 font-mono transition-colors hover:text-stone-50"
            >
              {{ tag }}
            </NuxtLink>
          </div>
        </article>

        <!-- ─── Rest ────────────────────────────────────────────────────────── -->
        <div v-if="rest.length > 0" class="mt-16">
          <p class="text-caption text-ink-subtle mb-8 font-mono tracking-widest uppercase">More</p>

          <div class="space-y-0">
            <article
              v-for="post in rest"
              :key="post.path"
              class="border-border grid gap-4 border-t py-8 md:grid-cols-[160px_1fr] md:gap-8"
            >
              <p class="text-caption text-ink-subtle font-mono">
                {{ formatDate(post.publishedAt) }}
              </p>
              <div>
                <NuxtLink :to="post.path" class="group block">
                  <h3 class="font-display text-h5 text-ink group-hover:text-accent mb-1 font-bold transition-colors">
                    {{ post.title }}
                  </h3>
                  <p v-if="post.subtitle" class="font-body text-body-sm text-ink-muted mb-2 italic">
                    {{ post.subtitle }}
                  </p>
                  <p class="font-body text-body text-ink-muted mb-3 max-w-3xl">
                    {{ post.description }}
                  </p>
                </NuxtLink>
                <div class="flex flex-wrap items-center gap-2">
                  <NuxtLink
                    v-for="tag in post.tags"
                    :key="tag"
                    :to="tagHref(tag)"
                    class="bg-surface text-caption text-ink-muted hover:bg-accent rounded-full px-2.5 py-0.5 font-mono transition-colors hover:text-stone-50"
                  >
                    {{ tag }}
                  </NuxtLink>
                </div>
              </div>
            </article>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>
