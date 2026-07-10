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

/**
 * The subset of the Google OIDC userinfo payload we consume
 * @internal
 * @interface
 */
interface IGoogleUser {
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

/**
 * Origin (scheme + host, no trailing slash) for the current deployment, derived from Vercel's
 * system environment variables.
 *
 * These resolve at *runtime* in the function; unlike the request headers nuxt-auth-utils relies on.
 * On Vercel's Fluid runtime the h3 event sees neither a real `Host` nor `x-forwarded-*` (the proxy
 * headers don't reach it), so `getRequestURL()` collapses to `http://localhost` and Google rejects
 * the resulting `http://localhost/auth/callback` with `Error 400: redirect_uri_mismatch`. Reading
 * `process.env` sidesteps that entirely. Returns undefined off Vercel (local dev).
 *
 * • Production → `https://<VERCEL_PROJECT_PRODUCTION_URL>` (jens-johnson.com)
 * • staging    → `https://staging.jens-johnson.com` (its assigned custom preview domain)
 * @internal
 * @function
 * @returns The deployment's public origin, or undefined off Vercel (local dev)
 */
function vercelOrigin(): string | undefined {
  // Resolve the deployment environment; production and the staging preview branch map to registered domains
  const env: string | undefined = process.env.VERCEL_ENV;
  if (env === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  // No env var exposes the staging branch's custom domain, so map it explicitly. Other preview
  // branches fall through; their *.vercel.app URLs aren't registered with Google anyway.
  if (env === 'preview' && process.env.VERCEL_GIT_COMMIT_REF === 'staging') {
    return 'https://staging.jens-johnson.com';
  }
  return undefined;
}

/**
 * Resolve the absolute OAuth redirect URI Google must call back to; matching one of the URIs
 * registered in the Google OIDC client (prod / staging / localhost). Priority:
 *
 * 1. `NUXT_OAUTH_GOOGLE_REDIRECT_URL`; explicit per-environment override, if set in Vercel.
 * 2. Vercel system env (`vercelOrigin`); reliable at runtime; fixes prod + staging.
 * 3. `x-forwarded-host`; for proxies that do surface it (belt-and-suspenders).
 * 4. `undefined`; local dev; nuxt-auth-utils derives it from `Host` (`http://localhost:3000/...`).
 * @internal
 * @function
 * @param event - The incoming request event
 * @returns The absolute redirect URI, or undefined to let nuxt-auth-utils derive it
 */
function resolveRedirectURL(event: H3Event): string | undefined {
  // 1. Explicit per-environment override, if set in Vercel
  if (process.env.NUXT_OAUTH_GOOGLE_REDIRECT_URL) {
    return process.env.NUXT_OAUTH_GOOGLE_REDIRECT_URL;
  }

  // 2. Vercel system env; reliable at runtime for prod and staging
  const origin: string | undefined = vercelOrigin();
  if (origin) {
    return `${origin}/auth/callback`;
  }

  // 3. Forwarded proxy headers, for proxies that do surface them
  const forwardedHost: string | undefined = getRequestHeader(event, 'x-forwarded-host')?.split(',')[0]?.trim();
  if (forwardedHost) {
    const proto: string = getRequestHeader(event, 'x-forwarded-proto')?.split(',')[0]?.trim() || 'https';
    return `${proto}://${forwardedHost}/auth/callback`;
  }

  // 4. Local dev; nuxt-auth-utils derives the URI from the Host header
  return undefined;
}

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
  const { error: oauthError, error_description: oauthErrorDescription } = getQuery(event);
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

    /** Exchange succeeded; persist a trimmed profile and the resolved admin flag into the session. */
    async onSuccess(event, { user }) {
      // Narrow the untyped user payload to the OIDC fields we consume
      const profile: IGoogleUser = user as IGoogleUser;

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

    /** Exchange failed (user denied consent, bad config, etc.); log and bounce home with a flag. */
    onError(event, error) {
      console.error('[auth] Google OAuth error:', error);
      return sendRedirect(event, '/?auth=error');
    },
  })(event);
});
