# Day-One Design Decisions

> These are the architectural and strategic decisions that must be made **before writing any code**. Getting these wrong early creates expensive, painful rework. This document captures each decision, the options considered, and the recommended path forward.

---

## 1. Content Architecture

**Why it's the most critical decision:** The site has several distinct content types; blog posts, project showcases, a resume, and a sandbox/recipe section. How and where that content lives dictates everything downstream: page rendering strategy, authoring workflow, API design, and CMS needs.

### Options

| Approach                          | How it works                                                                | Pros                                                       | Cons                                        |
| --------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| **Nuxt Content** (recommended)    | Markdown/MDX files in `content/` directory, queried via `queryCollection()` | Git-versioned, no CMS login, great Nuxt DX, works with SSG | Content authoring = editing files in IDE    |
| Headless CMS (Contentful, Sanity) | External CMS with API + SDK                                                 | Rich admin UI, non-dev authoring                           | Added complexity, cost, external dependency |
| MongoDB-backed                    | Dynamic content served via API routes                                       | Fully dynamic, easy to extend                              | Requires admin UI to author, more infra     |

### Recommendation

**Nuxt Content** for all editorial content (blog posts, projects, recipes). It's Git-native, versioned alongside code, and integrates natively with Nuxt's rendering pipeline. MongoDB remains available for dynamic features (contact form submissions, analytics events, etc.) if needed later; but editorial content should never require a database.

### Content Types to Define Early

- `blog/`; posts (title, date, tags, slug, cover image, body MDX)
- `projects/`; showcase entries (name, description, tech stack, links, images, status)
- `lab/`; sandbox entries (flexible schema; can include recipes, experiments, etc.)
- `resume/`; structured YAML or JSON (experience, skills, education)

---

## 2. Hosting & Infrastructure

**Why it matters on Day 1:** Hosting choice shapes CI/CD pipeline design, server route strategy, environment architecture, and cost structure. Migrating hosting later is painful.

### Options

| Platform                         | Nuxt support   | Complexity | Cost               | Best for                            |
| -------------------------------- | -------------- | ---------- | ------------------ | ----------------------------------- |
| **Vercel** (recommended)         | First-class    | Very low   | Free tier generous | Nuxt SSR/SSG, preview deploys, edge |
| AWS (Amplify or CloudFront + S3) | Good (Amplify) | High       | Pay-per-use        | Full AWS ecosystem control          |
| Netlify                          | Good           | Low        | Free tier          | Similar to Vercel                   |

### Recommendation

**Vercel** for the Nuxt application. Reasons:

- Zero-config Nuxt deployment (no `output: 'static'` required, SSR just works)
- Automatic preview deployments per PR; essential for design review workflow
- Globally distributed edge network
- GitHub integration built-in
- Free tier is sufficient for a personal site

**MongoDB Atlas** for database (if/when needed). Free M0 tier, no server to manage.

AWS remains available for future additions (Lambda functions, S3 media storage, CloudWatch monitoring) but should not host the primary Nuxt app.

---

## 3. Visual Design System (Before Any CSS)

**Why it matters:** Writing Tailwind classes before a design system is defined creates inconsistent, impossible-to-refactor styles. The design token layer must come first.

### What Needs to Be Locked In

1. **Color palette**; primary, secondary, accent, neutral, semantic (success/error/warning). These map directly to `tailwind.config.js` theme extensions.
2. **Typography**; font families (heading vs. body), scale (`text-sm` through `text-5xl`), weights
3. **Spacing scale**; whether to extend Tailwind defaults or customize
4. **Border radius, shadows, transitions**; consistent tokens for UI components

### Aesthetic Direction

_Earthy · Nature · Modern · Technological · Cali laid-back_

This needs to be translated into concrete values in Sketch before a single `className` is written. Think: muted earth tones, natural textures, clean whitespace, subtle tech-forward details.

### Deliverable

A Sketch mood board and color/typography spec that becomes the source of truth for `tailwind.config.js`. This is Phase 1 design work.

---

## 4. Information Architecture (URL Structure)

**Why it matters:** URLs get indexed, shared, and linked. Changing them later requires 301 redirects, SEO re-indexing, and broken external links.

### Route Structure

```
/; Landing / home
/about; Personal bio, story, interests
/work; Professional experience (resume equivalent)
/projects; Side project showcase
/blog; Writing (blog posts)
/lab; Sandbox: recipes, experiments, random things
/uses; Tools, gear, setup
```

