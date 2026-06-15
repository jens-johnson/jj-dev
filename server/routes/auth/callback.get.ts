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
 * Origin (scheme + host, no trailing slash) for the current deployment, derived from Vercel's
 * system environment variables.
 *
 * These resolve at *runtime* in the function — unlike the request headers nuxt-auth-utils relies on.
 * On Vercel's Fluid runtime the h3 event sees neither a real `Host` nor `x-forwarded-*` (the proxy
 * headers don't reach it), so `getRequestURL()` collapses to `http://localhost` and Google rejects
 * the resulting `http://localhost/auth/callback` with `Error 400: redirect_uri_mismatch`. Reading
 * `process.env` sidesteps that entirely. Returns undefined off Vercel (local dev).
 *
 * • Production → `https://<VERCEL_PROJECT_PRODUCTION_URL>` (jens-johnson.com)
 * • staging    → `https://staging.jens-johnson.com` (its assigned custom preview domain)
 */
function vercelOrigin(): string | undefined {
  const env = process.env.VERCEL_ENV;
  if (env === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  // No env var exposes the staging branch's custom domain, so map it explicitly. Other preview
  // branches fall through — their *.vercel.app URLs aren't registered with Google anyway.
  if (env === 'preview' && process.env.VERCEL_GIT_COMMIT_REF === 'staging') {
    return 'https://staging.jens-johnson.com';
  }
  return undefined;
}

/**
 * Resolve the absolute OAuth redirect URI Google must call back to — matching one of the URIs
 * registered in the Google OIDC client (prod / staging / localhost). Priority:
 *
 * 1. `NUXT_OAUTH_GOOGLE_REDIRECT_URL` — explicit per-environment override, if set in Vercel.
 * 2. Vercel system env (`vercelOrigin`) — reliable at runtime; fixes prod + staging.
 * 3. `x-forwarded-host` — for proxies that do surface it (belt-and-suspenders).
 * 4. `undefined` — local dev; nuxt-auth-utils derives it from `Host` (`http://localhost:3000/...`).
 */
function resolveRedirectURL(event: H3Event): string | undefined {
  if (process.env.NUXT_OAUTH_GOOGLE_REDIRECT_URL) {
    return process.env.NUXT_OAUTH_GOOGLE_REDIRECT_URL;
  }

  const origin = vercelOrigin();
  if (origin) return `${origin}/auth/callback`;

  const forwardedHost = getRequestHeader(event, 'x-forwarded-host')?.split(',')[0]?.trim();
  if (forwardedHost) {
    const proto = getRequestHeader(event, 'x-forwarded-proto')?.split(',')[0]?.trim() || 'https';
    return `${proto}://${forwardedHost}/auth/callback`;
  }

  return undefined;
}

/* Build the handler per request so `redirectURL` can be resolved from the live request/runtime —
   defineOAuthGoogleEventHandler reads `config.redirectURL` before falling back to its own derivation. */
export default defineEventHandler((event) => {
  /* TEMP diagnostic — `/auth/callback?__diag=1` echoes what the resolver sees (no secrets). Gated to
     non-production so it can never surface on jens-johnson.com. Remove once sign-in is verified. */
  if (getQuery(event).__diag && process.env.VERCEL_ENV !== 'production') {
    return {
      resolvedRedirectURL: resolveRedirectURL(event),
      getRequestURL: getRequestURL(event).href,
      headers: {
        host: getRequestHeader(event, 'host') ?? null,
        'x-forwarded-host': getRequestHeader(event, 'x-forwarded-host') ?? null,
        'x-forwarded-proto': getRequestHeader(event, 'x-forwarded-proto') ?? null,
      },
      env: {
        VERCEL: process.env.VERCEL ?? null,
        VERCEL_ENV: process.env.VERCEL_ENV ?? null,
        VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF ?? null,
        VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL ?? null,
        VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL ?? null,
        VERCEL_URL: process.env.VERCEL_URL ?? null,
        NUXT_OAUTH_GOOGLE_REDIRECT_URL: process.env.NUXT_OAUTH_GOOGLE_REDIRECT_URL ?? null,
      },
    };
  }

  return defineOAuthGoogleEventHandler({
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
  })(event);
});
