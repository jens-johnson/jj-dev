<script setup lang="ts">
// ─── HomeFeaturedProjects ─────────────────────────────────────────────────────
// Pulls up to 3 featured projects from the content collection and renders
// them as cards. Falls back gracefully if no featured projects exist.

const { data: projects } = await useAsyncData('featured-projects', () =>
  queryCollection('projects')
    .where('featured', '=', true)
    .where('draft', '=', false)
    .order('order', 'ASC')
    .limit(3)
    .all(),
)

/** Map status to a human-readable label + color class. */
function statusBadge(status: string) {
  return {
    active: { label: 'Active', class: 'bg-accent/10 text-accent' },
    wip: { label: 'In progress', class: 'bg-earth-300/20 text-earth-500' },
    archived: { label: 'Archived', class: 'bg-surface text-ink-subtle' },
  }[status] ?? { label: status, class: 'bg-surface text-ink-subtle' }
}
</script>

<template>
  <section class="border-t border-border">
    <div class="mx-auto max-w-6xl px-6 py-20">

      <!-- Section header -->
      <div class="mb-12 flex items-end justify-between">
        <div>
          <p class="mb-2 font-mono text-caption uppercase tracking-widest text-accent">
            Selected work
          </p>
          <h2 class="font-display text-h3 font-bold text-ink">
            Projects
          </h2>
        </div>
        <NuxtLink
          to="/projects"
          class="hidden items-center gap-1 text-body-sm font-medium text-ink-muted transition-colors hover:text-ink sm:flex"
        >
          All projects <Icon name="lucide:arrow-right" size="14" />
        </NuxtLink>
      </div>

      <!-- Project cards -->
      <ul
        v-if="projects?.length"
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
      >
        <li
          v-for="project in projects"
          :key="project.path"
        >
          <NuxtLink
            :to="project.path"
            class="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent/40 hover:bg-surface"
          >
            <!-- Status badge -->
            <span
              class="mb-4 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-caption font-medium"
              :class="statusBadge(project.status).class"
            >
              {{ statusBadge(project.status).label }}
            </span>

            <!-- Title + description -->
            <h3 class="mb-2 font-display text-h5 font-bold text-ink transition-colors group-hover:text-accent">
              {{ project.shortTitle ?? project.title }}
            </h3>
            <p class="flex-1 text-body-sm leading-relaxed text-ink-muted">
              {{ project.description }}
            </p>

            <!-- Stack pills -->
            <ul
              v-if="project.stack?.length"
              class="mt-5 flex flex-wrap gap-1.5"
              role="list"
            >
              <li
                v-for="tech in project.stack.slice(0, 4)"
                :key="tech"
                class="rounded-full border border-border px-2.5 py-0.5 font-mono text-caption text-ink-subtle"
              >
                {{ tech }}
              </li>
            </ul>

          </NuxtLink>
        </li>
      </ul>

      <!-- Empty state -->
      <p
        v-else
        class="text-body-sm text-ink-subtle"
      >
        Projects coming soon.
      </p>

      <!-- Mobile "all projects" link -->
      <NuxtLink
        to="/projects"
        class="mt-8 flex items-center gap-1 text-body-sm font-medium text-ink-muted transition-colors hover:text-ink sm:hidden"
      >
        All projects <Icon name="lucide:arrow-right" size="14" />
      </NuxtLink>

    </div>
  </section>
</template>
