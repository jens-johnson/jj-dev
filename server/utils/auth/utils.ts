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
 * ████████████████████████████████████████████ #server/utils/auth/utils.ts ████████████████████████████████████████████
 *
 * Server-side authorization helpers: the admin allow-list (isAdminEmail), an admin-only route guard (requireAdmin),
 * and the OAuth redirect-URI resolver the Google callback pins its redirect to (resolveRedirectURL).
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://github.com/atinux/nuxt-auth-utils#server-utils
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { H3Event } from 'h3';

import type { UserSessionRequired } from '#auth-utils';

/**
 * Determines whether an email belongs to the configured admin account. The allow-list is read from the server-only
 * `adminEmail` runtime config so it never reaches the client bundle. The comparison is trimmed and case-insensitive
 * @param email - The email to check
 * @returns True when the email matches the configured admin account
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }
  const { adminEmail }: { adminEmail: string } = useRuntimeConfig();
  return email.trim().toLowerCase() === String(adminEmail).trim().toLowerCase();
}

/**
 * Route guard for admin-only server endpoints. Requires an authenticated session and admin privileges, throwing 401
 * (via requireUserSession) when unauthenticated and 403 when the session is non-admin
 * @param event - The H3 request event
 * @throws 401 when the request is unauthenticated (thrown by requireUserSession)
 * @throws 403 when the authenticated session is not on the admin allow-list
 * @returns The verified session, so handlers can read `user` from it
 */
export async function requireAdmin(event: H3Event): Promise<UserSessionRequired> {
  // Require an authenticated session first; this throws a 401 when the request is anonymous
  const session: UserSessionRequired = await requireUserSession(event);
  // Reject authenticated sessions that are not on the admin allow-list
  if (!session.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden; admin access required',
    });
  }
  return session;
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
 * @public
 * @function
 * @param event - The incoming request event
 * @returns The absolute redirect URI, or undefined to let nuxt-auth-utils derive it
 */
export function resolveRedirectURL(event: H3Event): string | undefined {
  // 1. Explicit per-environment override, if set in Vercel
  if (process.env.NUXT_OAUTH_GOOGLE_REDIRECT_URL) {
    return process.env.NUXT_OAUTH_GOOGLE_REDIRECT_URL;
  }

  // 2. Vercel system env; reliable at runtime for prod and staging
  const origin: string | undefined = vercelOrigin();
  if (origin) {
    return new URL('/auth/callback', origin).href;
  }

  // 3. Forwarded proxy headers, for proxies that do surface them. The x-forwarded-* values are
  //    comma-separated header lists, not URLs, so take the first entry; the callback URL is then
  //    assembled with URL() for correct origin joining and path encoding.
  const forwardedHost: string | undefined = getRequestHeader(event, 'x-forwarded-host')?.split(',')[0]?.trim();
  if (forwardedHost) {
    const proto: string = getRequestHeader(event, 'x-forwarded-proto')?.split(',')[0]?.trim() || 'https';
    return new URL('/auth/callback', `${proto}://${forwardedHost}`).href;
  }

  // 4. Local dev; nuxt-auth-utils derives the URI from the Host header
  return undefined;
}
