---
title: Building jj-dev — a portfolio that doesn't feel like a portfolio
description: >
  How I rebuilt my personal site from scratch in Nuxt 4 and Tailwind v4 — earth-tone
  design tokens, a three-theme color system, a bento About page with live metrics,
  and a CI/CD setup that promotes itself.
publishedAt: '2026-05-25'
tags: [nuxt, tailwind, design, process, devops]
series:
  name: Building jj-dev
  part: 1
---

Every few years I rebuild my personal site. Each rebuild has roughly the same arc — a burst of momentum, a stack swap, half-finished pages, and eventually a `coming soon` placeholder that quietly outlives the energy that made me start. This time I wanted to do it differently. Not differently in the "I'll finish this time, I promise" sense — differently in the sense of treating the site itself as a project worth documenting. So this is the first post in what will hopefully be a small series about that process.

## The brief I gave myself

A few constraints upfront, written down so I could come back to them when I inevitably drifted:

- **No template, no theme.** Every token — color, spacing, type — defined from scratch.
- **Three themes**, all driven by a single attribute swap on `<html>`: a warm `day`, a deeper `sunset`, and a near-black `night`. One CSS variable cascade, three moods.
- **Earthy, not corporate.** Cream, clay, sage. The opposite of the "neutral grey + electric accent" template that's been the default for the last five years.
- **Build it in public.** The repo is open from day one. Every PR is real. The site documents itself.

Most of the early decisions came from staring at color swatches in Sketch and asking whether I'd want to stare at them for an hour at a time. The answer ruled out a lot of palettes I might have shipped if I'd been moving faster.

## Design tokens first

Before I touched any Nuxt code, I spent a couple evenings establishing the design system. Tailwind v4 made this surprisingly pleasant — the entire token system lives in a single `@theme` block in `main.css`:

```css
@theme {
  --color-bg:               #F8F4EE;
  --color-surface:          #F0EBE3;
  --color-border:           #DDD0BF;
  --color-ink:              #1C140A;
  --color-accent:           #8B6534;
  --color-accent-secondary: #5E8C65;

  --font-display: 'Syne', sans-serif;
  --font-body:    'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono:    'Geist Mono', Menlo, monospace;
}
```

Every Tailwind utility (`bg-bg`, `text-ink`, `font-display`) is generated from those declarations. No config file, no JavaScript build step for tokens, no separate theme module. Just CSS variables.

The three themes are layered on top via `data-theme` selectors — `[data-theme="sunset"]` and `[data-theme="night"]` override the same semantic tokens. One ref toggle, one DOM attribute, and the whole site shifts. It feels closer to physical lighting than a "dark mode."

## Tech choices, briefly

The stack — for anyone running through the same decisions:

- **Nuxt 4** — file-based routing, auto-imports, SSR/SSG/hybrid out of the box, and Vue 3 underneath. Felt like the right balance of structure and freedom.
- **Tailwind v4** — CSS-first config is a quiet game-changer. No `tailwind.config.ts`, no transpilation of arbitrary plugin code. Faster builds, fewer moving parts.
- **Nuxt Content v3** — markdown collections with Zod schemas. The blog you're reading is just `content/blog/*.md` with a typed frontmatter shape. TypeScript types flow from the schema definition into every component that queries the collection.
- **Vercel** — hosting, preview deployments, custom domain wiring. Three environments mapped to three branches (more on that below).

The thing I kept coming back to: every tool here either eliminates a config file or replaces it with one that's much smaller. I'd rather express intent in code than in configuration.

## Component architecture — atomic, but loosely

Components live under `app/components/` in a flat-ish hierarchy that loosely follows atomic design. Each component is an `index.vue` inside its own folder:

```
components/
├── brand/          ← logo-mark, wordmark
├── containment/    ← bento-card, surfaces
├── data/           ← status-badge, etc.
├── feedback/       ← scroll-progress
├── layout/         ← app-nav, app-footer
├── primitives/     ← base-hero, base-parallax
└── widgets/        ← page sections (compose primitives)
```

