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
 * ████████████████████████████████████████ #server/api/substrate/ingest.post.ts ███████████████████████████████████████
 *
 * Receives a metrics push from the homelab publisher. Bearer-secret auth, per-IP rate limit, body-size cap, and
 * strict validation; stores the latest payload. The public never POSTs here, only the lab dialing outward. Errors
 * are intentionally generic (no detail leaked).
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

export default defineEventHandler(async (event) => {
  const secret = useRuntimeConfig(event).substrateIngestSecret;
  if (!secret || getHeader(event, 'authorization') !== `Bearer ${secret}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown';
  if (!allowRequest(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' });
  }

  const raw = await readRawBody(event, 'utf8');
  if (!raw || raw.length > 4096) {
    throw createError({ statusCode: 413, statusMessage: 'Payload Too Large' });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw createError({ statusCode: 422, statusMessage: 'Invalid payload' });
  }

  const result = validateMetricsPayload(parsed);
  if (!result.ok) {
    throw createError({ statusCode: 422, statusMessage: 'Invalid payload' });
  }

  await writeLatestMetrics(result.value);
  setResponseStatus(event, 204);
  return null;
});
