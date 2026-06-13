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
 * █████████████████████████████████████████████ commitlint.config.js ██████████████████████████████████████████████████
 *
 * The commitlint configuration for this project.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Read developer docs for how to set up linting. Runs as an git commit hook while running `npm commit` and enforces
 * conventional commit specification on commit messages, i.e.:
 *
 *  ```
 *  Format: <type>(<scope>): <subject>
 *  Example: feat(nav): add theme toggle to header
 *  ```
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://conventionalcommits.org
 * • https://commitlint.js.org
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The commitlint configuration for this project
 * @public
 * @default
 * @constant
 * @type {import('@commitlint/types').UserConfig}
 */
export default {
  /* Extend the traditional commitlint config */
  extends: ['@commitlint/config-conventional'],

  /* Config rules */
  rules: {
    /*  Allow scopes matching our main areas of the codebase */
    'scope-enum': [
      2,
      'always',
      [
        'app',
        'assets',
        'auth',
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

    /* Ensure scopes are kebab-cased */
    'scope-case': [2, 'always', 'kebab-case'],

    /* Ensure subjects are lower-cased */
    'subject-case': [2, 'always', 'lower-case'],

    /* Limit body lines to 100 chars */
    'body-max-line-length': [1, 'always', 100],
  },
};
