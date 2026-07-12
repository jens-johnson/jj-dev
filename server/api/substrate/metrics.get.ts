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
 * ███████████████████████████████████████ #server/api/substrate/metrics.get.ts ████████████████████████████████████████
 *
 * Public read for the Substrate widgets. Returns the last-known payload plus a derived state (live | stale | offline)
 * and its age. Renders last-known stats when the lab is quiet; never reveals why it might be offline.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * GET /api/substrate/metrics
 *
 * ─── RETURNS ─────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • The last-known payload (node, guests, storage, internet) plus the derived freshness state, age, and history
 *   • An all-null payload with state 'offline' (history still included) when nothing has been stored yet
 *
 * ─── THROWS ──────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • 502 when reading the stored metrics or the sparkline history fails
 *
 * ─── SIDE EFFECTS ────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • Sets a short-lived Cache-Control header (public, max-age=5, s-maxage=15)
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { H3Event } from 'h3';

import type {
  IStoredSubstrateMetrics,
  ISubstrateMetricsPayload,
  ISubstrateMetricsSample,
  TSubstrateMetricsState,
} from '#utils/substrate-metrics';

/**
 * An interface representing the public metrics response: the last-known payload fields plus the derived freshness
 * state, age, and the rolling sparkline history; the payload fields are null until a push has been stored
 * @internal
 * @interface
 */
interface ISubstrateMetricsResponse {
  /* The derived freshness state of the feed */
  state: TSubstrateMetricsState;

  /* The payload age in seconds; null when no payload has been stored */
  ageSec: number | null;

  /* The publisher-side timestamp (ISO string); null when no payload has been stored */
  ts: string | null;

  /* The compute-node sample; null when no payload has been stored */
  node: ISubstrateMetricsPayload['node'] | null;

  /* The guest counts; null when no payload has been stored */
  guests: ISubstrateMetricsPayload['guests'] | null;

  /* The storage usage percentage; null when absent */
  storage: NonNullable<ISubstrateMetricsPayload['storage']> | null;

  /* The internet-edge reachability + latency; null when absent */
  internet: NonNullable<ISubstrateMetricsPayload['internet']> | null;

  /* The rolling CPU/memory history for the sparklines (empty when none) */
  history: ISubstrateMetricsSample[];
}

/**
 * Serves the public Substrate metrics read: the last-known payload plus a derived freshness state (live | stale |
 * offline), its age, and the rolling sparkline history, falling back to an all-null offline shape (history still
 * included) when nothing has been stored yet
 * @public
 * @default
 * @function
 * @param event - The incoming request event
 * @throws 502 when reading the stored metrics or the sparkline history fails
 * @returns The last-known payload fields plus the derived freshness state, age, and history
 */
export default defineEventHandler(async (event: H3Event): Promise<ISubstrateMetricsResponse> => {
  // Cache briefly at the edge; the feed only refreshes on the publisher's push cadence anyway
  setResponseHeader(event, 'Cache-Control', 'public, max-age=5, s-maxage=15');

  // Read the last-known payload and the sparkline history together; an empty store renders as offline
  const [stored, history]: [IStoredSubstrateMetrics | null, ISubstrateMetricsSample[]] = await Promise.all([
    runUpstream(readLatestMetrics(), 'Reading the stored metrics failed.'),
    runUpstream(readHistory(), 'Reading the metrics history failed.'),
  ]);
  if (!stored) {
    return {
      state: 'offline' as const,
      ageSec: null,
      ts: null,
      node: null,
      guests: null,
      storage: null,
      internet: null,
      history,
    };
  }

  // Derive freshness from the server receive time, then surface the payload with absent blocks nulled
  const { state, ageSec }: { state: TSubstrateMetricsState; ageSec: number } = metricsState(stored.receivedAt);
  return {
    state,
    ageSec,
    ts: stored.ts,
    node: stored.node,
    guests: stored.guests,
    storage: stored.storage ?? null,
    internet: stored.internet ?? null,
    history,
  };
});
