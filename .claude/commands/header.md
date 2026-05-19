Add the standard jj-dev file header to the file the user specifies (or the current file in context).

**Step 1 — Identify the file type:**

- Root config (`.js` / `.ts` at project root, e.g. `nuxt.config.ts`, `eslint.config.js`): use **Template A** (full `/** */` JSDoc logo block).
- App source (`.vue`, composables, pages, components, server routes): use **Template B** (simple `// ─── Name ───` dashed banner).
- GitHub Actions `.yml`: use **Template B** adapted with `#` comment syntax.

**Step 2 — Fill in the fields:**

| Field | What to write |
|---|---|
| `filename` | Exact filename with extension, e.g. `nuxt.config.ts` |
| Description | One concise sentence: what the file *is* or *does* |
| USAGE | CLI commands, import paths, or brief usage example — omit if trivial |
| SEE | Bullet list of relevant external docs URLs — omit if none |

**Step 3 — Template A** (root config files, `/** */` block, 121-char `█` lines):

```
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
 * ████████████████████████████████████████████████ <FILENAME> ██████████████████████████████████████████████████████████
 *
 * <DESCRIPTION>
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <USAGE>
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • <URL>
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
```

**Step 4 — Template B** (source files, `//` inline comments, 81-char total banner width):

```
// ─── <Name> ──────────────────────────────────────────────────────────────────
// <DESCRIPTION>
//
// <OPTIONAL DETAIL — props, events, key notes, or usage snippet>
//
// See: <URL>   ← omit if no external docs
```

For `.vue` files: the header goes inside `<script setup lang="ts">`. If the file has no script block, add one above `<template>`.

**Step 5 — Apply the header** by editing the target file. Do not alter any existing code below the header. Confirm the change when done.
