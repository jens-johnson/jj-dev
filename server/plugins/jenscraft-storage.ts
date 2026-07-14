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
 * ███████████████████████████████████████ #server/plugins/jenscraft-storage.ts ████████████████████████████████████████
 *
 * Mounts the `jenscraft` storage on Upstash Redis (REST) in production so the live-metrics feed survives Vercel's
 * serverless, per-invocation memory. Dev is left on the default in-memory mount so an ingest→read round-trip works
 * with no external service. If no Redis credentials are wired yet, the mount is skipped and the feed reads as offline
 *; never an error.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • docs/.archive/project-planning/substrate-metrics-feed.md; the shared Upstash storage plan
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import upstashDriver from 'unstorage/drivers/upstash';

/**
 * Mounts the `jenscraft` storage on Upstash Redis in production so the live-metrics feed survives Vercel's
 * per-invocation serverless memory; a no-op in dev (which keeps the default in-memory mount) and when no Redis
 * credentials are wired, in which case the feed simply reads as offline
 * @public
 * @default
 * @function
 */
export default defineNitroPlugin((): void => {
  /* ─── Guard ──────────────────────────────────────────────────────────────────────────────────────────────── */

  // Local dev keeps the default in-memory mount so an ingest→read round-trip works without any external service.
  if (import.meta.dev) {
    return;
  }

  /* ─── Credentials ────────────────────────────────────────────────────────────────────────────────────────── */

  // Vercel's Upstash integration injects UPSTASH_REDIS_REST_*; JENSCRAFT_* is an explicit override, KV_* a fallback.
  const url: string | undefined =
    process.env.JENSCRAFT_REDIS_REST_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token: string | undefined =
    process.env.JENSCRAFT_REDIS_REST_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  // No credentials wired yet → leave the default memory mount; the feed simply reads as offline until they exist.
  if (!url || !token) {
    return;
  }

  /* ─── Mount ──────────────────────────────────────────────────────────────────────────────────────────────── */

  useStorage().mount(
    'jenscraft',
    upstashDriver({
      base: 'jenscraft',
      url,
      token,
    }),
  );
});
