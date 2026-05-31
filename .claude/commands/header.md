Add the standard jj-dev file header to the file the user specifies (or the current file in context).

**Step 1 — Identify the file type:**

All files use the same JJ logo block header. Only the comment syntax changes:

| File type                                                  | Comment style    | Prefix                                |
| ---------------------------------------------------------- | ---------------- | ------------------------------------- |
| `.ts`, `.js`, `.vue`                                       | `/** */` block   | `*` per line                          |
| `.sh`, `.yml`, `.yaml`, `.envrc`, `.editorconfig`, `.env*` | `#` comments     | `# ` per line (empty logo lines: `#`) |
| `.html`                                                    | `<!-- -->` block | use `<!--` / `-->` wrapping           |

For `.vue` files: header goes inside `<script setup lang="ts">`. If no script block exists,
add `<script setup lang="ts">` above `<template>` and put the header inside it.

**Step 2 — Determine the filename banner path:**

- Root-level files: use the filename as-is (e.g. `.editorconfig`, `nuxt.config.ts`)
- App source files under `app/`: use the Nuxt alias prefix instead of `app/`:
  - `app/pages/…` → `#pages/…`
  - `app/components/…` → `#components/…`
  - `app/layouts/…` → `#layouts/…`
  - `app/composables/…` → `#composables/…`
- Other paths: use path from project root (e.g. `.github/workflows/ci.yml`)

**Step 3 — Compute the filename banner padding:**

The separator bar has 117 `█` chars (total line = 120 chars with `*`, or 119 with `# `).
Filename banner formula:

- `filename_block` = `filename` (filename + 1 space on each side) = len + 2 chars
- `left_pad` = `floor((117 − len − 2) / 2)` `█` chars
- `right_pad` = `117 − len − 2 − left_pad` `█` chars

**Step 4 — Fill in optional sections:**

| Section     | When to include                                                                   |
| ----------- | --------------------------------------------------------------------------------- |
| `─── USAGE` | When the file has a non-obvious API (composables, components with slots, scripts) |
| `─── SEE`   | When there are relevant external docs worth linking                               |

Omit sections that aren't useful. Additional sections (e.g. `─── PROPS`, `─── EVENTS`) are
allowed if they add clarity — update `.claude/context-and-memory/code-comments.md` when adding new ones.

**Step 5 — Template (JS / TS / Vue, `/** \*/` style, 120-char lines):\*\*

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
 * <LEFT_PAD> <FILENAME> <RIGHT_PAD>
 *
 * <DESCRIPTION>
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <USAGE — omit section if not needed>
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • <URL — omit section if not needed>
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
```

**Step 6 — Template (`#` style, 119-char lines):**

Same structure but prefix every line with `# ` and empty lines with just `#`.

**Step 7 — Apply the header** by editing the target file. Replace any existing old-style
`// ─── Name ───` banner or previous `/** */` header. Do not alter code below the header.
Confirm the change when done.
