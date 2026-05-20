# jj-dev — Claude Project Instructions

## File Header Convention

**Every source file that supports comment syntax must open with a header block.**
Use `/header` to add one interactively, or follow the template below.

### The JJ Logo Block Header

All files use the same full logo block header. The comment syntax varies by file type.

**For JS / TS / Vue files** — use a `/** */` block. In `.vue` files, place it inside
`<script setup lang="ts">` (add the script block above `<template>` if the file lacks one):

```js
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
 * ████████████████████████████████████████████████ #pages/index.vue █████████████████████████████████████████████████
 *
 * One-line description of what this file does.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * How to run / invoke / configure this file. Omit this section if trivial.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://relevant-docs.example.com
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
```

**For shell scripts, YAML, `.envrc`, `.env.example`, `.editorconfig`, etc.** — prefix every
header line with `# ` (or just `#` for empty logo lines):

```sh
# █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
#
#                                ██        ██                     ▄▄
# ...logo art...
#
# █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
# ████████████████████████████████████████████████████ .envrc ████████████████████████████████████████████████████████
#
# One-line description.
#
# █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
```

**Rules:**
- The filename in the banner uses the path from the project root (e.g. `.editorconfig`) OR the
  Nuxt alias-prefixed path for app source files (e.g. `#pages/index.vue`, `#components/layout/app-nav/index.vue`).
- USAGE and SEE sections are optional — omit if not needed.
- 120-char line limit applies to description and section content lines (the `█` separator lines
  are a fixed-width design element and may exceed 120).
- Separator line content (`█` chars) = 117. With ` * ` prefix = 120 chars; with `# ` prefix = 119 chars.
- Filename banner: center the filename with `floor((115 − len) / 2)` left-padding `█` chars,
  remainder on the right, total content = 117 chars.

### Section Dividers (JS / TS)

Use `/* */` block style for in-file section dividers. Width = exactly 120 chars:

```ts
/* ─── Section Name ────────────────────────────────────────────────────────────────────────────────────────────────── */
```

Formula: `/* ─── NAME ` + `─` × (103 − len(NAME)) + ` */` = 120 chars
(If inside indented code, subtract the indent from the total: e.g. 2-space indent → 118 chars of content.)

---

## Commit Convention

Conventional Commits enforced by commitlint. Format: `type(scope): subject`

Types: `feat` `fix` `refactor` `style` `docs` `test` `chore` `ci` `perf`

Scopes: see `commitlint.config.js` for the full enum.

Subject must be **lowercase** — no PascalCase/camelCase words (rewrite to plain
English: "theme composable" not "useTheme", "hero component" not "HeroParallax").

---

## Component Architecture

Atomic design hierarchy — every component lives in a category directory under
`app/components/`. Each component is an `index.vue` inside its own named folder.

```
components/
├── brand/          # identity: logo-mark, wordmark
├── containment/    # surfaces: card (as/pad props)
├── data/           # display: status-badge
├── feedback/       # indicators: scroll-progress
├── layout/         # shell: app-nav, app-footer
├── primitives/     # base behaviours: base-hero, base-parallax
└── widgets/        # page sections (compose primitives)
    └── home/       # home-specific: hero-parallax, horizontal-journey
```

Auto-import names follow full directory path:
- `brand/logo-mark/index.vue` → `<BrandLogoMark>`
- `layout/app-nav/index.vue` → `<LayoutAppNav>`
- `primitives/base-hero/index.vue` → `<PrimitivesBaseHero>`
- `primitives/base-parallax/index.vue` → `<PrimitivesBaseParallax>`
- `widgets/home/hero-parallax/index.vue` → `<WidgetsHomeHeroParallax>`
- `widgets/home/horizontal-journey/index.vue` → `<WidgetsHomeHorizontalJourney>`

**Primitive composition pattern:**
`PrimitivesBaseParallax` is a scoped-slot component — wrap it around
`PrimitivesBaseHero` and destructure `{ layerStyle, markStyle, scrollY }`
from the slot to drive per-layer transforms without duplicating tracking logic.

---

## Tech Stack

- **Nuxt 4** with Tailwind v4 CSS-first (`@theme {}` in `main.css`)
- **@nuxt/content v3** — `defineCollection` + Zod schemas in `content.config.ts`
- Three themes: `day` / `sunset` / `night` via `data-theme` on `<html>`
- `useState` must be called inside a composable function, never at module level
