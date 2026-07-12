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
 * ████████████████████████████████████████████ server/utils/auth/types.ts █████████████████████████████████████████████
 *
 * Server-side auth types: the trimmed Google OIDC userinfo shape the callback consumes.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An interface representing the subset of the Google OIDC userinfo payload the callback consumes
 * @public
 * @interface
 */
export interface IGoogleUser {
  /* The stable Google subject identifier for the account */
  sub: string;

  /* The account's display name */
  name: string;

  /* The account's email address */
  email: string;

  /* Whether Google has verified the email address */
  email_verified?: boolean;

  /* The account's avatar URL */
  picture?: string;
}
