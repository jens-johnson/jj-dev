// ─── commitlint.config.js ────────────────────────────────────────────────────
// Enforces Conventional Commits format for all commit messages.
// Used by the commit-msg git hook and `npm run commit` (Commitizen).
//
// Format: <type>(<scope>): <subject>
// Example: feat(nav): add theme toggle to header
//
// See: https://conventionalcommits.org
// See: https://commitlint.js.org

/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow scopes matching our main areas of the codebase
    'scope-enum': [
      2,
      'always',
      [
        'app',
        'assets',
        'blog',
        'ci',
        'components',
        'composables',
        'config',
        'content',
        'deps',
        'design',
        'docs',
        'eslint',
        'lab',
        'layouts',
        'pages',
        'projects',
        'public',
        'release',
        'server',
        'seo',
        'styles',
        'tailwind',
        'tests',
        'types',
        'uses',
        'work',
      ],
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [2, 'always', 'lower-case'],
    'body-max-line-length': [1, 'always', 100],
  },
}
