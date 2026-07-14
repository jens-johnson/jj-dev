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
 * ████████████████████████████████████████ #server/routes/auth/callback.get.ts ████████████████████████████████████████
 *
 * Google OIDC login + callback endpoint; redirects to Google, then exchanges the returned code and seals the user
 * session.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * GET /auth/callback
 *
 * Linked from the nav login button. The route path matches the /auth/callback redirect URIs registered with Google for
 * both prod and staging; the callback origin is resolved from the request's forwarded host so it matches in every
 * environment (see resolveRedirectURL).
 *
 * ─── QUERY ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • code
 *     - Description: The authorization code Google returns on a successful grant; consumed by the nuxt-auth-utils
 *         handler
 *     - Type: string
 *     - Required: false
 *   • error
 *     - Description: The OAuth error code Google returns instead of a code when the grant fails
 *     - Type: string
 *     - Required: false
 *   • error_description
 *     - Description: Google's human-readable detail accompanying an OAuth error
 *     - Type: string
 *     - Required: false
 *
 * ─── RETURNS ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • A redirect: to Google's consent screen on the initial hit, to / after a successful login, or to /?auth=error when
 *     the grant fails
 *
 * ─── SIDE EFFECTS ────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • Seals the user session cookie with the trimmed Google profile and the resolved admin flag
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • https://github.com/atinux/nuxt-auth-utils#oauth-event-handlers
 *   • https://developers.google.com/identity/openid-connect/openid-connect
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { H3Event } from 'h3';

import type { IGoogleUser } from '#utils/auth';

/**
 * Runs the Google OIDC login + callback flow: redirects to Google, then exchanges the returned code and seals the
 * user session. The inner OAuth handler is built per request so `redirectURL` can be resolved from the live
 * request/runtime; defineOAuthGoogleEventHandler reads `config.redirectURL` before falling back to its own derivation
 * @public
 * @default
 * @function
 * @param event - The incoming request event
 * @returns A redirect: to Google's consent screen, to / after a successful login, or to /?auth=error on failure
 */
export default defineEventHandler((event: H3Event): Promise<void> => {
  // Google can redirect back here with `?error=…` instead of a `code`; denied consent, an OAuth
  // app still in "Testing" mode, a blocked grant, etc. nuxt-auth-utils' handler only checks for
  // `code`, so a no-code callback silently re-enters the flow → an endless consent⇄account-chooser
  // loop that never returns to the app. Surface the error and stop, rather than restarting.
  const {
    error: oauthError,
    error_description: oauthErrorDescription,
  }: { error?: unknown; error_description?: unknown } = getQuery(event);
  if (oauthError) {
    console.error('[auth] Google returned an error to the callback:', oauthError, oauthErrorDescription ?? '');
    return sendRedirect(event, `/?auth=error&reason=${encodeURIComponent(String(oauthError))}`);
  }

  // Build and immediately invoke the per-request OAuth handler
  return defineOAuthGoogleEventHandler({
    config: {
      // Read the bare Vercel env vars at request time so they resolve at runtime in every
      // environment, rather than being baked into the build via runtimeConfig. Falls through to
      // nuxt-auth-utils' own NUXT_OAUTH_GOOGLE_* resolution if these are unset.
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      // Request a proper OIDC grant: `openid` yields an id_token alongside the email/profile claims.
      scope: ['openid', 'email', 'profile'],
      // Pin the callback to the real public origin behind Vercel's proxy (see resolveRedirectURL).
      redirectURL: resolveRedirectURL(event),
    },

    /**
     * Handles a successful OAuth exchange; narrows the Google profile, seals the user session with the trimmed
     * fields and the resolved admin flag, then redirects home
     * @param event - The incoming request event
     * @param oauth - The OAuth result; `user` is the raw Google OIDC userinfo payload
     * @returns A redirect to the app root
     */
    async onSuccess(event: H3Event, oauth: { user: unknown }): Promise<void> {
      // Narrow the untyped user payload to the OIDC fields we consume
      const profile: IGoogleUser = oauth.user as IGoogleUser;

      await setUserSession(event, {
        user: {
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          sub: profile.sub,
        },
        // Only an allow-listed, Google-verified email earns admin access.
        isAdmin: profile.email_verified !== false && isAdminEmail(profile.email),
        loggedInAt: Date.now(),
      });

      return sendRedirect(event, '/');
    },

    /**
     * Handles a failed OAuth exchange (denied consent, bad config, etc.); logs the error and bounces home with a flag
     * @param event - The incoming request event
     * @param error - The error thrown by the OAuth exchange
     * @returns A redirect to the app root with an auth-error flag
     */
    onError(event: H3Event, error: unknown): Promise<void> {
      console.error('[auth] Google OAuth error:', error);
      return sendRedirect(event, '/?auth=error');
    },
  })(event);
});
