<script setup lang="ts">
// ─── AppFooter ────────────────────────────────────────────────────────────────
// Minimal site footer. Left: copyright + colophon. Right: social links.

const year = new Date().getFullYear()

const socials = [
  { label: 'GitHub', href: 'https://github.com/jens-johnson', icon: 'lucide:github' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/jens-johnson', icon: 'lucide:linkedin' },
]
</script>

<template>
  <footer class="border-t border-border">
    <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">

      <!-- Colophon -->
      <p class="text-caption text-ink-subtle">
        © {{ year }} Jens Johnson · Built with
        <a
          href="https://nuxt.com"
          target="_blank"
          rel="noopener noreferrer"
          class="text-ink-muted transition-colors hover:text-ink"
        >Nuxt</a>
        ·
        <a
          href="https://github.com/jens-johnson/jj-dev"
          target="_blank"
          rel="noopener noreferrer"
          class="text-ink-muted transition-colors hover:text-ink"
        >Source</a>
      </p>

      <!-- Socials -->
      <ul class="flex items-center gap-4" role="list">
        <li v-for="social in socials" :key="social.href">
          <a
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="social.label"
            class="flex size-8 items-center justify-center text-ink-subtle transition-colors hover:text-ink"
          >
            <Icon :name="social.icon" size="16" />
          </a>
        </li>
      </ul>

    </div>
  </footer>
</template>
