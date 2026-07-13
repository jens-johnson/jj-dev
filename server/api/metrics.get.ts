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
 * Responses are cached for CACHE_MAX_AGE_SECONDS via Nitro's cache to avoid hammering third-party APIs on every load.
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
 *   • Caches the aggregated response via Nitro's cache for CACHE_MAX_AGE_SECONDS
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • https://developers.strava.com/docs/reference/
 *   • https://github-contributions-api.jogruber.de/
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { metersToFeet, metersToMiles } from '#shared/utils/units';
import type {
  IGhContribution,
  IGhContributionsResponse,
  IMetricsResponse,
  IMetricsWeek,
  IStravaActivitySummary,
  IStravaStatsResponse,
  IStravaTokenResponse,
} from '#utils/metrics';

/**
 * Fetches and aggregates the about-page metrics (GitHub contributions plus Strava run stats). Wrapped in Nitro's
 * cache so the upstream APIs are only hit once per CACHE_MAX_AGE_SECONDS; a thrown 502 is never cached, so a failed
 * fetch is retried on the next request
 * @internal
 * @function
 * @throws 502 when the GitHub contributions fetch fails
 * @throws 502 when the Strava token exchange fails
 * @throws 502 when the authenticated Strava athlete cannot be resolved
 * @throws 502 when the Strava stats or activities fetch fails
 * @returns The GitHub contribution weeks plus Strava year-to-date run totals and the weekly-mileage series
 */
const fetchAboutMetrics = defineCachedFunction(
  async (): Promise<IMetricsResponse> => {
    // Resolve the Strava credentials from server-only runtime config, falling back to process.env directly;
    // Nuxt's runtimeConfig auto-override requires the NUXT_ prefix, but Vercel injects the bare env var names too.
    const config: ReturnType<typeof useRuntimeConfig> = useRuntimeConfig();
    const stravaClientId: string | undefined = config.stravaClientId || process.env.STRAVA_CLIENT_ID;
    const stravaClientSecret: string | undefined = config.stravaClientSecret || process.env.STRAVA_CLIENT_SECRET;
    const stravaRefreshToken: string | undefined = config.stravaRefreshToken || process.env.STRAVA_REFRESH_TOKEN;

    const year: number = new Date().getFullYear();

    /* ─── GitHub ─────────────────────────────────────────────────────────────────────────────────────────────────── */

    // Fetch the current calendar year of contribution activity from the GitHub contributions API
    const ghRes: IGhContributionsResponse = await runUpstream(
      fetch(`https://github-contributions-api.jogruber.de/v4/jens-johnson?y=${year}`).then(
        (response: Response): Promise<IGhContributionsResponse> => response.json(),
      ),
      'The GitHub contributions fetch failed.',
    );

    const totalContributions: number = ghRes.total[year] ?? 0;

    // Filter out future-dated entries; the API returns the full calendar year, and a naive slice would grab
    // months that haven't happened yet.
    const today: string = new Date().toISOString().slice(0, 10);
    const pastContributions: IGhContribution[] = ghRes.contributions.filter(
      (contribution: IGhContribution): boolean => contribution.date <= today,
    );
    const weeks: IMetricsWeek[] = groupIntoWeeks(pastContributions, CONTRIBUTION_WEEKS);

    /* ─── Strava token exchange ──────────────────────────────────────────────────────────────────────────────────── */

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
      }).then(
        (response: Response): Promise<Partial<IStravaTokenResponse> & { errors?: unknown; message?: string }> =>
          response.json(),
      ),
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
      }).then((response: Response): Promise<{ id?: number }> => response.json()),
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

    /* ─── Strava stats ───────────────────────────────────────────────────────────────────────────────────────────── */

    // Fetch the aggregate run totals and the recent-activity list in parallel
    const [statsRes, activitiesRes]: [IStravaStatsResponse, IStravaActivitySummary[]] = await Promise.all([
      runUpstream(
        fetch(`https://www.strava.com/api/v3/athletes/${athleteId}/stats`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }).then((response: Response): Promise<IStravaStatsResponse> => response.json()),
        'The Strava stats fetch failed.',
      ),

      runUpstream(
        fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=${STRAVA_ACTIVITY_PAGE_SIZE}`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }).then((response: Response): Promise<IStravaActivitySummary[]> => response.json()),
        'The Strava activities fetch failed.',
      ),
    ]);

    // Assemble the payload: contribution weeks for the heatmap, run totals and weekly miles for the sparkline
    return {
      github: {
        totalContributions,
        weeks,
      },
      strava: {
        ytdMiles: metersToMiles(statsRes.ytd_run_totals.distance),
        ytdRuns: statsRes.ytd_run_totals.count,
        ytdElevationFt: metersToFeet(statsRes.ytd_run_totals.elevation_gain),
        weeklyMiles: buildWeeklyMiles(activitiesRes, MILEAGE_WEEKS),
      },
    };
  },
  {
    maxAge: CACHE_MAX_AGE_SECONDS,
    name: 'about-metrics',
    getKey: (): string => 'about-metrics',
  },
);

/**
 * Aggregates GitHub contribution data and Strava year-to-date run stats for the about page metrics card, serving the
 * cached aggregate when it is fresh
 * @public
 * @default
 * @function
 * @throws 502 when the GitHub contributions fetch fails
 * @throws 502 when the Strava token exchange fails
 * @throws 502 when the authenticated Strava athlete cannot be resolved
 * @throws 502 when the Strava stats or activities fetch fails
 * @returns The GitHub contribution weeks plus Strava year-to-date run totals and the weekly-mileage series
 */
export default defineEventHandler((): Promise<IMetricsResponse> => fetchAboutMetrics());
