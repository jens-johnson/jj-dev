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
 * ███████████████████████████████████████ #components/layout/app-nav/index.vue ████████████████████████████████████████
 *
 * Primary site navigation. Logo mark + wordmark on the left, links in the center, theme toggle on the right.
 * Collapses to a hamburger menu on mobile with an animated slide-down panel.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <LayoutAppNav />; placed once in the root layout, above <slot />.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

const { theme, cycleTheme } = useTheme();
const route = useRoute();

const menuOpen = ref(false);

const links = [
  {
    label: 'Projects',
    to: '/projects',
  },
  {
    label: 'Blog',
    to: '/blog',
  },
  {
    label: 'Lab',
    to: '/lab',
  },
  {
    label: 'About',
    to: '/about',
  },
];

/* ─── Theme toggle ────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Icon hints at the *next* theme; what you'll switch to. */
const themeIcon = computed(
  () =>
    ({
      day: 'lucide:sunset',
      sunset: 'lucide:moon',
      night: 'lucide:sun',
    })[theme.value],
);

const themeLabel = computed(
  () =>
    ({
      day: 'Switch to Sunset theme',
      sunset: 'Switch to Night theme',
      night: 'Switch to Day theme',
    })[theme.value],
);

/* ─── Mobile menu ─────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Close the menu whenever the route changes (link tapped). */
watch(
  () => route.path,
  () => {
    menuOpen.value = false;
  },
);
</script>

<template>
  <header
    class="border-border bg-bg/80 sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-[--duration-theme]"
  >
    <!-- ─── Main bar ─────────────────────────────────────────────────────────── -->
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <!-- Logo mark + wordmark -->
      <NuxtLink
        to="/"
        class="text-ink hover:text-accent flex items-center gap-2.5 transition-colors"
        aria-label="Jens Johnson, home"
      >
        <BrandLogoMark class="size-7 shrink-0" />
        <span class="font-display text-h5 font-bold tracking-tight">Jens Johnson</span>
      </NuxtLink>

      <!-- Desktop links -->
      <ul class="hidden items-center gap-8 md:flex" role="list">
        <li v-for="link in links" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="text-body-sm text-ink-muted hover:text-ink relative font-medium transition-colors"
            active-class="text-ink"
          >
            {{ link.label }}
            <!-- Active underline dot -->
            <span
              v-if="route.path.startsWith(link.to)"
              class="bg-accent absolute -bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full"
              aria-hidden="true"
            />
          </NuxtLink>
        </li>
      </ul>

      <!-- Right controls -->
      <div class="flex items-center gap-2">
        <!-- Theme toggle -->
        <button
          type="button"
          class="border-border text-ink-muted hover:border-accent hover:text-accent flex size-9 items-center justify-center rounded-full border transition-colors"
          :aria-label="themeLabel"
          @click="cycleTheme"
        >
          <Icon :name="themeIcon" size="16" />
        </button>

        <!-- Auth (Sign in / account menu) -->
        <LayoutAuthButton />

        <!-- Hamburger (mobile only) -->
        <button
          type="button"
          class="border-border text-ink-muted hover:border-accent hover:text-accent flex size-9 items-center justify-center rounded-full border transition-colors md:hidden"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <Icon :name="menuOpen ? 'lucide:x' : 'lucide:menu'" size="16" />
        </button>
      </div>
    </nav>

    <!-- ─── Mobile menu panel ────────────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition duration-[--duration] ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-[--duration-fast] ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="menuOpen" class="border-border border-t md:hidden">
        <ul class="mx-auto max-w-6xl space-y-1 px-6 py-3" role="list">
          <li v-for="link in links" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="text-body text-ink-muted hover:bg-surface hover:text-ink block rounded-md px-3 py-2.5 font-medium transition-colors"
              active-class="bg-surface text-ink"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </Transition>
  </header>
</template>