---

## 5. Monorepo vs. Single App

**Why it matters:** Restructuring a Nuxt app into an Nx monorepo mid-project is a significant, disruptive change.

### Context

All reference projects (LatticeCraft, FWB API, PES, CPTL) use Nx monorepos. However, those serve multiple apps and shared packages with clear boundaries.

### Analysis

| Scenario                               | Right choice           |
| -------------------------------------- | ---------------------- |
| One Nuxt app, server routes handle API | Single Nuxt app, no Nx |
| Nuxt app + separate admin app          | Nx monorepo            |
| Nuxt app + shared npm package          | Nx monorepo            |

### Recommendation

**Start as a single Nuxt app** (no Nx). The site is one app; server routes within Nuxt handle any backend needs. Add Nx only if a clear second app emerges (e.g., an admin panel). Avoid premature complexity.

---

## 6. Authentication & Admin

**Why it matters:** If content is authored through a UI, auth is required. If content is markdown in the repo, auth is never needed. This is a binary fork.

### Decision Tree

```
Content in Nuxt Content (markdown)  →  No auth needed
Content in MongoDB via admin UI     →  Auth required (Nuxt Auth, AWS Cognito, etc.)
```

### Recommendation

Commit to **Nuxt Content** (Decision 1 above). This eliminates the need for auth entirely in Phase 1. The authoring workflow is: edit `.md` file → commit → push → auto-deploy. No admin panel.

Auth can be revisited in a later phase if dynamic features (like a public comment system) are added.

---

## 7. Component Library Strategy

**Why it matters:** Mixing component libraries mid-project creates styling conflicts and inconsistency. The pattern needs to be defined upfront.

### Options

| Approach                             | Pros                                          | Cons                                              |
| ------------------------------------ | --------------------------------------------- | ------------------------------------------------- |
| Tailwind-only                        | Maximum control, zero conflicts               | More hand-built components                        |
| **Nuxt UI + Tailwind** (recommended) | Built for Nuxt, Tailwind-native, excellent DX | Opinionated component API                         |
| Vuetify                              | Feature-rich                                  | Conflicts with Tailwind, heavy, hard to customize |
| shadcn-vue                           | Composable, copy-paste                        | Less mature ecosystem than Nuxt UI                |

### Recommendation

**Tailwind-only for layout and custom components; Nuxt UI for complex interactive components** (modals, dropdowns, toasts, etc.). Nuxt UI is built specifically for Nuxt, uses Tailwind under the hood, and is highly customizable via design tokens. Avoid Vuetify entirely; it conflicts philosophically with Tailwind.

---

## 8. SEO & Metadata Strategy

**Why it matters:** SEO foundations are much easier to build in than to retrofit. Missing OG tags, sitemaps, or structured data from the start means manual cleanup later.

### Foundations to Define Early

- `useSeoMeta()` / `useHead()` composable patterns; per page and globally
- **OG image strategy**; static per-page images (simplest) vs. dynamically generated (edge function renders image with page metadata)
- **Sitemap**; `@nuxtjs/sitemap` module, auto-generated
- **Robots.txt**; define crawl rules
- **Structured data**; `Person` schema for about/home, `Article` schema for blog posts, `BreadcrumbList` for navigation

### Recommendation

Use `nuxt-seo` (or `@nuxtjs/seo` suite) which bundles sitemap, robots, OG, and structured data in one place. Define a site-wide SEO config in `nuxt.config.ts` and per-page overrides via composables.

---

## Summary: Decision Matrix

| Decision                 | Confirmed Path                            | Status       |
| ------------------------ | ----------------------------------------- | ------------ |
| Content architecture     | Nuxt Content (markdown-in-repo)           | ✅ Confirmed |
| Hosting                  | Vercel + MongoDB Atlas                    | ✅ Confirmed |
| Design system            | Sketch → Tailwind tokens                  | ✅ Complete  |
| Information architecture | `/about /work /projects /blog /lab /uses` | ✅ Confirmed |
| Monorepo                 | Single Nuxt app (no Nx for now)           | ✅ Confirmed |
| Authentication           | None in Phase 1 (markdown content flow)   | ✅ Confirmed |
| Component library        | Tailwind + Nuxt UI for complex components | ✅ Confirmed |
| SEO strategy             | `@nuxtjs/seo` suite, define early         | ✅ Confirmed |

---

_Last updated: 2026-05-17; All decisions confirmed. Design system complete. Ready to scaffold._
