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
 * both prod and staging; the callback origin is resolved from the request's forwarded host so it matches in every
 * environment (see resolveRedirectURL).
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://github.com/atinux/nuxt-auth-utils#oauth-event-handlers
 * • https://developers.google.com/identity/openid-connect/openid-connect
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { H3Event } from 'h3';

/** Subset of the Google OIDC userinfo payload we consume. */
interface GoogleUser {
  sub: string;
  name: string;
  email: string;
  email_verified?: boolean;
  picture?: string;
}

/**
 * Resolve the absolute OAuth redirect URI Google must call back to.
 *
 * nuxt-auth-utils otherwise derives this from h3's `getRequestURL()`, which reads the bare `Host`
 * header and ignores `x-forwarded-host`. Behind Vercel's proxy the serverless function never sees
 * the public host, so h3 falls back to `http://localhost` — yielding `http://localhost/auth/callback`,
 * which isn't in Google's authorized list and trips `Error 400: redirect_uri_mismatch` in every
 * deployed environment. We rebuild the origin from the `x-forwarded-*` headers Vercel sets so the URI
 * matches the registered prod/staging callbacks. Locally those headers are absent, so we return
 * `undefined` and let nuxt-auth-utils derive it from `Host` (`http://localhost:3000/auth/callback`).
 */
function resolveRedirectURL(event: H3Event): string | undefined {
  const forwardedHost = getRequestHeader(event, 'x-forwarded-host');
  if (!forwardedHost) return undefined;

  const host = forwardedHost.split(',')[0]!.trim();
  const proto = getRequestHeader(event, 'x-forwarded-proto')?.split(',')[0]?.trim() || 'https';
  return `${proto}://${host}/auth/callback`;
}

/* Build the handler per request so `redirectURL` can be resolved from the live request headers —
   defineOAuthGoogleEventHandler reads `config.redirectURL` before falling back to its own derivation. */
export default defineEventHandler((event) =>
  defineOAuthGoogleEventHandler({
    config: {
      /* Read the bare Vercel env vars at request time so they resolve at runtime in every
         environment, rather than being baked into the build via runtimeConfig. Falls through to
         nuxt-auth-utils' own NUXT_OAUTH_GOOGLE_* resolution if these are unset. */
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      /* Basic profile + email. `openid` is implied. */
      scope: ['email', 'profile'],
      /* Pin the callback to the real public origin behind Vercel's proxy (see resolveRedirectURL). */
      redirectURL: resolveRedirectURL(event),
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
  })(event),
);
