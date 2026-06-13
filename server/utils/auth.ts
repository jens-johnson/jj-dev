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
 * ███████████████████████████████████████████████ server/utils/auth.ts ████████████████████████████████████████████████
 *
 * Server-side authorization helpers — the admin allow-list (isAdminEmail) and an admin-only route guard (requireAdmin).
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://github.com/atinux/nuxt-auth-utils#server-utils
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { H3Event } from 'h3';

/**
 * Whether `email` belongs to the configured admin account. The allow-list is read from the
 * server-only `adminEmail` runtime config so it never reaches the client bundle. Comparison is
 * trimmed and case-insensitive.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const { adminEmail } = useRuntimeConfig();
  return email.trim().toLowerCase() === String(adminEmail).trim().toLowerCase();
}

/**
 * Route guard for admin-only server endpoints. Requires an authenticated session *and* admin
 * privileges — throwing 401 (via `requireUserSession`) when unauthenticated and 403 when the
 * session is non-admin. Returns the verified session so handlers can read `user` from it.
 * Downstream admin tickets call this at the top of their handlers.
 */
export async function requireAdmin(event: H3Event) {
  const session = await requireUserSession(event);
  if (!session.isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden — admin access required',
    });
  }
  return session;
}
