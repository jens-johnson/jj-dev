/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                 ██        ██                     ▄▄
 *                                 ▀▀        ▀▀                     ██
 *                               ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                 ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                 ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                 ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                 ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                              ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * ██████████████████████████████████████████ #server/utils/vertifix/types.ts ██████████████████████████████████████████
 *
 * Type definitions for the vertifix server utils: the commit-request parse result union.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { IVertifixCommitRequest } from '#shared/vertifix';

/**
 * A type representing the result of parsing an untrusted commit-request body: the fully-validated request on success,
 * or a human-readable failure message for the 422 response
 * @public
 */
export type TVertifixCommitParseResult = { ok: true; request: IVertifixCommitRequest } | { ok: false; message: string };
