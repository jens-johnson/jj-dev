// ─── nuxt.config.ts ──────────────────────────────────────────────────────────
// Main Nuxt configuration for jj-dev (jens-johnson.com).
//
// See: https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2025-05-17',

  // ─── Modules ───────────────────────────────────────────────────────────────
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
  ],

  // ─── Devtools ──────────────────────────────────────────────────────────────
  devtools: { enabled: true },

  // ─── TypeScript ────────────────────────────────────────────────────────────
  typescript: {
    strict: true,
    typeCheck: false, // run separately via `npm run typecheck`
  },

  // ─── CSS ───────────────────────────────────────────────────────────────────
  css: ['~/assets/css/main.css'],

  // ─── Fonts ─────────────────────────────────────────────────────────────────
  fonts: {
    families: [
      { name: 'Syne', weights: [400, 500, 600, 700, 800] },
      { name: 'Fraunces', weights: [400, 700] },
      { name: 'Plus Jakarta Sans', weights: [400, 500, 600, 700] },
      { name: 'Geist Mono', weights: [400, 500] },
    ],
  },

  // ─── Content ───────────────────────────────────────────────────────────────
  content: {
    build: {
      markdown: {
        highlight: {
          theme: 'github-dark',
        },
      },
    },
  },

  // ─── SEO ─────────────────────────────────────────────────────────────────
  // Individual @nuxtjs/* modules used (sitemap, robots, schema-org) rather
  // than the @nuxtjs/seo meta-package, which requires Tailwind 4.
  // OG image generation will be added when we upgrade to Tailwind 4.
  site: {
    url: 'https://jens-johnson.com',
    name: 'Jens Johnson',
    description: 'Software engineer, designer, and creator based in San Diego, CA.',
    defaultLocale: 'en',
  },

  // ─── Icon ──────────────────────────────────────────────────────────────────
  icon: {
    serverBundle: 'auto',
  },

  // ─── ESLint ────────────────────────────────────────────────────────────────
  eslint: {
    config: {
      standalone: true,
    },
  },
})
