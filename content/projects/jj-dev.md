---
title: jj-dev
shortTitle: jj-dev
description: >
  My personal portfolio and writing space — designed and built from scratch with
  Nuxt 4, Tailwind v4, and a three-theme design token system.
publishedAt: '2025-10-15'
status: active
year:
  from: 2025
featured: true
order: 1
tags: [nuxt, vue, tailwind, design-systems, open-source]
stack: [Nuxt 4, Vue 3, Tailwind v4, TypeScript, Vercel]
links:
  live: https://jens-johnson.com
  github: https://github.com/jens-johnson/jj-dev
cover:
  src: /images/projects/jj-dev/cover.jpg
  alt: The jj-dev homepage in Day theme showing the hero section
---

A personal portfolio that doesn't feel like a portfolio — more like a place I'd actually want to spend time.

## What I built

jj-dev is a statically generated site with server-side rendering via Nitro, deployed to Vercel on every commit. The design system is built entirely in CSS using Tailwind v4's `@theme` block, with three hand-crafted themes (Day, Sunset, Night) that switch via a single `data-theme` attribute.

## What I learned

Tailwind v4's CSS-first approach is genuinely different from v3 — and better suited to design-token-heavy systems like this one.
