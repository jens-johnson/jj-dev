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
 * ███████████████████████████████████ #server/api/services/jenscraft/ingest.post.ts ███████████████████████████████████
 *
 * Receives a metrics push from the Jenscraft LXC publisher. Bearer-secret auth, per-IP rate limit, body-size cap, and
 * strict validation; stores the latest snapshot. The public never POSTs here, only the server dialing outward. Errors
 * are intentionally generic (no detail leaked).
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * POST /api/services/jenscraft/ingest
 *
 * ─── AUTH ────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • Bearer shared secret in the Authorization header (runtimeConfig jenscraftIngestSecret)
 *
 * ─── BODY ────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • v
 *     - Description: The payload schema version
 *     - Type: number
 *     - Required: true
 *   • ts
 *     - Description: The publisher-side timestamp (ISO string, max 40 chars)
 *     - Type: string
 *     - Required: true
 *   • players
 *     - Description: The player counts (online / max / java / bedrock)
 *     - Type: object
 *     - Required: false
 *   • tps
 *     - Description: The ticks-per-second figure (0-20)
 *     - Type: number
 *     - Required: false
 *   • mspt
 *     - Description: The milliseconds-per-tick figure
 *     - Type: number
 *     - Required: false
 *   • uptimeSec
 *     - Description: The server uptime in seconds
 *     - Type: number
 *     - Required: false
 *   • world
 *     - Description: The world-explored percentage ({ exploredPct })
 *     - Type: object
 *     - Required: false
 *   • mobs
 *     - Description: The defeated-mob count ({ defeated })
 *     - Type: object
 *     - Required: false
 *
 * ─── RETURNS ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • 204 No Content (null body) once the snapshot is stored
 *
 * ─── THROWS ──────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • 401 when the bearer secret is missing or does not match
 *   • 429 when the per-IP rate limit is exhausted
 *   • 413 when the body is empty or exceeds 4096 bytes
 *   • 422 when the body is not valid JSON or fails payload validation
 *
 * ─── SIDE EFFECTS ────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • Persists the snapshot (stamped with the server receive time) to the jenscraft storage mount
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { H3Event } from 'h3';

/**
 * Ingests a metrics push from the Jenscraft LXC publisher: authenticates the bearer secret, rate-limits by client IP,
 * caps the body size, validates the snapshot, and stores it as the latest snapshot
 * @public
 * @default
 * @function
 * @param event - The incoming request event
 * @returns Null with a 204 status once the snapshot is stored
 */
export default defineEventHandler(async (event: H3Event): Promise<null> => {
  // Publisher-only surface; a missing or mismatched bearer secret exits 401 (generic, no detail leaked)
  const secret: string | undefined = useRuntimeConfig(event).jenscraftIngestSecret;
  if (!secret || getHeader(event, 'authorization') !== `Bearer ${secret}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  // Rate-limit per client IP (namespaced so the jenscraft and substrate feeds do not share buckets)
  const ip: string = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown';
  if (!allowRequest(`jenscraft:${ip}`)) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' });
  }

  // Read the raw body under a hard size cap; the real payload is tiny, so anything larger exits 413
  const raw: string | undefined = await readRawBody(event, 'utf8');
  if (!raw || raw.length > 4096) {
    throw createError({ statusCode: 413, statusMessage: 'Payload Too Large' });
  }

  // Parse the JSON ourselves so a malformed body exits 422 instead of surfacing a parse error
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw createError({ statusCode: 422, statusMessage: 'Invalid payload' });
  }

  // Validate the untrusted payload through the pure core; any shape/range violation exits 422
  const result = validateJenscraftPayload(parsed);
  if (!result.ok) {
    throw createError({ statusCode: 422, statusMessage: 'Invalid payload' });
  }

  // Persist the clean snapshot (stamped with the receive time) and acknowledge with an empty 204
  await writeLatestJenscraftMetrics(result.value);
  setResponseStatus(event, 204);
  return null;
});
