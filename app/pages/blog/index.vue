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
 * ███████████████████████████████████████████████ #pages/blog/index.vue ███████████████████████████████████████████████
 *
 * Blog index — chronological listing of published writing, queried from the `blog` Nuxt Content collection.
 * Drafts are filtered out; latest post is featured at the top with the rest as a vertical list.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

useSeoMeta({
  title: 'Writing — Jens Johnson',
  description: 'Notes on craft, code, and the occasional rabbit hole. Long-form writing on building software, design systems, and the practice of engineering.',
  ogTitle: 'Writing — Jens Johnson',
  ogDescription: 'Notes on craft, code, and the occasional rabbit hole.',
});

/* ─── Data ────────────────────────────────────────────────────────────────────────────────────────────────────────── */

const { data: posts } = await useAsyncData('blog-index', () =>
  queryCollection('blog')
    .where('draft', '=', false)
    .order('publishedAt', 'DESC')
    .all(),
);

const featured = computed(() => posts.value?.[0] ?? null);
const rest = computed(() => (posts.value ?? []).slice(1));

/* ─── Formatting helpers ──────────────────────────────────────────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/* ─── Entrance animation ──────────────────────────────────────────────────────────────────────────────────────────── */

const revealed = ref(false);
onMounted(() => {
  setTimeout(() => { revealed.value = true; }, 80);
});
</script>

<template>
  <div class="min-h-screen bg-bg">

    <!-- ─── Hero ──────────────────────────────────────────────────────────────── -->
    <section class="border-b border-border">
      <div class="mx-auto max-w-6xl px-6 pb-16 pt-20 md:pt-32">
        <p
          class="mb-4 font-mono text-caption uppercase tracking-widest text-accent"
          :class="revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
          style="transition: opacity 0.5s ease, transform 0.5s ease; transition-delay: 0ms"
        >
          03 — Writing
        </p>
        <h1
          class="font-display text-h1 font-bold leading-tight tracking-tight text-ink"
          :class="revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
          style="transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1); transition-delay: 80ms"
        >
          Notes on craft.
        </h1>
        <p
          class="mt-6 max-w-2xl font-body text-body-lg leading-relaxed text-ink-muted"
          :class="revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
          style="transition: opacity 0.7s ease, transform 0.7s ease; transition-delay: 200ms"
        >
          Long-form writing on building software, design systems, and the practice of engineering.
          Occasional rabbit holes from outside the keyboard.
        </p>
      </div>
    </section>

    <!-- ─── Posts ─────────────────────────────────────────────────────────────── -->
    <section class="mx-auto max-w-6xl px-6 py-16">

      <!-- Empty state -->
      <div
        v-if="!posts || posts.length === 0"
        class="flex flex-col items-center py-24 text-center"
      >
        <p class="font-mono text-caption uppercase tracking-widest text-ink-subtle">No posts yet</p>
        <p class="mt-3 max-w-sm font-body text-body text-ink-muted">First posts are on the way.</p>
      </div>

      <template v-else>

        <!-- ─── Featured (latest) ───────────────────────────────────────────── -->
        <NuxtLink
          v-if="featured"
          :to="featured.path"
          class="group block rounded-2xl border border-border bg-surface p-8 transition-colors hover:border-accent md:p-12"
        >
          <div class="mb-6 flex flex-wrap items-center gap-3">
            <span class="rounded-full bg-accent/10 px-3 py-1 font-mono text-caption uppercase tracking-widest text-accent">
              Latest
            </span>
            <p class="font-mono text-caption text-ink-subtle">
              {{ formatDate(featured.publishedAt) }}
            </p>
            <span v-if="featured.series" class="font-mono text-caption text-ink-subtle">
              · {{ featured.series.name }} · Part {{ featured.series.part }}
            </span>
          </div>

          <h2 class="mb-4 font-display text-h3 font-bold leading-tight tracking-tight text-ink transition-colors group-hover:text-accent">
            {{ featured.title }}
          </h2>
          <p class="mb-6 max-w-3xl font-body text-body-lg leading-relaxed text-ink-muted">
            {{ featured.description }}
          </p>

          <div class="flex flex-wrap items-center gap-2">
            <span
              v-for="tag in featured.tags"
              :key="tag"
              class="rounded-full bg-bg px-3 py-1 font-mono text-caption text-ink-muted"
            >
              {{ tag }}
            </span>
          </div>

          <p class="mt-8 inline-flex items-center gap-1.5 font-mono text-caption uppercase tracking-widest text-accent">
            Read post <Icon name="lucide:arrow-right" size="13" class="transition-transform group-hover:translate-x-1" />
          </p>
        </NuxtLink>

        <!-- ─── Rest ────────────────────────────────────────────────────────── -->
        <div v-if="rest.length > 0" class="mt-16">
          <p class="mb-8 font-mono text-caption uppercase tracking-widest text-ink-subtle">More</p>

          <div class="space-y-0">
            <NuxtLink
              v-for="post in rest"
              :key="post.path"
              :to="post.path"
              class="group grid gap-4 border-t border-border py-8 transition-colors md:grid-cols-[160px_1fr] md:gap-8"
            >
              <p class="font-mono text-caption text-ink-subtle">
                {{ formatDate(post.publishedAt) }}
              </p>
              <div>
                <h3 class="mb-2 font-display text-h5 font-bold text-ink transition-colors group-hover:text-accent">
                  {{ post.title }}
                </h3>
                <p class="mb-3 max-w-3xl font-body text-body text-ink-muted">
                  {{ post.description }}
                </p>
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    v-for="tag in post.tags"
                    :key="tag"
                    class="rounded-full bg-surface px-2.5 py-0.5 font-mono text-caption text-ink-muted"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>

      </template>
    </section>

  </div>
</template>
