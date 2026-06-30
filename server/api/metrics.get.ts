/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                ██        ██                     ▄▄
 *                                ██        ██                     ██
 *                              ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                             ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * ████████████████████████████████████████████ server/api/metrics.get.ts ████████████████████████████████████████████████
 *
 * Server API route that aggregates GitHub contribution data and Strava activity stats for the
 * about page metrics card. Strava credentials never reach the client; all token exchange and
 * API calls happen here in the Nitro server layer. Responses are cached in-process for 1 hour
 * to avoid hammering third-party APIs on every page load.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://developers.strava.com/docs/reference/
 * • https://github-contributions-api.jogruber.de/
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/* ─── Types ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

interface IGhContribution {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface IGhContributionsResponse {
  total: Record<string, number>;
  contributions: IGhContribution[];
}

interface IStravaTokenResponse {
  access_token: string;
  athlete: { id: number };
}

interface IStravaTotals {
  count: number;
  distance: number; // metres
  moving_time: number; // seconds
  elapsed_time: number;
  elevation_gain: number;
}

interface IStravaStatsResponse {
  ytd_run_totals: IStravaTotals;
  all_run_totals: IStravaTotals;
  recent_run_totals: IStravaTotals;
}

interface IStravaActivity {
  id: number;
  name: string;
  type: string;
  start_date: string;
  distance: number; // metres
  moving_time: number; // seconds
}

export interface IMetricsWeek {
  days: { count: number; level: 0 | 1 | 2 | 3 | 4 }[];
}

export interface IMetricsResponse {
  github: {
    totalContributions: number;
    weeks: IMetricsWeek[]; // last 26 weeks, each with 7 days
  };
  strava: {
    ytdMiles: number;
    ytdRuns: number;
    ytdElevationFt: number;
    weeklyMiles: number[]; // last 16 weeks, miles per week (for sparkline)
  };
}

/* ─── In-process cache ────────────────────────────────────────────────────────────────────────────────────────────── */

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
let cachedData: IMetricsResponse | null = null;
let cacheTimestamp = 0;

/* ─── Helpers ─────────────────────────────────────────────────────────────────────────────────────────────────────── */

function metresToMiles(m: number): number {
  return Math.round((m / 1609.344) * 10) / 10;
}

function metresToFeet(m: number): number {
  return Math.round(m * 3.28084);
}

/** Groups a flat array of daily contributions into ISO weeks (Mon–Sun), newest last. */
function groupIntoWeeks(contributions: IGhContribution[], numWeeks: number): IMetricsWeek[] {
  // Pad the contributions array so it starts on a Monday
  const result: IMetricsWeek[] = [];
  const days = contributions.slice(-(numWeeks * 7));

  for (let w = 0; w < numWeeks; w++) {
    const slice = days.slice(w * 7, w * 7 + 7);
    result.push({
      days: slice.map((d) => ({
        count: d.count,
        level: d.level,
      })),
    });
  }
  return result;
}

/** Returns an array of total miles per week for the last N weeks from raw Strava activities. */
function buildWeeklyMiles(activities: IStravaActivity[], numWeeks: number): number[] {
  const now = Date.now();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const buckets = Array(numWeeks).fill(0);

  for (const act of activities) {
    if (act.type !== 'Run') continue;
    const age = now - new Date(act.start_date).getTime();
    const weekIdx = Math.floor(age / msPerWeek);
    if (weekIdx < numWeeks) {
      buckets[numWeeks - 1 - weekIdx] += metresToMiles(act.distance);
    }
  }

  return buckets.map((v) => Math.round(v * 10) / 10);
}

/* ─── Handler ─────────────────────────────────────────────────────────────────────────────────────────────────────── */

export default defineEventHandler(async (): Promise<IMetricsResponse> => {
  // Serve from cache if fresh
  if (cachedData && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedData;
  }

  const config = useRuntimeConfig();

  // Fall back to process.env directly; Nuxt's runtimeConfig auto-override
  // requires the NUXT_ prefix, but Vercel injects the bare env var names too.
  const stravaClientId = config.stravaClientId || process.env.STRAVA_CLIENT_ID;
  const stravaClientSecret = config.stravaClientSecret || process.env.STRAVA_CLIENT_SECRET;
  const stravaRefreshToken = config.stravaRefreshToken || process.env.STRAVA_REFRESH_TOKEN;

  const year = new Date().getFullYear();

  /* ─── GitHub ─────────────────────────────────────────────────────────────────────────────────────────────────────── */

  const ghRes = await fetch(`https://github-contributions-api.jogruber.de/v4/jens-johnson?y=${year}`).then(
    (r) => r.json() as Promise<IGhContributionsResponse>,
  );

  const totalContributions = ghRes.total[year] ?? 0;
  // Filter out future-dated entries; the API returns the full calendar year,
  // and a naive .slice(-182) would grab months that haven't happened yet.
  const today = new Date().toISOString().slice(0, 10);
  const pastContributions = ghRes.contributions.filter((c) => c.date <= today);
  const weeks = groupIntoWeeks(pastContributions, 26);

  /* ─── Strava token exchange ──────────────────────────────────────────────────────────────────────────────────────── */

  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: stravaClientId,
      client_secret: stravaClientSecret,
      refresh_token: stravaRefreshToken,
      grant_type: 'refresh_token',
    }),
  }).then((r) => r.json());

  if (tokenRes.errors || !tokenRes.access_token) {
    console.error('[metrics] Strava token exchange failed:', JSON.stringify(tokenRes));
    throw createError({
      statusCode: 502,
      message: `Strava auth failed: ${tokenRes.message ?? JSON.stringify(tokenRes)}`,
    });
  }

  const { access_token } = tokenRes as IStravaTokenResponse;

  // Get the authenticated athlete to retrieve their ID
  const athleteRes = await fetch('https://www.strava.com/api/v3/athlete', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  }).then((r) => r.json());

  if (!athleteRes.id) {
    console.error('[metrics] Could not resolve Strava athlete:', JSON.stringify(athleteRes));
    throw createError({
      statusCode: 502,
      message: 'Could not resolve Strava athlete',
    });
  }

  const athleteId: number = athleteRes.id;

  /* ─── Strava stats ───────────────────────────────────────────────────────────────────────────────────────────────── */

  const [statsRes, activitiesRes] = await Promise.all([
    fetch(`https://www.strava.com/api/v3/athletes/${athleteId}/stats`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }).then((r) => r.json() as Promise<IStravaStatsResponse>),

    fetch('https://www.strava.com/api/v3/athlete/activities?per_page=200', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }).then((r) => r.json() as Promise<IStravaActivity[]>),
  ]);

  const data: IMetricsResponse = {
    github: {
      totalContributions,
      weeks,
    },
    strava: {
      ytdMiles: metresToMiles(statsRes.ytd_run_totals.distance),
      ytdRuns: statsRes.ytd_run_totals.count,
      ytdElevationFt: metresToFeet(statsRes.ytd_run_totals.elevation_gain),
      weeklyMiles: buildWeeklyMiles(activitiesRes, 16),
    },
  };

  cachedData = data;
  cacheTimestamp = Date.now();

  return data;
});
