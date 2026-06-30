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
 * • docs/project-planning/substrate-metrics-feed.md; the shared Upstash storage plan
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import upstashDriver from 'unstorage/drivers/upstash';

export default defineNitroPlugin(() => {
  // Local dev keeps the default in-memory mount so an ingest→read round-trip works without any external service.
  if (import.meta.dev) return;

  // Vercel's Upstash integration injects UPSTASH_REDIS_REST_*; JENSCRAFT_* is an explicit override, KV_* a fallback.
  const url = process.env.JENSCRAFT_REDIS_REST_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.JENSCRAFT_REDIS_REST_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  // No credentials wired yet → leave the default memory mount; the feed simply reads as offline until they exist.
  if (!url || !token) return;

  useStorage().mount('jenscraft', upstashDriver({ base: 'jenscraft', url, token }));
});
