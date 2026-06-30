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
   * App-level head metadata — favicon and touch icon links
   * @see https://nuxt.com/docs/4.x/api/nuxt-config#app
   */
  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/favicon.svg',
        },
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
      ],
    },
  },

  /**
   * The compatibility date for this version of Nuxt
   * @see https://nuxt.com/docs/4.x/api/nuxt-config#compatibilitydate
   */
  compatibilityDate: '2025-05-17',

  /**
   * Runtime config — public values are exposed to the client, private values are server-only.
   * Strava credentials are private and only accessible in server/ routes.
   * @see https://nuxt.com/docs/guide/going-further/runtime-config
   */
  runtimeConfig: {
    stravaClientId: process.env.STRAVA_CLIENT_ID,
    stravaClientSecret: process.env.STRAVA_CLIENT_SECRET,
    stravaRefreshToken: process.env.STRAVA_REFRESH_TOKEN,
    // Bearer secret the homelab publisher sends to /api/substrate/ingest. Server-only.
    substrateIngestSecret: process.env.SUBSTRATE_INGEST_SECRET,
    // Bearer secret the jenscraft LXC publisher sends to /api/services/jenscraft/ingest. Server-only.
    jenscraftIngestSecret: process.env.JENSCRAFT_INGEST_SECRET,

    /**
     * Email granted admin-level access once authenticated. Server-only — never exposed to
     * the client. The OAuth callback compares the Google account email against this value.
     * @see server/utils/auth.ts
     */
    adminEmail: process.env.ADMIN_EMAIL || 'christopher.jens.johnson@gmail.com',

    /**
     * Google OAuth credentials are intentionally NOT mapped here. Mapping them into
     * runtimeConfig bakes the secret values into the build output and only works when the env
     * var is present in the building environment's scope. Instead, the callback handler reads
     * the bare GOOGLE_OAUTH_* vars from `process.env` at request time — they resolve at runtime
     * in every Vercel environment (preview/staging/prod), mirroring the Strava route's fallback.
     * @see server/routes/auth/callback.get.ts
     */
  },

  /**
   * Component auto-import configuration. Files in `app/components/content/` are registered without the directory
   * prefix so they can override Nuxt Content / Nuxt UI's default prose components (ProseH2, ProseP, etc.) by name.
   * Files there can also serve as MDC blocks (e.g. `::goals-carousel` → `GoalsCarousel.vue`).
   * @see https://nuxt.com/docs/guide/directory-structure/components
   */
  components: [{ path: '~/components/content', pathPrefix: false }, '~/components'],

  /**
   * Auto-import scan directories. Composables and utils follow the barrel-directory convention
   * (`use-x/{index,composable,types}.ts`, `utils/<group>/<name>/{index,...}.ts`), so the default top-level-only
   * scan misses them. The recursive globs register every nested implementation file; barrel `index.ts` files use
   * `export *`, which unimport ignores, so symbols are registered exactly once (from their defining module).
   * @see https://nuxt.com/docs/api/nuxt-config#imports
   */
  imports: {
    dirs: ['composables/**', 'utils/**'],
  },

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
     * Session + OAuth helpers (Google OIDC login). Provides `useUserSession()` on the client
     * and `setUserSession` / `requireUserSession` + `defineOAuth*EventHandler` on the server.
     * @see https://github.com/atinux/nuxt-auth-utils
     */
    'nuxt-auth-utils',

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
        /* Code block syntax highlighting via Shiki. `vitesse-light` chosen for warm muted tones that read
           cleanly on the day theme's cream surface. Revisit when we wire up multi-theme highlighting. */
        highlight: {
          theme: 'vitesse-light',
        },
      },
    },
  },

  /**
   * Nitro server config.
   *
   * Prerender the content-driven routes to static HTML at build time. @nuxt/content v3 queries a SQLite database at
   * request time, and that native SQLite is not available inside Vercel's serverless functions — so server-rendered
   * content comes back empty in production (blog, projects, lab, substrate all 404 / render blank). Baking the pages
   * at build sidesteps the runtime database entirely. Live data stays dynamic: the substrate metrics and the about
   * page's Strava card are fetched client-side, so static pages still hydrate with fresh data.
   * @see https://content.nuxt.com/docs/getting-started/installation
   */
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/about', '/blog', '/projects', '/lab', '/lab/substrate', '/uses'],

      /**
       * Never prerender the auth routes. With `crawlLinks` on, the prerenderer follows the nav's
       * `<a href="/auth/callback">` sign-in link and freezes the handler's *no-code* response — a
       * redirect to Google's authorize URL — into a static file. Vercel then serves that cached
       * static file for the *real* callback too (`?code=…`), so the OAuth handler never runs, the
       * code is never exchanged, and the flow loops forever between Google's consent and
       * account-chooser screens. Ignoring `/auth` keeps the route dynamic (a per-request function)
       * so the token exchange and `setUserSession` actually execute.
       * @see server/routes/auth/callback.get.ts
       */
      ignore: ['/auth', '/lab/vertifix'],
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

  /* ─── ESLint ───────────────────────────────────────────────────────────────────────────────────────────────────── */
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
