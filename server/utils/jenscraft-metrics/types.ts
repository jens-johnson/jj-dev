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
 * █████████████████████████████████████ #server/utils/jenscraft-metrics/types.ts ██████████████████████████████████████
 *
 * Type definitions for the Jenscraft live-metrics server payload and storage record.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { TSubstrateMetricsState } from '#utils/substrate-metrics';

/**
 * An interface representing the validated, public-safe payload the Jenscraft LXC publisher POSTs; counts and
 * percentages only, never identifiers
 * @public
 * @interface
 */
export interface IJenscraftMetricsPayload {
  /* The payload schema version */
  v: number;

  /* The publisher-side timestamp (ISO string) */
  ts: string;

  /* The player counts */
  players?: { online: number; max: number; java: number; bedrock: number };

  /* The ticks-per-second figure */
  tps?: number;

  /* The milliseconds-per-tick figure */
  mspt?: number;

  /* The server uptime in seconds */
  uptimeSec?: number;

  /* The world-explored percentage */
  world?: { exploredPct: number };

  /* The defeated-mob count */
  mobs?: { defeated: number };
}

/**
 * An interface representing the stored record, adding the server receive time (the source of truth for staleness)
 * @public
 * @interface
 */
export interface IStoredJenscraftMetrics extends IJenscraftMetricsPayload {
  /* The server receive time (epoch milliseconds) */
  receivedAt: number;
}

/**
 * An interface representing the public metrics response: the last-known snapshot fields plus the derived freshness
 * state and age; every metric is null until the publisher has stored a snapshot carrying it
 * @public
 * @interface
 */
export interface IJenscraftMetricsResponse {
  /* The derived freshness state of the feed */
  state: TSubstrateMetricsState;

  /* The snapshot age in seconds; null when no snapshot has been stored */
  ageSec: number | null;

  /* The publisher-side timestamp (ISO string); null when no snapshot has been stored */
  ts: string | null;

  /* The player counts; null when absent */
  players: NonNullable<IJenscraftMetricsPayload['players']> | null;

  /* The ticks-per-second figure; null when absent */
  tps: number | null;

  /* The milliseconds-per-tick figure; null when absent */
  mspt: number | null;

  /* The server uptime in seconds; null when absent */
  uptimeSec: number | null;

  /* The world-explored percentage; null when absent */
  world: NonNullable<IJenscraftMetricsPayload['world']> | null;

  /* The defeated-mob count; null when absent */
  mobs: NonNullable<IJenscraftMetricsPayload['mobs']> | null;
}
