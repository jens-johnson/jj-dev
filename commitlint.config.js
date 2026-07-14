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
 * The commitlint configuration for this project: the shared @jens-johnson/style-guide factory with jj-dev's scope
 * enum. Runs as a commit-msg hook and enforces `type(scope): subject` (Conventional Commits, lowercase subjects).
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://conventionalcommits.org
 * • https://github.com/jens-johnson/jens-johnson/blob/main/docs/style-guide/conventions/git-workflow.md
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { createCommitlintConfig } from '@jens-johnson/style-guide/commitlint';

/**
 * The commitlint configuration for this project
 * @public
 * @default
 * @constant
 */
export default createCommitlintConfig({
  scopes: [
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
    'shared',
    'styles',
    'tailwind',
    'tests',
    'types',
    'uses',
    'work',
  ],
});
