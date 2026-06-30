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
 * ███████████████████████████████████████████ #pages/lab/vertifix/index.vue ███████████████████████████████████████████
 *
 * Admin-only Vertifix page. Gated to the admin session client-side (the real boundary is requireAdmin on the
 * API routes); hosts the upload-flow widget. Marked noindex.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
useSeoMeta({
  title: 'Vertifix · Lab · Jens Johnson',
  description: 'Internal admin tool; retroactively restore elevation gain on Strava treadmill runs.',
  robots: 'noindex, nofollow',
});

const { loggedIn, session } = useUserSession();
const isAdmin = computed(() => session.value?.isAdmin === true);
</script>

<template>
  <div class="bg-bg min-h-screen">
    <div class="mx-auto max-w-3xl px-6 pt-20 pb-24 md:pt-28">
      <NuxtLink
        to="/lab"
        class="text-body-sm text-ink-muted hover:text-accent mb-8 inline-flex items-center gap-1.5 font-medium transition-colors"
      >
        <Icon name="lucide:arrow-left" size="15" />
        Lab
      </NuxtLink>

      <!-- ─── Hero ──────────────────────────────────────────────────────────────────── -->
      <header class="mb-10">
        <div class="mb-4 flex items-center gap-3">
          <span class="text-caption text-accent font-mono tracking-widest uppercase">Vertifix</span>
          <span
            class="border-accent/30 bg-accent/10 text-caption text-accent inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-medium"
          >
            <Icon name="lucide:shield-check" size="12" />
            Admin
          </span>
        </div>
        <h1 class="font-display text-ink font-bold tracking-tight" style="font-size: clamp(2.25rem, 5vw, 3.5rem)">
          Fix treadmill elevation.
        </h1>
        <p class="font-body text-body-lg text-ink-muted mt-4 leading-relaxed">
          Treadmill runs sync from Garmin to Strava with zero vertical gain. Upload a photo of the console, match it to
          the run, and Vertifix rebuilds the activity with the right elevation.
        </p>
      </header>

      <!-- ─── Admin gate ────────────────────────────────────────────────────────────── -->
      <ContainmentCard v-if="!isAdmin" pad="lg" class="text-center">
        <span class="bg-surface text-ink-subtle mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl">
          <Icon name="lucide:lock" size="22" />
        </span>
        <h2 class="font-display text-h4 text-ink font-bold">Admins only</h2>
        <p class="font-body text-body-sm text-ink-muted mx-auto mt-2 max-w-sm">
          This is an internal tool tied to my own Strava account. There's nothing to see here without admin access.
        </p>
        <a
          v-if="!loggedIn"
          href="/auth/callback"
          class="border-border text-body-sm text-ink-muted hover:border-accent hover:text-accent mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-medium transition-colors"
        >
          <Icon name="lucide:log-in" size="15" />
          Sign in
        </a>
      </ContainmentCard>

      <!-- ─── Flow (admin only) ─────────────────────────────────────────────────────── -->
      <ClientOnly v-else>
        <WidgetsLabVertifixFlow />
      </ClientOnly>
    </div>
  </div>
</template>
