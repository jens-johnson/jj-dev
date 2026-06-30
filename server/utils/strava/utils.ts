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
 * ███████████████████████████████████████████ server/utils/strava/utils.ts ████████████████████████████████████████████
 *
 * Reusable, server-only Strava client for the Vertifix lab feature. Exchanges the env refresh token for a short-lived
 * access token (cached on the warm instance), then exposes the activity reads, multipart TCX upload, status polling,
 * and post-upload validation that the Vertifix endpoints compose. Mirrors the token pattern in metrics.get.ts and never
 * reaches the client bundle. Requires the refresh token to carry the activity:read_all + activity:write scopes.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://developers.strava.com/docs/reference/
 * • https://developers.strava.com/docs/uploads/
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { IReplacementValidation, IStravaActivity, IStravaUpload, TStravaStreams, TUploadActivity } from './types';

/* ─── Constants ───────────────────────────────────────────────────────────────────────────────────────────────────── */

const API = 'https://www.strava.com/api/v3';
const OAUTH_TOKEN_URL = 'https://www.strava.com/oauth/token';
const RUN_SPORT_TYPES = ['Run', 'VirtualRun', 'TrailRun'];
const MATCH_WINDOW_MS = 36 * 60 * 60 * 1000;
const METRES_PER_FOOT = 0.3048;
const FEET_PER_METRE = 3.28084;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

/* ─── Credentials & access token ──────────────────────────────────────────────────────────────────────────────────── */

// Reads the Strava credentials, falling back to bare `process.env` for Vercel (see metrics.get.ts).
function credentials() {
  const config = useRuntimeConfig();
  const clientId = config.stravaClientId || process.env.STRAVA_CLIENT_ID;
  const clientSecret = config.stravaClientSecret || process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = config.stravaRefreshToken || process.env.STRAVA_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw createError({
      statusCode: 500,
      message:
        'Strava credentials are not configured (STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET / STRAVA_REFRESH_TOKEN).',
    });
  }
  return { clientId, clientSecret, refreshToken };
}

// Cached on the warm Nitro instance; Strava refresh tokens are static, so the bare env token is reused.
let cachedAccessToken: string | null = null;
let cachedExpiry = 0;

/**
 * Exchanges the refresh token for an access token, reusing the cached one until ~60s before it expires
 * @returns The current Strava access token
 */
export async function stravaAccessToken(): Promise<string> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedExpiry > nowSeconds + 60) return cachedAccessToken;

  const { clientId, clientSecret, refreshToken } = credentials();
  const response = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  const token = (await response.json()) as { access_token?: string; expires_at?: number; message?: string };
  if (!response.ok || !token.access_token) {
    throw createError({ statusCode: 502, message: `Strava auth failed: ${token.message ?? JSON.stringify(token)}` });
  }

  cachedAccessToken = token.access_token;
  cachedExpiry = token.expires_at ?? nowSeconds + 5 * 60;
  return cachedAccessToken;
}

