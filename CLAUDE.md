# jj-dev; Claude Project Instructions

## File Header Convention

**Every source file that supports comment syntax must open with a header block.**
Use `/header` to add one interactively, or follow the template below.

### The JJ Logo Block Header

All files use the same full logo block header. The comment syntax varies by file type.

**For JS / TS / Vue files**; use a `/** */` block. In `.vue` files, place it inside
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

**For shell scripts, YAML, `.envrc`, `.editorconfig`, etc.** prefix every
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
- USAGE and SEE sections are optional; omit if not needed.
- 120-char line limit applies to description and section content lines (the `█` separator lines
  are a fixed-width design element and may exceed 120).
- Separator line content (`█` chars) = 117. With `*` prefix = 120 chars; with `# ` prefix = 119 chars.
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

## Git Workflow & Deployment

Three permanent branches map to three environments:

| Branch    | Environment | URL                         |
| --------- | ----------- | --------------------------- |
| `main`    | Production  | jens-johnson.com            |
| `staging` | Pre-prod    | staging.jens-johnson.com    |
| feature   | n/a         | Vercel preview URL (per PR) |

**Flow:** `feat/*` → PR into `staging` (UAT review) → auto-PR into `main` (prod).

When `staging` gets ahead of `main`, the [`promote-staging.yml`](.github/workflows/promote-staging.yml)
workflow auto-opens (or updates) a `staging → main` PR with conventional-commit-grouped changelog.
Merge it when you're ready to ship; **merge the promotion PR with a merge commit, never squash.**
Squashing re-lists every staging commit in the squash body, which Release Please re-parses on each
promotion and turns into duplicate changelog entries. A merge commit lands the original commit SHAs,
which Release Please dedupes.

After merging to `main`, sync `staging` back: `git merge main` on the staging branch.

---

## Commit Convention

Conventional Commits enforced by commitlint. Format: `type(scope): subject`

Types: `feat` `fix` `refactor` `style` `docs` `test` `chore` `ci` `perf`

Scopes: see `commitlint.config.js` for the full enum.

Subject must be **lowercase**; no PascalCase/camelCase words (rewrite to plain
English: "theme composable" not "useTheme", "hero component" not "HeroParallax").

---

## Component Architecture

Atomic design hierarchy; every component lives in a category directory under
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
`PrimitivesBaseParallax` is a scoped-slot component; wrap it around
`PrimitivesBaseHero` and destructure `{ layerStyle, markStyle, scrollY }`
from the slot to drive per-layer transforms without duplicating tracking logic.

---

## Module Structure (barrel exports)

Composables, utils, server utils, types, and shared contracts follow a barrel-directory convention. Each module
is a kebab-case folder with an `index.ts` that re-exports its public surface, plus files split by concern:

```
app/composables/use-card-tilt/        index, composable, types
app/utils/substrate/service-visuals/  index, utils, types  (constants/enums as needed)
app/types/services/                   index, types
server/utils/strava/                  index, utils, types
shared/vertifix/                      index, types
```

- Barrel `index.ts` uses `export *`. TypeScript resolves it for explicit imports, and unimport ignores `export *`
  for auto-import, so each symbol registers exactly once from its defining file (no duplicate auto-imports).
- Nested app composables/utils only auto-import because of `imports.dirs: ['composables/**', 'utils/**']` in
  `nuxt.config.ts`. Nitro scans `server/utils/**` recursively on its own.
- Every exported symbol under those trees is auto-imported globally, so keep internal helpers **unexported**;
  only the intended public API lives in (or is re-exported from) its own file.
- `server/api`, `server/routes`, and `server/plugins` keep flat filenames; Nitro routing/registration depends on them.

## Type & Interface Naming

- Interfaces are prefixed `I` (`IServiceStatusVisual`); type aliases are prefixed `T` (`TTheme`, `TVertifixStatus`).
- Exempt: Vue component `interface Props` (the Vue idiom), and interfaces that augment an external module's
  declaration; e.g. `User` / `UserSession` under `declare module '#auth-utils'`, whose names must match the
  library's to merge.

## Comments

Full guide: [.claude/context-and-memory/code-comments.md](.claude/context-and-memory/code-comments.md). Highlights:

- JSDoc (`/** */`) on interfaces, type aliases, functions, and exported constants.
- Single `/* */` line comments on interface/type members (spilling across lines to keep the 120-char limit).
- Use semicolons or a rewrite instead of em dashes; lean toward whole sentences over fragments.
- In-file section dividers: `/* ─── Name ─── */` padded to exactly 120 chars.

---

## Tech Stack

- **Nuxt 4** with Tailwind v4 CSS-first (`@theme {}` in `main.css`)
- **@nuxt/content v3**; `defineCollection` + Zod schemas in `content.config.ts`
- Three themes: `day` / `sunset` / `night` via `data-theme` on `<html>`
- `useState` must be called inside a composable function, never at module level

---

## Tooling

- **Package manager:** `pnpm 10.10.0` pinned via Corepack (`packageManager` field). First install:
  `corepack enable && pnpm install`. Lockfile is `pnpm-lock.yaml`; no `package-lock.json`.
- **Lint:** `pnpm lint` runs ESLint + Prettier + Stylelint in parallel. `pnpm lint:fix` autofixes all three.
- **Typecheck:** `pnpm typecheck` (vue-tsc via Nuxt).
- **Full local CI gate:** `pnpm check`; runs lint → typecheck → build sequentially.
- **Git hooks:** managed by [`lefthook`](./lefthook.yml), installed automatically via the `prepare` script
  on `pnpm install`. Runs lint-staged on `pre-commit`, commitlint on `commit-msg`, and `pnpm lint && pnpm typecheck`
  on `pre-push`. Bypass a single hook: `LEFTHOOK_EXCLUDE=<name> git commit`. Skip everything: `LEFTHOOK=0 git commit`.
- **Prettier owns formatting.** Don't reach for stylistic ESLint rules that fight with it; `eslint-config-prettier`
  is loaded last to neutralize conflicts. The `.prettierrc.json` file is the source of truth.
- **Stylelint** lints `main.css` and `<style>` blocks in `.vue` files. Tailwind directives are whitelisted in
  `stylelint.config.mjs`.
