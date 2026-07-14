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
 * Module augmentation for nuxt-auth-utils; types the user profile and session data sealed into the session cookie.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://github.com/atinux/nuxt-auth-utils#typescript
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * A type wrapper for Nuxt auth utils typings
 * @global
 * @module
 * @see {https://github.com/atinux/nuxt-auth-utils#typescript}
 */
declare module '#auth-utils' {
  /**
   * An interface representing the authenticated Google user, as persisted in the session cookie
   * @global
   * @interface
   */
  interface User {
    /* The user's Google account email (verified) */
    email: string;

    /* The user's display name from their Google profile */
    name: string;

    /* The user's Avatar URL from their Google profile, if present */
    picture?: string;

    /* The user's stable Google subject identifier (OIDC `sub`) */
    sub: string;
  }

  /**
   * An interface representing the top-level session payload, as persisted in the session cookie
   * @global
   * @interface
   */
  interface UserSession {
    /* A flag set to true when the signed-in email is on the admin allow-list; gates admin-only features */
    isAdmin: boolean;

    /* The Unix epoch (ms) at which the session was established. */
    loggedInAt: number;
  }
}

export {};
