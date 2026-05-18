<script setup lang="ts">
// ─── AppNav ───────────────────────────────────────────────────────────────────
// Primary site navigation. Renders the JJ wordmark on the left, nav links in
// the center, and a theme toggle on the right.

const { theme, cycleTheme } = useTheme()

const links = [
  { label: 'Work', to: '/work' },
  { label: 'Projects', to: '/projects' },
  { label: 'Blog', to: '/blog' },
  { label: 'Lab', to: '/lab' },
  { label: 'About', to: '/about' },
]

/** Icon name for the current theme — cycles to indicate what's next. */
const themeIcon = computed(() => ({
  day: 'lucide:sunset',
  sunset: 'lucide:moon',
  night: 'lucide:sun',
}[theme.value]))

const themeLabel = computed(() => ({
  day: 'Switch to Sunset theme',
  sunset: 'Switch to Night theme',
  night: 'Switch to Day theme',
}[theme.value]))
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md transition-colors duration-[--duration-theme]">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

      <!-- Wordmark -->
      <NuxtLink
        to="/"
        class="font-display text-h5 font-bold tracking-tight text-ink transition-colors hover:text-accent"
        aria-label="Jens Johnson — home"
      >
        Jens Johnson
      </NuxtLink>

      <!-- Links -->
      <ul class="hidden items-center gap-8 md:flex" role="list">
        <li v-for="link in links" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="text-body-sm font-medium text-ink-muted transition-colors hover:text-ink"
            active-class="text-ink"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>

      <!-- Theme toggle -->
      <button
        type="button"
        class="flex size-9 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:border-accent hover:text-accent"
        :aria-label="themeLabel"
        @click="cycleTheme"
      >
        <Icon :name="themeIcon" size="16" />
      </button>

    </nav>
  </header>
</template>
