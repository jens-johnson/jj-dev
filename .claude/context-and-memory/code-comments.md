# Claude Context and Memory: Code Comments

## Introduction

Code comments are used several places throughout this project. We want to enforce a consistent, clean, readable, and
descriptive code comment pattern and style to keep source modules robust. This document will outline some of the ways
that code comments are used throughout a file. Feel free to update this document as needed to add context.

## Some General Notes About Code Comments

### Line Length

120 characters is set as the default max line length for this project through `.editorconfig`. Some comments are prone
to break this (i.e. a single line with a URL exceeding 120 characters), but in general it should be followed as closely
as possible, including splitting comments into multiple lines when needed.

### Header Blocks

You have a header skill written for this (we will discuss in chat), but it needs to be slightly tweaked. In general,
headers for any file in the project should look like:

```text
█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████

                               ██        ██                     ▄▄
                               ▀▀        ▀▀                     ██
                             ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
                               ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
                               ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
                               ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
                               ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
                            ████▀     ████▀

█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
█████████████████████████████████████████████████ path/to/file ██████████████████████████████████████████████████████

<A description of the file>

─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────

<Optional usage information for the file; omit this section if not needed>

─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────

<Optional links for the file; omit this section if not needed>

• <link-1>
• <link-2>

█████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
```

Some notes about this header:

- The `path/to/file` usually references the path from the project root to the file (i.e. `.editorconfig` or
  `bin/build.sh`).
  - However, if a file represents a path included under an alias represented in the tsconfig, make sure to prefix the
    path with its corresponding alias
    - i.e. we have `#components` map to `app/components` (set through Nuxt), so instead of
      `app/components/button/index.vue`, you'd write `#components/button/index.vue` and so forth
- As mentioned, the `See` and `Usage` sections are optional
  - If you feel that there is another section (not see or usage) that is applicable for a given header, feel free to
    add it and update your memory
- Please ensure to follow the 120 char line limit with each line in the header block (including comment characters and
  spaces)
- In files that use a `#` as the comment character:
  - Each header comment line should be prefixed with `#` + a space, i.e. `# ██████...`
- In ts/js files:
  - Use the block `/***/` comment to create the header; we're already doing this most places
- In vue files:
  - Prefer a `<script lang="ts">` tag at the top of the file with the header block as a TS style comment
- In HTML/non-vue
  - Use the `<!---->` HTML comment block, or another one if there is a better one
- This means that the existing variant B in the header command is likely obsolete now, all files should be able to use
  variant A

## What Files Are Applicable For Code Comments?

Any file in this project, whether in the root, a source module, a `bin/` script, a `.github/` hook that allows for c
comments (either via `#`, `//`, `/**/`, `<!--->`, etc.) is applicable for having code comments.

## Section Dividers

- Many code files will have a logical grouping of lines within the source code, i.e. constant definitions, functions,
  etc.
- We will slowly work together on building out the section divider convention (i.e. what nomenclature to use), but for
  now, you have liberty on how sections are organized
  - Vue files are a special area here. We implemented a pattern in Cut Portal/LatticeCraft that I would like to follow
    (i.e. imports, constants, slots, and so on) so please refer to those projects
- Section dividers should have the format: `─── section-name ───────────...`, where the line (with comment characters
  and spaces) fits to exactly 120 chars
- In JS/TS files:
  - Prefer `/* ─── section-name ───────────... */` over `// ─── section-name ───────────...`

## General Code Comments

- The code in this project should also be as unambiguous and descriptive as possible.
- In any source code file, try to ensure that any block of logic has a comment above it describing what it does
  - In JS/TS files:
    - Prefer the `// <comment>` style, breaking into multilines if needed to respect the 120 char rule
- This is obviously a very "subjective" matter, so lean towards verbosity when unsure. We can work together on building
  out the context, skill, and memory for this

## Other Notes

- Use JSDoc with verbosity where available
- If you feel a file needs even more documentation than can be provided in code comments, you can feel free to create
  an associated doc in `docs/` or in a `.md` alongside the file for support
- Make sure to lint and test when comments are added for extra safety
