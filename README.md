<div align="center">

```
                 ██        ██                     ▄▄
                 ▀▀        ▀▀                     ██
               ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
                 ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
                 ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
                 ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
                 ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
              ████▀     ████▀
```

# jj-dev

**The personal site, portfolio, and homelab dashboard at [jens-johnson.com](https://jens-johnson.com).**

[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt&logoColor=white)](https://nuxt.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-deployed-000000?logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## Overview

jj-dev is a [Nuxt 4](https://nuxt.com) application that doubles as a portfolio and a live window into a
self-hosted homelab. Beyond the usual about / projects / writing pages, it surfaces real infrastructure:

- **Substrate**: a live topology and metrics dashboard for the homelab fleet, fed by a publisher that pushes
  telemetry to ingest endpoints (CPU, memory, uptime, reachability) and rendered as an interactive map.
- **Services**: what runs _on_ that hardware, including **Jenscraft** (a live-metrics Minecraft server card).
- **Vertifix**: an admin-only lab tool that re-uploads treadmill runs to Strava with a corrected elevation
  profile, rebuilt as a Garmin TCX file.

Long-form content (blog, projects, lab notes, device docs) is authored in Markdown and typed end-to-end through
[@nuxt/content](https://content.nuxt.com) collection schemas. The whole site ships in three themes (`day`,
`sunset`, and `night`), toggled live via a `data-theme` attribute on `<html>`.

## Tech stack

| Area       | Choice                                                                   |
| ---------- | ------------------------------------------------------------------------ |
| Framework  | Nuxt 4 (Vue 3, Nitro server)                                             |
| Styling    | Tailwind CSS v4 (CSS-first `@theme` config in `app/assets/css/main.css`) |
| Content    | @nuxt/content v3 with Zod-typed collections (`content.config.ts`)        |
| Auth       | `nuxt-auth-utils` (Google OIDC, sealed session cookie)                   |
| UI / icons | @nuxt/ui, @nuxt/icon (Iconify), @nuxt/image, @nuxt/fonts                 |
| Language   | TypeScript (strict)                                                      |
| Hosting    | Vercel (Nitro Vercel preset, prerendered content routes)                 |

## Getting started

Requires **Node 24+** and **pnpm 10.10.0** (pinned via Corepack).

```bash
corepack enable      # activates the pinned pnpm
pnpm install         # installs deps + sets up git hooks (lefthook)
pnpm dev             # http://localhost:3000
```

Environment variables (Strava, ingest secrets, Google OAuth, session password) are documented internally;
copy them into a local `.env` for features that need them. The site runs without them; those features simply
stay inert in local dev.

## Scripts

| Script           | What it does                                            |
| ---------------- | ------------------------------------------------------- |
| `pnpm dev`       | Start the dev server with HMR                           |
| `pnpm build`     | Production build                                        |
| `pnpm preview`   | Preview the production build locally                    |
| `pnpm lint`      | ESLint + Prettier + Stylelint (check only, in parallel) |
| `pnpm lint:fix`  | Autofix all three                                       |
| `pnpm typecheck` | `vue-tsc` via Nuxt                                      |
| `pnpm test`      | Vitest unit tests                                       |
| `pnpm check`     | Full local CI gate: lint → typecheck → build            |

## Architecture

Components follow an **atomic-design** hierarchy under `app/components/`, each component an `index.vue` inside
its own named folder (auto-import names track the full path, e.g. `layout/app-nav/index.vue` → `<LayoutAppNav>`):

```
components/
├── brand/          identity: logo-mark, wordmark
├── containment/    surfaces: card, bento-card
├── data/           display: status-badge, spark-line
├── feedback/       indicators: scroll-progress
├── layout/         shell: app-nav, app-footer, auth-button
├── primitives/     base behaviours: base-hero, base-parallax
└── widgets/        page sections that compose primitives (home, blog, lab)
```

Composables, utilities, server helpers, types, and shared contracts all follow a **barrel-directory** convention:
each module is a kebab-case folder with an `index.ts` re-export plus `composable`/`types`/`constants`/`utils`
files as needed:

```
app/composables/use-card-tilt/   { index, composable, types }
app/utils/substrate/service-visuals/   { index, utils, types }
app/types/services/   { index, types }
server/utils/strava/   { index, utils, types }
shared/vertifix/   { index, types }
```

## Deployment

Three permanent branches map to three environments:

| Branch    | Environment | URL                      |
| --------- | ----------- | ------------------------ |
| `main`    | Production  | jens-johnson.com         |
| `staging` | Pre-prod    | staging.jens-johnson.com |
| `feat/*`  | Preview     | per-PR Vercel preview    |

Flow: a feature branch is PR'd into `staging` for review; once it lands, an automated `staging → main`
promotion PR (with a conventional-commit changelog) ships it to production. Releases and the changelog are
managed by [Release Please](https://github.com/googleapis/release-please); commits follow
[Conventional Commits](https://www.conventionalcommits.org), enforced by commitlint.

## Conventions

Project conventions (file-header banners, comment style, the barrel pattern, commit format, and the
deployment flow) live in [`CLAUDE.md`](./CLAUDE.md). The short version:

- Every comment-supporting source file opens with the standard JJ header banner (use `/header`).
- Interfaces are prefixed `I`, type aliases `T` (Vue `Props` and external module augmentations excepted).
- Conventional Commits, lowercase subjects, scopes from the `commitlint.config.js` enum.
