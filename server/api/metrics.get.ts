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
 * ████████████████████████████████████████████ #server/api/metrics.get.ts █████████████████████████████████████████████
 *
 * Server API route that aggregates GitHub contribution data and Strava activity stats for the about page metrics card.
 * Strava credentials never reach the client; all token exchange and API calls happen here in the Nitro server layer.
 * Responses are cached in-process for 1 hour to avoid hammering third-party APIs on every page load.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * GET /api/metrics
 *
 * ─── RETURNS ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • IMetricsResponse: GitHub contribution weeks plus Strava year-to-date run totals and a weekly-mileage series
 *
 * ─── THROWS ──────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • 502 when the GitHub contributions fetch fails
 *   • 502 when the Strava token exchange fails
 *   • 502 when the authenticated Strava athlete cannot be resolved
 *   • 502 when the Strava stats or activities fetch fails
 *
 * ─── SIDE EFFECTS ────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • Caches the aggregated response in-process for 1 hour
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • https://developers.strava.com/docs/reference/
 *   • https://github-contributions-api.jogruber.de/
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { metersToFeet, metersToMiles } from '#shared/utils/units';

/* ─── Types ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A single day of GitHub contribution activity from the contributions API
 * @internal
 * @interface
 */
interface IGhContribution {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

/**
 * The response shape of the GitHub contributions API; per-year totals plus the per-day contribution list
 * @internal
 * @interface
 */
interface IGhContributionsResponse {
  total: Record<string, number>;
  contributions: IGhContribution[];
}

/**
 * The response shape of the Strava OAuth refresh-token exchange
 * @internal
 * @interface
 */
interface IStravaTokenResponse {
  access_token: string;
  athlete: { id: number };
}

/**
 * An aggregate run-totals block from the Strava athlete stats endpoint
 * @internal
 * @interface
 */
interface IStravaTotals {
  count: number;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number;
  elevation_gain: number;
}

/**
 * The response shape of the Strava athlete stats endpoint; recent, year-to-date, and all-time run totals
 * @internal
 * @interface
 */
interface IStravaStatsResponse {
  ytd_run_totals: IStravaTotals;
  all_run_totals: IStravaTotals;
  recent_run_totals: IStravaTotals;
}

/**
 * A Strava activity summary; only the fields the weekly-mileage bucketing reads
 * @internal
 * @interface
 */
interface IStravaActivity {
  id: number;
  name: string;
  type: string;
  start_date: string;
  distance: number; // meters
  moving_time: number; // seconds
}

/**
 * One week of GitHub contribution activity; seven days of counts and intensity levels
 * @public
 * @interface
 */
export interface IMetricsWeek {
  days: { count: number; level: 0 | 1 | 2 | 3 | 4 }[];
}

/**
 * The aggregated payload this route returns; GitHub contribution weeks plus Strava year-to-date run stats
 * @public
 * @interface
 */
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

/**
 * Groups a flat array of daily contributions into ISO weeks (Mon–Sun), newest last
 * @internal
 * @function
 * @param contributions - The per-day contribution list, oldest first
 * @param numWeeks - The number of trailing weeks to keep
 * @returns The trailing weeks, each with seven days of counts and intensity levels
 */
function groupIntoWeeks(contributions: IGhContribution[], numWeeks: number): IMetricsWeek[] {
  // Pad the contributions array so it starts on a Monday
  const result: IMetricsWeek[] = [];
  const days = contributions.slice(-(numWeeks * 7));

  for (let w = 0; w < numWeeks; w++) {
    const slice = days.slice(w * 7, w * 7 + 7);
    result.push({
      days: slice.map((d: IGhContribution): { count: number; level: 0 | 1 | 2 | 3 | 4 } => ({
        count: d.count,
        level: d.level,
      })),
    });
  }
  return result;
}

/**
 * Buckets raw Strava activities into total run miles per week for the last N weeks
 * @internal
 * @function
 * @param activities - The raw Strava activity summaries, any type, newest first
 * @param numWeeks - The number of trailing weeks to bucket
 * @returns The total run miles per week, oldest week first
 */
function buildWeeklyMiles(activities: IStravaActivity[], numWeeks: number): number[] {
  const now = Date.now();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const buckets = Array(numWeeks).fill(0);

  for (const act of activities) {
    if (act.type !== 'Run') {
      continue;
    }
    const age = now - new Date(act.start_date).getTime();
    const weekIdx = Math.floor(age / msPerWeek);
    if (weekIdx < numWeeks) {
      buckets[numWeeks - 1 - weekIdx] += metersToMiles(act.distance);
    }
  }

  return buckets.map((v: number): number => Math.round(v * 10) / 10);
}

/* ─── Handler ─────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Aggregates GitHub contribution data and Strava year-to-date run stats for the about page metrics card, serving the
 * in-process cache when it is fresh
 * @public
 * @default
 * @function
 * @throws 502 when the GitHub contributions fetch fails
 * @throws 502 when the Strava token exchange fails
 * @throws 502 when the authenticated Strava athlete cannot be resolved
 * @throws 502 when the Strava stats or activities fetch fails
 * @returns The GitHub contribution weeks plus Strava year-to-date run totals and the weekly-mileage series
 */
export default defineEventHandler(async (): Promise<IMetricsResponse> => {
  // Serve from cache if fresh
  if (cachedData && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedData;
  }

  // Resolve the Strava credentials from server-only runtime config, falling back to process.env directly;
  // Nuxt's runtimeConfig auto-override requires the NUXT_ prefix, but Vercel injects the bare env var names too.
  const config = useRuntimeConfig();
  const stravaClientId: string | undefined = config.stravaClientId || process.env.STRAVA_CLIENT_ID;
  const stravaClientSecret: string | undefined = config.stravaClientSecret || process.env.STRAVA_CLIENT_SECRET;
  const stravaRefreshToken: string | undefined = config.stravaRefreshToken || process.env.STRAVA_REFRESH_TOKEN;

  const year: number = new Date().getFullYear();

  /* ─── GitHub ─────────────────────────────────────────────────────────────────────────────────────────────────────── */

  // Fetch the current calendar year of contribution activity from the GitHub contributions API
  const ghRes: IGhContributionsResponse = await runUpstream(
    fetch(`https://github-contributions-api.jogruber.de/v4/jens-johnson?y=${year}`).then(
      (r: Response): Promise<IGhContributionsResponse> => r.json(),
    ),
    'The GitHub contributions fetch failed.',
  );

  const totalContributions: number = ghRes.total[year] ?? 0;

  // Filter out future-dated entries; the API returns the full calendar year,
  // and a naive .slice(-182) would grab months that haven't happened yet.
  const today: string = new Date().toISOString().slice(0, 10);
  const pastContributions: IGhContribution[] = ghRes.contributions.filter(
    (c: IGhContribution): boolean => c.date <= today,
  );
  const weeks: IMetricsWeek[] = groupIntoWeeks(pastContributions, 26);

  /* ─── Strava token exchange ──────────────────────────────────────────────────────────────────────────────────────── */

  // Exchange the long-lived refresh token for a short-lived access token
  const tokenRes: Partial<IStravaTokenResponse> & { errors?: unknown; message?: string } = await runUpstream(
    fetch('https://www.strava.com/oauth/token', {
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
    }).then((r: Response): Promise<Partial<IStravaTokenResponse> & { errors?: unknown; message?: string }> => r.json()),
    'The Strava token exchange failed.',
  );

  // A failed exchange (bad credentials, revoked token) surfaces as a 502; the upstream API is the failing party
  if (tokenRes.errors || !tokenRes.access_token) {
    console.error('[metrics] Strava token exchange failed:', JSON.stringify(tokenRes));
    throw createError({
      statusCode: 502,
      message: `Strava auth failed: ${tokenRes.message ?? JSON.stringify(tokenRes)}`,
    });
  }

  const { access_token }: IStravaTokenResponse = tokenRes as IStravaTokenResponse;

  // Get the authenticated athlete to retrieve their ID
  const athleteRes: { id?: number } = await runUpstream(
    fetch('https://www.strava.com/api/v3/athlete', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }).then((r: Response): Promise<{ id?: number }> => r.json()),
    'The Strava athlete lookup failed.',
  );

  // An unresolvable athlete also surfaces as a 502; the token was accepted but the profile lookup failed
  if (!athleteRes.id) {
    console.error('[metrics] Could not resolve Strava athlete:', JSON.stringify(athleteRes));
    throw createError({
      statusCode: 502,
      message: 'Could not resolve Strava athlete',
    });
  }

  const athleteId: number = athleteRes.id;

  /* ─── Strava stats ───────────────────────────────────────────────────────────────────────────────────────────────── */

  // Fetch the aggregate run totals and the recent-activity list in parallel
  const [statsRes, activitiesRes]: [IStravaStatsResponse, IStravaActivity[]] = await Promise.all([
    runUpstream(
      fetch(`https://www.strava.com/api/v3/athletes/${athleteId}/stats`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }).then((r: Response): Promise<IStravaStatsResponse> => r.json()),
      'The Strava stats fetch failed.',
    ),

    runUpstream(
      fetch('https://www.strava.com/api/v3/athlete/activities?per_page=200', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }).then((r: Response): Promise<IStravaActivity[]> => r.json()),
      'The Strava activities fetch failed.',
    ),
  ]);

  // Assemble the payload: contribution weeks for the heatmap, run totals and weekly miles for the sparkline
  const data: IMetricsResponse = {
    github: {
      totalContributions,
      weeks,
    },
    strava: {
      ytdMiles: metersToMiles(statsRes.ytd_run_totals.distance),
      ytdRuns: statsRes.ytd_run_totals.count,
      ytdElevationFt: metersToFeet(statsRes.ytd_run_totals.elevation_gain),
      weeklyMiles: buildWeeklyMiles(activitiesRes, 16),
    },
  };

  // Refresh the in-process cache before returning
  cachedData = data;
  cacheTimestamp = Date.now();

  return data;
});
