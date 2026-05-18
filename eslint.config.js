// ─── eslint.config.js ────────────────────────────────────────────────────────
// ESLint flat config for jj-dev. Uses @nuxt/eslint as the base, extended with
// @stylistic for formatting, sonarjs for code quality, and import-x / simple-
// import-sort for consistent import ordering.
//
// Run:  npm run lint
// Fix:  npm run lint:fix
//
// See: https://eslint.nuxt.com/
// See: https://eslint.style/

// @ts-check

import stylisticPlugin from '@stylistic/eslint-plugin'
import { importX as importXPlugin } from 'eslint-plugin-import-x'
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort'
import sonarjsPlugin from 'eslint-plugin-sonarjs'
import globals from 'globals'
import typescriptEslint from 'typescript-eslint'

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // ─── Global ignores ──────────────────────────────────────────────────────
  {
    ignores: [
      '.nuxt/**',
      '.output/**',
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'public/**',
    ],
  },

  // ─── Global language options ─────────────────────────────────────────────
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
  },

  // ─── TypeScript rules ────────────────────────────────────────────────────
  // @nuxt/eslint sets up typescript-eslint in its own config scope. We need
  // to re-register the plugin in our own config object to add custom rules.
  {
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'error',
    },
  },

  // ─── Stylistic (formatting) ───────────────────────────────────────────────
  {
    plugins: { '@stylistic': stylisticPlugin },
    rules: {
      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/key-spacing': ['error', { beforeColon: false, afterColon: true }],
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    },
  },

  // ─── Import ordering ─────────────────────────────────────────────────────
  {
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

  // ─── SonarJS (code quality) ───────────────────────────────────────────────
  {
    plugins: { sonarjs: sonarjsPlugin },
    rules: {
      'sonarjs/no-duplicate-string': ['warn', { threshold: 4 }],
      'sonarjs/no-identical-functions': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 15],
    },
  },

  // ─── General best practices ───────────────────────────────────────────────
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'eqeqeq': ['error', 'always'],
    },
  },
)
