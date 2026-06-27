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
 * ███████████████████████████████████ #server/api/services/jenscraft/ingest.post.ts ███████████████████████████████████
 *
 * Receives a metrics push from the Jenscraft LXC publisher. Bearer-secret auth, per-IP rate limit, body-size cap, and
 * strict validation; stores the latest snapshot. The public never POSTs here, only the server dialing outward. Errors
 * are intentionally generic (no detail leaked).
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

export default defineEventHandler(async (event) => {
  const secret = useRuntimeConfig(event).jenscraftIngestSecret;
  if (!secret || getHeader(event, 'authorization') !== `Bearer ${secret}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown';
  if (!allowRequest(`jenscraft:${ip}`)) {
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

  const result = validateJenscraftPayload(parsed);
  if (!result.ok) {
    throw createError({ statusCode: 422, statusMessage: 'Invalid payload' });
  }

  await writeLatestJenscraftMetrics(result.value);
  setResponseStatus(event, 204);
  return null;
});
