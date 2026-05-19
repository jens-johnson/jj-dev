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
 * ██████████████████████████████████████████████████ nuxt.config.ts ███████████████████████████████████████████████████
 *
 * Main Nuxt configuration for jj-dev (jens-johnson.com).
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * See developer documentation for how this file is configured.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://nuxt.com/docs/api/configuration/nuxt-config
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * This project's Nuxt configuration
 * @public
 * @default
 */
export default defineNuxtConfig({
  /**
   * The compatibility date for this version of Nuxt
   * @see https://nuxt.com/docs/4.x/api/nuxt-config#compatibilitydate
   */
  compatibilityDate: '2025-05-17',

  /**
   * Nuxt modules
   * @see https://nuxt.com/docs/4.x/api/nuxt-config#modules
   */
  modules: [
    /**
     * The Nuxt content module for CMS integration
     * @see https://content.nuxt.com/
     */
    '@nuxt/content',

    /**
     * The Nuxt ESLint module for linting
     * @see https://nuxt.com/modules/eslint
     * @see https://eslint.nuxt.com/
     */
    '@nuxt/eslint',

    /**
     * The Nuxt fonts module for vendor font integration
     * @see https://content.nuxt.com/
     */
    '@nuxt/fonts',

    /**
     * The Nuxt icon module for iconography
     * @see https://nuxt.com/modules/icon
     */
    '@nuxt/icon',

    /**
     * The Nuxt image module for optimized images
     * @see https://image.nuxt.com/
     */
    '@nuxt/image',

    /**
     * The Nuxt UI module for headless UI primitives
     * @see https://ui.nuxt.com/
     */
    '@nuxt/ui',

    /**
     * `robots.txt` configuration for Nuxt
     * @see https://nuxt.com/modules/robots
     */
    '@nuxtjs/robots',

    /**
     * XML sitemap generation
     * @see https://nuxt.com/modules/sitemap
     */
    '@nuxtjs/sitemap',

    /**
     * Tool for generating Schema.org graphs
     * @see https://nuxt.com/modules/schema-org
     */
    'nuxt-schema-org',
  ],

  /**
   * Nuxt devtools — browser panel for inspecting components, routes, and modules
   * @see https://devtools.nuxt.com/
   */
  devtools: {
    /* Enable dev tools */
    enabled: true,
  },

  /**
   * TypeScript configuration
   * @see https://nuxt.com/docs/4.x/api/nuxt-config#typescript
   */
  typescript: {
    /* Enable all strict type-checking options */
    strict: true,

    /* Run separately via `npm run typecheck` to avoid slowing HMR */
    typeCheck: false,
  },

  /**
   * Global CSS entry points — Tailwind v4 CSS-first config lives in main.css
   * @see https://nuxt.com/docs/4.x/api/nuxt-config#css
   */
  css: ['~/assets/css/main.css'],

  /**
   * @nuxt/fonts — automatic font loading and optimization
   * @see https://fonts.nuxt.com/
   */
  fonts: {
    /* Font families to use */
    families: [
      /**
       * Syne: Display + logo typography
       * @see https://fonts.google.com/specimen/Syne
       */
      {
        name: 'Syne',
        weights: [400, 500, 600, 700, 800],
      },

      /**
       * Fraunces: Editorial headings
       * @see https://fonts.google.com/specimen/Fraunces
       */
      {
        name: 'Fraunces',
        weights: [400, 700],
      },

      /**
       * Plus Jakarta Sans: Body copy + UI
       * @see https://fonts.google.com/specimen/Plus+Jakarta+Sans
       */
      {
        name: 'Plus Jakarta Sans',
        weights: [400, 500, 600, 700],
      },

      /**
       * Geist Mono: Code + labels
       * @see https://fonts.google.com/specimen/Geist+Mono
       */
      {
        name: 'Geist Mono',
        weights: [400, 500],
      },
    ],
  },

  /**
   * @nuxt/content v3 — file-based CMS for blog, projects, lab, and resume
   * @see https://content.nuxt.com/
   */
  content: {
    /* Content build settings */
    build: {
      /* Markdown settings */
      markdown: {
        /* Markdown highlighting */
        highlight: {
          /* `github-dark` theme with `shiki` theme for code blocks */
          theme: 'github-dark',
        },
      },
    },
  },

  /**
   * Site metadata used by @nuxtjs/sitemap, @nuxtjs/robots, and nuxt-schema-org
   * @see https://nuxtseo.com/site-config/getting-started/introduction
   */
  site: {
    url: 'https://jens-johnson.com',
    name: 'Jens Johnson',
    description: 'Software engineer, designer, and creator based in San Diego, CA.',
    defaultLocale: 'en',
  },

  /**
   * @nuxt/icon — icon rendering via Iconify
   * @see https://nuxt.com/modules/icon
   */
  icon: {
    /* Bundle icons server-side for SSR compatibility */
    serverBundle: 'auto',
  },

  // ─── ESLint ────────────────────────────────────────────────────────────────
  /**
   * @nuxt/eslint module integration — generates .nuxt/eslint.config.mjs
   * @see https://eslint.nuxt.com/packages/module
   */
  eslint: {
    /* Config settings */
    config: {
      /* Emit a self-contained config; we extend it in eslint.config.js */
      standalone: true,
    },
  },
});
