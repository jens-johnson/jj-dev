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
 * ██████████████████████████████████████ #components/layout/app-footer/index.vue ██████████████████████████████████████
 *
 * Minimal site footer. Left: copyright and colophon. Right: social icon links.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The current year rendered in the copyright line
 * @internal
 * @constant
 */
const year: number = new Date().getFullYear();

/**
 * The social icon links rendered on the right side of the footer
 * @internal
 * @constant
 */
const socials: { label: string; href: string; icon: string }[] = [
  {
    label: 'GitHub',
    href: 'https://github.com/jens-johnson',
    icon: 'lucide:github',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/jens-johnson',
    icon: 'lucide:linkedin',
  },
];
</script>

<template>
  <footer class="border-border border-t">
    <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
      <!-- Colophon -->
      <p class="text-caption text-ink-subtle">
        © {{ year }} Jens Johnson · Built with
        <a
          href="https://nuxt.com"
          target="_blank"
          rel="noopener noreferrer"
          class="text-ink-muted hover:text-ink transition-colors"
          >Nuxt</a
        >
        ·
        <a
          href="https://github.com/jens-johnson/jj-dev"
          target="_blank"
          rel="noopener noreferrer"
          class="text-ink-muted hover:text-ink transition-colors"
          >Source</a
        >
      </p>

      <!-- Socials -->
      <ul
        class="flex items-center gap-4"
        role="list"
      >
        <li
          v-for="social in socials"
          :key="social.href"
        >
          <a
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="social.label"
            class="text-ink-subtle hover:text-ink flex size-8 items-center justify-center transition-colors"
          >
            <Icon
              :name="social.icon"
              size="16"
            />
          </a>
        </li>
      </ul>
    </div>
  </footer>
</template>
