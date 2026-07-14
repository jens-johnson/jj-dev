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
 * █████████████████████████████████████████ #server/utils/rate-limit/utils.ts █████████████████████████████████████████
 *
 * Ingest rate limiter: an Upstash sliding-window limiter for production with an in-memory per-process fallback for dev.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_MAX_TRACKED_KEYS,
  RATE_LIMIT_TIMEOUT_MS,
  RATE_LIMIT_WINDOW,
  RATE_LIMIT_WINDOW_MS,
} from './constants';

/**
 * The per-process rate-limit buckets for the in-memory dev fallback, keyed by client, holding recent request times
 * @internal
 * @constant
 */
const hits: Map<string, number[]> = new Map<string, number[]>();

/**
 * Builds the Upstash-backed sliding-window limiter, reading the same REST credentials the storage plugins use;
 * returns null when no credentials are wired (local dev), so the caller falls back to the in-memory limiter
 * @internal
 * @function
 * @returns The configured limiter, or null when no Upstash credentials are present
 */
function createLimiter(): Ratelimit | null {
  // Vercel's Upstash integration injects UPSTASH_REDIS_REST_*; KV_* and SUBSTRATE_* are accepted as fallbacks
  const url: string | undefined =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? process.env.SUBSTRATE_REDIS_REST_URL;
  const token: string | undefined =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? process.env.SUBSTRATE_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, RATE_LIMIT_WINDOW),
    prefix: 'jjdev:ratelimit',
    timeout: RATE_LIMIT_TIMEOUT_MS,
  });
}

/**
 * The process-wide limiter, resolved once at module load; null in local dev / when no Upstash credentials exist
 * @internal
 * @constant
 */
const limiter: Ratelimit | null = createLimiter();

/**
 * Dev-grade in-memory rate limiter (per-process); the fallback used when no Upstash credentials are wired
 * @internal
 * @function
 * @param key - The bucket key (e.g. the client IP)
 * @param limit - The maximum requests allowed within the window
 * @param windowMs - The rolling window length in milliseconds
 * @param now - The current time (epoch milliseconds), defaulting to now
 * @returns True when the request is allowed, false when the bucket is exhausted
 */
function allowRequest(
  key: string,
  limit: number = RATE_LIMIT_MAX,
  windowMs: number = RATE_LIMIT_WINDOW_MS,
  now: number = Date.now(),
): boolean {
  const recent: number[] = (hits.get(key) ?? []).filter((timestamp: number): boolean => now - timestamp < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }

  // Bound the map: a client seen once and never again would otherwise linger forever. When a new key would overflow
  // the cap, evict the oldest-inserted entry (Map preserves insertion order) before recording this hit.
  if (!hits.has(key) && hits.size >= RATE_LIMIT_MAX_TRACKED_KEYS) {
    const oldest: string | undefined = hits.keys().next().value;
    if (oldest !== undefined) {
      hits.delete(oldest);
    }
  }

  recent.push(now);
  hits.set(key, recent);
  return true;
}

/**
 * Checks whether a request from the given client is within the rate limit. Uses the Upstash sliding-window limiter in
 * production and the in-memory limiter in dev; fails open (allows the request) if the Upstash call errors, so a Redis
 * outage never blocks legitimate ingestion
 * @public
 * @function
 * @param key - The bucket key (e.g. the client IP)
 * @returns A promise resolving true when the request is allowed, false when the bucket is exhausted
 */
export async function checkRateLimit(key: string): Promise<boolean> {
  // No Upstash credentials (local dev): use the per-process in-memory limiter
  if (!limiter) {
    return allowRequest(key);
  }

  // Upstash sliding window in production; fail open on any limiter error so ingestion survives a Redis hiccup
  try {
    const { success }: { success: boolean } = await limiter.limit(key);
    return success;
  } catch (error) {
    console.error('[rate-limit] Upstash limiter failed; failing open:', error);
    return true;
  }
}
