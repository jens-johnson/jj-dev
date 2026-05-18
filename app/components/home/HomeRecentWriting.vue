<script setup lang="ts">
// ─── HomeRecentWriting ────────────────────────────────────────────────────────
// Pulls the 3 most recent non-draft blog posts and renders them as a simple
// stacked list — date, title, description.

const { data: posts } = await useAsyncData('recent-posts', () =>
  queryCollection('blog')
    .where('draft', '=', false)
    .order('publishedAt', 'DESC')
    .limit(3)
    .all(),
)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <section
    v-if="posts?.length"
    class="border-t border-border"
  >
    <div class="mx-auto max-w-6xl px-6 py-20">

      <!-- Section header -->
      <div class="mb-12 flex items-end justify-between">
        <div>
          <p class="mb-2 font-mono text-caption uppercase tracking-widest text-accent">
            Writing
          </p>
          <h2 class="font-display text-h3 font-bold text-ink">
            Recent posts
          </h2>
        </div>
        <NuxtLink
          to="/blog"
          class="hidden items-center gap-1 text-body-sm font-medium text-ink-muted transition-colors hover:text-ink sm:flex"
        >
          All posts <Icon name="lucide:arrow-right" size="14" />
        </NuxtLink>
      </div>

      <!-- Post list -->
      <ul class="divide-y divide-border" role="list">
        <li
          v-for="post in posts"
          :key="post.path"
        >
          <NuxtLink
            :to="post.path"
            class="group flex flex-col gap-1 py-7 sm:flex-row sm:items-start sm:gap-10"
          >
            <!-- Date -->
            <time
              :datetime="post.publishedAt"
              class="shrink-0 font-mono text-caption text-ink-subtle sm:w-36"
            >
              {{ formatDate(post.publishedAt) }}
            </time>

            <!-- Content -->
            <div>
              <h3 class="font-display text-h5 font-semibold text-ink transition-colors group-hover:text-accent">
                {{ post.title }}
              </h3>
              <p class="mt-1 text-body-sm leading-relaxed text-ink-muted">
                {{ post.description }}
              </p>
              <ul
                v-if="post.tags?.length"
                class="mt-3 flex flex-wrap gap-1.5"
                role="list"
              >
                <li
                  v-for="tag in post.tags.slice(0, 3)"
                  :key="tag"
                  class="rounded-full bg-surface px-2.5 py-0.5 font-mono text-caption text-ink-subtle"
                >
                  {{ tag }}
                </li>
              </ul>
            </div>
          </NuxtLink>
        </li>
      </ul>

      <!-- Mobile "all posts" link -->
      <NuxtLink
        to="/blog"
        class="mt-4 flex items-center gap-1 text-body-sm font-medium text-ink-muted transition-colors hover:text-ink sm:hidden"
      >
        All posts <Icon name="lucide:arrow-right" size="14" />
      </NuxtLink>

    </div>
  </section>
</template>
