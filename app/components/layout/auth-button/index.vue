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
 * █████████████████████████████████████ #components/layout/auth-button/index.vue ██████████████████████████████████████
 *
 * Nav auth control — a Sign in button when logged out, an avatar menu with sign-out when logged in.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <LayoutAuthButton /> — placed in the nav right-controls cluster, next to the theme toggle.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

const { loggedIn, user, session, clear } = useUserSession();

const menuOpen = ref(false);
const root = ref<HTMLElement | null>(null);

/* Close the account menu when clicking anywhere outside it. The toggle button lives inside
   `root`, so opening it doesn't immediately re-close via this handler. */
function onDocumentClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) {
    menuOpen.value = false;
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick));

/** Two-letter fallback for when the Google avatar is missing or fails to load. */
const initials = computed(() => {
  const parts = (user.value?.name ?? '').trim().split(/\s+/);
  return (
    parts
      .slice(0, 2)
      .map((p) => p[0] ?? '')
      .join('')
      .toUpperCase() || '?'
  );
});

/* Google avatar URLs occasionally 403; fall back to initials if the image errors. */
const avatarFailed = ref(false);

async function signOut() {
  await clear();
  menuOpen.value = false;
}
</script>

<template>
  <!-- Logged out: a plain anchor so the click is a full navigation to the server OAuth route -->
  <a
    v-if="!loggedIn"
    href="/auth/callback"
    class="border-border text-body-sm text-ink-muted hover:border-accent hover:text-accent flex h-9 items-center gap-2 rounded-full border px-3.5 font-medium transition-colors"
  >
    <Icon name="lucide:log-in" size="16" />
    <span>Sign in</span>
  </a>

  <!-- Logged in: avatar button toggles a small account menu -->
  <div v-else ref="root" class="relative">
    <button
      type="button"
      class="border-border text-body-sm text-ink-muted hover:border-accent hover:text-accent flex size-9 items-center justify-center overflow-hidden rounded-full border font-semibold transition-colors"
      :aria-label="menuOpen ? 'Close account menu' : 'Open account menu'"
      :aria-expanded="menuOpen"
      aria-haspopup="menu"
      @click="menuOpen = !menuOpen"
    >
      <img
        v-if="user?.picture && !avatarFailed"
        :src="user.picture"
        :alt="user.name"
        referrerpolicy="no-referrer"
        class="size-full object-cover"
        @error="avatarFailed = true"
      />
      <span v-else>{{ initials }}</span>
    </button>

    <Transition
      enter-active-class="transition duration-[--duration-fast] ease-out"
      enter-from-class="opacity-0 -translate-y-1 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-[--duration-fast] ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-1 scale-95"
    >
      <div
        v-if="menuOpen"
        role="menu"
        class="border-border bg-bg absolute top-11 right-0 w-60 origin-top-right rounded-lg border p-1.5 shadow-lg"
      >
        <!-- Identity -->
        <div class="flex items-center gap-3 px-2.5 py-2">
          <div
            class="border-border text-body-sm text-ink-muted flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border font-semibold"
          >
            <img
              v-if="user?.picture && !avatarFailed"
              :src="user.picture"
              :alt="user.name"
              referrerpolicy="no-referrer"
              class="size-full object-cover"
            />
            <span v-else>{{ initials }}</span>
          </div>
          <div class="min-w-0">
            <p class="text-body-sm text-ink truncate font-semibold">{{ user?.name }}</p>
            <p class="text-caption text-ink-muted truncate">{{ user?.email }}</p>
          </div>
        </div>

        <!-- Admin badge — only shown for the allow-listed account -->
        <div v-if="session?.isAdmin" class="px-2.5 pb-1">
          <span
            class="border-accent/30 bg-accent/10 text-caption text-accent inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-medium"
          >
            <Icon name="lucide:shield-check" size="12" />
            Admin
          </span>
        </div>

        <div class="bg-border my-1 h-px" />

        <!-- Sign out -->
        <button
          type="button"
          role="menuitem"
          class="text-body-sm text-ink-muted hover:bg-surface hover:text-ink flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left font-medium transition-colors"
          @click="signOut"
        >
          <Icon name="lucide:log-out" size="16" />
          Sign out
        </button>
      </div>
    </Transition>
  </div>
</template>
