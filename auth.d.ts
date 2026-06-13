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
 * █████████████████████████████████████████████████████ auth.d.ts █████████████████████████████████████████████████████
 *
 * Module augmentation for nuxt-auth-utils — types the user profile and session data sealed into the session cookie.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://github.com/atinux/nuxt-auth-utils#typescript
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

declare module '#auth-utils' {
  /** The authenticated Google user, as persisted in the session cookie. */
  interface User {
    /** Google account email (verified). */
    email: string;
    /** Display name from the Google profile. */
    name: string;
    /** Avatar URL from the Google profile, if present. */
    picture?: string;
    /** Stable Google subject identifier (OIDC `sub`). */
    sub: string;
  }

  /** Top-level session payload, stored alongside `user`. */
  interface UserSession {
    /** True when the signed-in email is on the admin allow-list — gates admin-only features. */
    isAdmin: boolean;
    /** Unix epoch (ms) at which the session was established. */
    loggedInAt: number;
  }
}

export {};
