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
 * ███████████████████████████████████████ #server/api/substrate/ingest.post.ts ████████████████████████████████████████
 *
 * Receives a metrics push from the homelab publisher. Bearer-secret auth, per-IP rate limit, body-size cap, and strict
 * validation; stores the latest payload. The public never POSTs here, only the lab dialing outward. Errors are
 * intentionally generic (no detail leaked).
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * POST /api/substrate/ingest
 *
 * ─── AUTH ────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • Bearer shared secret in the Authorization header (runtimeConfig substrateIngestSecret)
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
 *   • node
 *     - Description: The compute-node sample (uptimeSec / cpuPct / loadAvg / mem, optional swap)
 *     - Type: object
 *     - Required: true
 *   • guests
 *     - Description: The guest counts (vms / cts / running)
 *     - Type: object
 *     - Required: true
 *   • storage
 *     - Description: The storage usage percentage ({ usedPct })
 *     - Type: object
 *     - Required: false
 *   • internet
 *     - Description: The internet-edge reachability + latency ({ reachable, latencyMs })
 *     - Type: object
 *     - Required: false
 *
 * ─── RETURNS ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • 204 No Content (null body) once the payload is stored
 *
 * ─── THROWS ──────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • 401 when the bearer secret is missing or does not match
 *   • 429 when the per-IP rate limit is exhausted
 *   • 413 when the body is empty or exceeds 4096 bytes
 *   • 422 when the body is not valid JSON or fails payload validation
 *   • 502 when storing the payload fails
 *
 * ─── SIDE EFFECTS ────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • Persists the payload (stamped with the server receive time) to the substrate storage mount
 *   • Appends a compact CPU/memory point to the rolling sparkline history
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { H3Event } from 'h3';

/**
 * Ingests a metrics push from the homelab publisher: authenticates the bearer secret, rate-limits by client IP, caps
 * the body size, validates the payload, and stores it as the latest payload
 * @public
 * @default
 * @function
 * @param event - The incoming request event
 * @throws 401 when the bearer secret is missing or does not match
 * @throws 429 when the per-IP rate limit is exhausted
 * @throws 413 when the body is empty or exceeds 4096 bytes
 * @throws 422 when the body is not valid JSON or fails payload validation
 * @throws 502 when storing the payload fails
 * @returns Null with a 204 status once the payload is stored
 */
export default defineEventHandler(async (event: H3Event): Promise<null> => {
  // Publisher-only surface; a missing or mismatched bearer secret exits 401 (generic, no detail leaked)
  const secret: string | undefined = useRuntimeConfig(event).substrateIngestSecret;
  if (!secret || getHeader(event, 'authorization') !== `Bearer ${secret}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  // Rate-limit per client IP; the bucket is exhausted well below any legitimate push cadence
  const ip: string = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown';
  if (!allowRequest(ip)) {
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
  const result = validateMetricsPayload(parsed);
  if (!result.ok) {
    throw createError({ statusCode: 422, statusMessage: 'Invalid payload' });
  }

  // Persist the clean payload (stamped with the receive time, appended to the sparkline history) and acknowledge 204
  await runUpstream(writeLatestMetrics(result.value), 'Storing the metrics payload failed.');
  setResponseStatus(event, 204);
  return null;
});
