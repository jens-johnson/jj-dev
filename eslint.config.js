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
 * █████████████████████████████████████████████████ eslint.config.js ██████████████████████████████████████████████████
 *
 * ESLint flat config for jj-dev. Uses @nuxt/eslint as the base, extended with @stylistic for formatting, sonarjs for
 * code quality, and import-x / simple-import-sort for consistent import ordering.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * `npm run lint` to check, `npm run lint:fix` to auto-fix. See developer documentation for m
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://eslint.nuxt.com/
 * • https://eslint.style/
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

// @ts-check

import stylisticPlugin from '@stylistic/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';
import { importX as importXPlugin } from 'eslint-plugin-import-x';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import globals from 'globals';

import withNuxt from './.nuxt/eslint.config.mjs';

/**
 * This project's ESLint config
 * @public
 * @default
 * @constant
 */
export default withNuxt(
  /**
   * ─── Global ignores ────────────────────────────────────────────────────────────────────────────────────────────────
   *
   * Files ignored globally
   */
  {
    ignores: ['.nuxt/**', '.output/**', 'node_modules/**', 'dist/**', 'coverage/**', 'public/**'],
    name: 'jj-dev/ignores',
  },

  /**
   * ─── Root config files ─────────────────────────────────────────────────────────────────────────────────────────────
   *
   * `withNuxt()` scopes the TypeScript parser to `app/**`. Root `.ts/.js` files (`nuxt.config.ts`, `eslint.config.js`,
   * `commitlint.config.js`, etc.) are outside that tsconfig project reference and are silently skipped. Setting
   * `project:false` lets the parser handle them without type-checking, enabling syntax and stylistic rules in the IDE
   * for those files.
   */
  {
    files: ['*.ts', '*.js', '*.mjs', '*.cjs', '*.cts', '*.mts'],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
    name: 'jj-dev/root-files',
  },

  /**
   * ─── Global language options ───────────────────────────────────────────────────────────────────────────────────────
   *
   * Globals to include in typings
   */
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    name: 'jj-dev/globals',
  },

  /**
   * ─── TypeScript rules ──────────────────────────────────────────────────────────────────────────────────────────────
   *
   * Typescript-specific rules
   */
  {
    name: 'jj-dev/typescript',
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'error',
    },
  },

  /**
   * ─── Stylistic ─────────────────────────────────────────────────────────────────────────────────────────────────────
   *
   * Formatting is owned by Prettier; see `.prettierrc.json`. We keep the @stylistic plugin registered for any
   * non-formatting stylistic rules that might be added later, but no formatting rules live here. The
   * `eslint-config-prettier` import at the end of this file disables any rule that conflicts with Prettier.
   * @see https://eslint.style/
   */
  {
    name: 'jj-dev/stylistic',
    plugins: {
      '@stylistic': stylisticPlugin,
    },
    rules: {},
  },

  /**
   * ─── Import ordering ───────────────────────────────────────────────────────────────────────────────────────────────
   *
   * Rules for governing imports/exports
   * @see https://github.com/un-ts/eslint-plugin-import-x
   * @see https://github.com/lydell/eslint-plugin-simple-import-sort
   */
  {
    name: 'jj-dev/imports/custom-import-specifier-plugin',
    plugins: {
      'import-x': importXPlugin,
      'simple-import-sort': simpleImportSortPlugin,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-self-import': 'error',
    },
  },

  /**
   * ─── Import specifier newline (custom plugin) ──────────────────────────────────────────────────────────────────────
   *
   * A custom plugin for enforcing newlines on imports. `@stylistic` has no built-in rule for per-specifier import
   * newlines. This inline rule enforces that every named import gets its own line whenever the braces break (which
   * `@stylistic/object-curly-newline` already forces for `ImportDeclaration: 'always'`)
   */
  {
    name: 'jj-dev/imports/custom-import-specifier-plugin',
    plugins: {
      local: {
        rules: {
          'import-specifier-newline': {
            meta: {
              fixable: 'code',
            },
            create(context) {
              return {
                ImportDeclaration(node) {
                  if (node.specifiers.length < 2) return;
                  for (let i = 0; i < node.specifiers.length - 1; i++) {
                    const curr = node.specifiers[i];
                    const next = node.specifiers[i + 1];
                    if (curr.loc.end.line === next.loc.start.line) {
                      context.report({
                        node: next,
                        message: 'Each import specifier must be on its own line.',
                        fix(fixer) {
                          const comma = context.sourceCode.getTokenAfter(curr);
                          const afterComma = context.sourceCode.getTokenAfter(comma);
                          return fixer.replaceTextRange([comma.range[0], afterComma.range[0]], ',\n  ');
                        },
                      });
                    }
                  }
                },
              };
            },
          },
        },
      },
    },
    rules: {
      // Disabled; Prettier owns import wrapping. Plugin kept registered so re-enabling is trivial if needed.
      'local/import-specifier-newline': 'off',
    },
  },

  /**
   * ─── SonarJS ───────────────────────────────────────────────────────────────────────────────────────────────────────
   *
   * SonarJS plugin configuration
   * @see https://www.npmjs.com/package/eslint-plugin-sonarjs
   */
  {
    name: 'jj-dev/sonarjs',
    plugins: {
      sonarjs: sonarjsPlugin,
    },
    rules: {
      'sonarjs/no-duplicate-string': [
        'warn',
        {
          threshold: 4,
        },
      ],
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 15],
    },
  },

  /**
   * ─── General rules ─────────────────────────────────────────────────────────────────────────────────────────────────
   *
   * General best-practice ESLint rule settings
   */
  {
    name: 'jj-dev/general',
    rules: {
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      eqeqeq: ['error', 'always'],
    },
  },

  /**
   * ─── Prettier compatibility ─────────────────────────────────────────────────────────────────────────────────────────
   *
   * Disables any ESLint rules that conflict with Prettier formatting. Must be last so it can override earlier configs.
   * Prettier owns formatting; ESLint owns code quality.
   */
  prettierConfig,
);