// Authenticated Strava API fetch that throws an H3 error on non-2xx responses.
async function stravaFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await stravaAccessToken();
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
  });
  if (!response.ok) {
    throw createError({ statusCode: response.status, message: `Strava ${response.status}: ${await response.text()}` });
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/* ─── Activity reads ──────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Lists running activities within plus/minus 36h of the given date, nearest start time first
 * @param isoDate - The center date (ISO string)
 * @returns The matching running activities, sorted by proximity to the center date
 */
export async function activitiesNear(isoDate: string): Promise<IStravaActivity[]> {
  const center = new Date(isoDate).getTime();
  const after = Math.floor((center - MATCH_WINDOW_MS) / 1000);
  const before = Math.floor((center + MATCH_WINDOW_MS) / 1000);
  const activities = await stravaFetch<IStravaActivity[]>(
    `/athlete/activities?after=${after}&before=${before}&per_page=100`,
  );
  return activities
    .filter((activity) => RUN_SPORT_TYPES.includes(activity.sport_type))
    .sort(
      (a, b) =>
        Math.abs(new Date(a.start_date).getTime() - center) - Math.abs(new Date(b.start_date).getTime() - center),
    );
}

/**
 * Fetches a single activity
 * @param id - The Strava activity id
 * @returns The activity
 */
export function getActivity(id: number): Promise<IStravaActivity> {
  return stravaFetch<IStravaActivity>(`/activities/${id}`);
}

/**
 * Fetches the activity streams, keyed by type, for the TCX rebuild
 * @param id - The Strava activity id
 * @param keys - The comma-separated stream keys to request
 * @returns The streams keyed by type
 */
export function getStreams(id: number, keys = 'time,distance,heartrate,cadence'): Promise<TStravaStreams> {
  return stravaFetch<TStravaStreams>(`/activities/${id}/streams?keys=${keys}&key_by_type=true`);
}

/**
 * Checks whether the activity still exists; the guard the commit step uses to confirm a manual delete
 * @param id - The Strava activity id
 * @returns True when the activity still exists
 */
export async function activityExists(id: number): Promise<boolean> {
  const token = await stravaAccessToken();
  const response = await fetch(`${API}/activities/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 404) return false;
  if (!response.ok) {
    throw createError({ statusCode: 502, message: `Could not verify the original activity (${response.status}).` });
  }
  return true;
}

/* ─── Upload & replace ────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Uploads a corrected TCX as a new activity
 * @param tcx - The TCX document to upload
 * @param activity - The minimal activity metadata to apply
 * @returns The upload handle to poll
 */
export async function uploadTcx(tcx: string, activity: TUploadActivity): Promise<IStravaUpload> {
  const token = await stravaAccessToken();
  const form = new FormData();
  form.append('file', new Blob([tcx], { type: 'application/vnd.garmin.tcx+xml' }), 'activity.tcx');
  form.append('data_type', 'tcx');
  form.append('name', activity.name);
  form.append('description', activity.description ?? '');
  form.append('trainer', '0');
  form.append('external_id', `vertifix-${activity.id}-${Date.now()}`);
  const response = await fetch(`${API}/uploads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!response.ok) {
    throw createError({ statusCode: 502, message: `Strava upload failed: ${await response.text()}` });
  }
  return (await response.json()) as IStravaUpload;
}

/**
 * Polls an upload until Strava finishes processing it
 * @param uploadId - The upload id to poll
 * @param attempts - The maximum number of poll attempts
 * @param intervalMs - The delay between attempts in milliseconds
 * @returns The new activity id once processing completes
 */
export async function pollUpload(uploadId: number, attempts = 20, intervalMs = 1500): Promise<number> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const upload = await stravaFetch<IStravaUpload>(`/uploads/${uploadId}`);
    if (upload.error) throw createError({ statusCode: 502, message: upload.error });
    if (upload.activity_id) return upload.activity_id;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw createError({
    statusCode: 504,
    message: 'Strava is still processing the upload; check Strava and the audit trail before retrying.',
  });
}

/**
 * Clears the `trainer` flag on the replacement so it is not tagged as a treadmill run
 * @param id - The Strava activity id
 * @returns The updated activity
 */
export function setTrainerFalse(id: number): Promise<IStravaActivity> {
  return stravaFetch<IStravaActivity>(`/activities/${id}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify({ trainer: false }),
  });
}

/**
 * Re-reads the replacement and checks distance and elevation are within tolerance of expected
 * @param id - The replacement activity id
 * @param expectedDistanceMeters - The expected distance in meters
 * @param expectedElevationFeet - The expected elevation gain in feet
 * @returns The validation outcome
 */
export async function validateReplacement(
  id: number,
  expectedDistanceMeters: number,
  expectedElevationFeet: number,
): Promise<IReplacementValidation> {
  let activity: IStravaActivity | null = null;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    activity = await getActivity(id);
    if (activity.distance > 0) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  if (!activity) {
    throw createError({ statusCode: 502, message: 'Could not read the replacement activity after upload.' });
  }

  const expectedElevationMeters = expectedElevationFeet * METRES_PER_FOOT;
  const distanceDelta = Math.abs(activity.distance - expectedDistanceMeters);
  const elevationDelta = Math.abs(activity.total_elevation_gain - expectedElevationMeters);
  const distanceValid = distanceDelta <= Math.max(50, expectedDistanceMeters * 0.005);
  const elevationValid = elevationDelta <= Math.max(20, expectedElevationMeters * 0.05);
  return {
    valid: distanceValid && elevationValid,
    distanceValid,
    elevationValid,
    expectedDistanceMeters,
    actualDistanceMeters: activity.distance,
    expectedElevationFeet,
    actualElevationFeet: Math.round(activity.total_elevation_gain * FEET_PER_METRE),
  };
}