Auto-imports follow the full path: `widgets/home/hero-parallax/index.vue` becomes `<WidgetsHomeHeroParallax>`. The names get long, but at this point I've decided I prefer long-and-explicit to short-and-ambiguous. I never have to grep for where a component lives.

## The About page is the site

A surprising amount of design effort went into a single page: `/about`. It's where almost every home-page CTA points, so it earned the right to be the most ambitious piece of layout work in the project.

Three things on that page I'm particularly happy with:

**A typewriter headline** that cycles through different self-descriptions — Engineer, Builder, Tinkerer, Innovationist, Designer, Skier, Sushi Enthusiast. No external dependency, just `setTimeout` and a ref. About fifty lines of code total.

**A bento grid Background section** that breaks the standard linear-text layout. Cards of different sizes, a quote panel with a subtle 3D tilt on cursor hover, and a metrics tile pulling live data from the GitHub and Strava APIs. The tilt effect is a custom composable (`useCardTilt`) that maps cursor position to a CSS transform — about thirty lines of Vue, no library.

**The live metrics card** itself fetches data server-side via `/api/metrics`, caches it for an hour in process, and renders two weekly sparklines (GitHub contributions and Strava miles) that mirror each other visually. It started as a contribution heatmap, but the heatmap was illegible on a warm earth-tone palette — every cell at low contribution levels blended into the border color. Sparklines won.

## CI/CD that promotes itself

The branch and deploy model is the part I'm most surprised by how much I enjoy. Three permanent branches map to three environments:

| Branch    | Environment | URL                          |
|-----------|-------------|------------------------------|
| `main`    | Production  | jens-johnson.com             |
| `staging` | Pre-prod    | staging.jens-johnson.com     |
| feature   | —           | Vercel preview URL (per PR)  |

Feature branches PR into `staging`. Once `staging` is ahead of `main`, a GitHub Action notices and automatically opens a `staging → main` promotion PR — with a body that lists every commit since the last release, grouped by conventional-commit type (Features / Fixes / Refactors / etc.). Merging that PR ships to prod.

Most of the workflow looks like this:

```yaml
on:
  push:
    branches: [staging]

jobs:
  promote:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check if staging has content changes vs main
        run: |
          if git diff --quiet origin/main origin/staging; then
            echo "Nothing to promote."
          else
            # ... build PR body grouped by conventional commit type
            # ... open or update promotion PR via gh CLI
          fi
```

Some of the rough edges I hit and patched along the way:

- A naive commit count check would open empty promotion PRs after the post-merge sync (the merge commit itself made `staging` "1 commit ahead" of `main` with zero content diff). Switched to `git diff --quiet`.
- The default `GITHUB_TOKEN` silently swallows downstream workflow triggers — required status checks like `Lint & Typecheck` never fired on the auto-opened PR. Fixed by switching to a fine-grained PAT.
- `release-please` runs on every push to main and now auto-generates a `CHANGELOG.md` entry for each release, pulling structured data from the same conventional commits.

The result is a workflow where I push to a feature branch, open a PR into staging, validate at staging.jens-johnson.com, and merge a button. The rest just happens.

## What's next

A short list of things I want to write about, in roughly this order:

- **Theming with CSS-first Tailwind v4.** A closer look at how `@theme` interacts with `data-theme` overrides, and the surprisingly tidy escape hatches.
- **The bento About page, in detail.** The grid, the tilt composable, the metrics API route, the sparkline math.
- **The promotion workflow, dissected.** Conventional commits, release-please, the PAT dance, what I'd do differently if this were a real team.

If any of those sound interesting before I get to them, the writing here lives at [github.com/jens-johnson/jj-dev/tree/main/content/blog](https://github.com/jens-johnson/jj-dev/tree/main/content/blog) — issues and PRs welcome.

— J
