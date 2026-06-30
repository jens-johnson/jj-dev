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
 * ████████████████████████████████████████████████ stylelint.config.mjs ████████████████████████████████████████████████
 *
 * Stylelint config; Tailwind v4 aware. Lints `main.css` and `<style>` blocks in `.vue` files.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * `pnpm lint:stylelint` to check, `pnpm fix:stylelint` to autofix.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue'],
  rules: {
    // Tailwind directives; don't flag.
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'layer',
          'config',
          'screen',
          'variants',
          'responsive',
          'theme',
          'utility',
          'custom-variant',
          'reference',
        ],
      },
    ],
    // OKLCH is current, well-supported.
    'color-function-notation': null,
    // Tailwind v4 uses CSS vars heavily; allow them in custom-property names.
    'custom-property-pattern': null,
    // Tailwind utilities dominate; no need to enforce class naming.
    'selector-class-pattern': null,
    // Empty `@layer base {}` blocks are fine as scaffolding.
    'block-no-empty': null,
    // Font family names like Menlo, Consolas are conventionally cased.
    'value-keyword-case': [
      'lower',
      {
        ignoreProperties: ['/font/i', 'font-family'],
        camelCaseSvgKeywords: true,
      },
    ],
    // OKLCH's third arg is hue in degrees; the spec accepts a bare number.
    'hue-degree-notation': null,
    // We group tokens by section with blank lines for readability.
    'custom-property-empty-line-before': null,
    // Tailwind v4's documented syntax is `@import 'tailwindcss';` (no url()).
    'import-notation': null,
  },
  ignoreFiles: ['.nuxt/**', '.output/**', 'node_modules/**', 'dist/**', 'coverage/**'],
};
