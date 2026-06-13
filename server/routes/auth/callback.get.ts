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
 * ████████████████████████████████████████ server/routes/auth/callback.get.ts █████████████████████████████████████████
 *
 * Google OIDC login + callback endpoint — redirects to Google, then exchanges the returned code and seals the user
 * session.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Linked from the nav login button. The route path matches the /auth/callback redirect URIs registered with Google for
 * both prod and staging, so the callback URL derives correctly from the request origin in each environment.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://github.com/atinux/nuxt-auth-utils#oauth-event-handlers
 * • https://developers.google.com/identity/openid-connect/openid-connect
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/** Subset of the Google OIDC userinfo payload we consume. */
interface GoogleUser {
  sub: string;
  name: string;
  email: string;
  email_verified?: boolean;
  picture?: string;
}

export default defineOAuthGoogleEventHandler({
  config: {
    /* Read the bare Vercel env vars at request time so they resolve at runtime in every
       environment, rather than being baked into the build via runtimeConfig. Falls through to
       nuxt-auth-utils' own NUXT_OAUTH_GOOGLE_* resolution if these are unset. */
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    /* Basic profile + email. `openid` is implied; nuxt-auth-utils derives redirectURL from the request origin. */
    scope: ['email', 'profile'],
  },

  /** Exchange succeeded — persist a trimmed profile and the resolved admin flag into the session. */
  async onSuccess(event, { user }) {
    const profile = user as GoogleUser;

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

  /** Exchange failed (user denied consent, bad config, etc.) — log and bounce home with a flag. */
  onError(event, error) {
    console.error('[auth] Google OAuth error:', error);
    return sendRedirect(event, '/?auth=error');
  },
});
