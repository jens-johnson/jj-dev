# jj-dev — Claude Project Instructions

## File Header Convention

**Every source file that supports comment syntax must open with a header block.**
Use `/header` to add one interactively, or follow the templates below.

### Template A — Root config files (`.js` / `.ts` at project root)

Use a full `/** */` JSDoc block with the JJ ASCII logo, filename banner,
description, USAGE, and SEE sections. Copy the exact logo art from
`commitlint.config.js`. Width of the `█` separator lines is 121 chars.

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
 * ████████████████████████████████████████████████ filename.ts █████████████████████████████████████████████████████████
 *
 * One-line description of what this file does.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * How to run / invoke / configure this file. Include CLI commands or code
 * snippets where helpful.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://relevant-docs.example.com
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
```

### Template B — App source files (`.vue`, `composables/`, `pages/`, `components/`)

Use a single-line dashed banner followed by a short description block.
The banner line is exactly 81 characters wide (name + trailing `─` dashes).

```ts
// ─── ComponentOrFilename ─────────────────────────────────────────────────────
// What it does — one concise sentence.
//
// Optional second paragraph: API surface, props, emitted events, key
// implementation notes, or architectural decisions worth remembering.
//
// Usage:
//   const { foo } = useFoo()           ← for composables
//   <MyComponent :prop="val" />        ← for components
//
// See: https://relevant-docs.example.com
```

**Rules:**
- The `─── Name` banner always lands on line 1 of the `<script setup>` block
  (or line 1 of the file for plain `.ts` files).
- For `.vue` files without a script block, add `<script setup lang="ts">` above
  `<template>` and put the header inside it.
- USAGE is optional for trivial stubs; SEE is optional if no external docs exist.
- GitHub Actions `.yml` files use `#` comments with the same dashed-line style.

---

## Script Commenting Convention

Any file that **executes as a script** (shell hooks, `bin/` scripts, `.envrc`,
bash functions inside config files) must have:

1. **A Template B header** at the top (after the shebang line if present),
   using `#` comment syntax.
2. **Block comments before each logical section or function** — a `# ─── Label ───`
   dashed section header followed by one or two lines explaining what the block
   does. Not every single line needs a comment, but every distinct operation or
   grouping should be preceded by a brief explanation.

```sh
#!/bin/sh
# ─── script-name ──────────────────────────────────────────────────────────────
# What this script does — one sentence.

# ─── Step description ─────────────────────────────────────────────────────────
# What this block does and why.
some_command || exit 1
```

Apply this when **authoring or editing** any script file, even if the file
previously had no comments.

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
