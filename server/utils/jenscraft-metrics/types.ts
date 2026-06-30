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
 * ██████████████████████████████████████ server/utils/jenscraft-metrics/types.ts ██████████████████████████████████████
 *
 * Type definitions for the Jenscraft live-metrics server payload and storage record.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An interface representing the validated, public-safe payload the Jenscraft LXC publisher POSTs; counts and
 * percentages only, never identifiers
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
 * @interface
 */
export interface IStoredJenscraftMetrics extends IJenscraftMetricsPayload {
  /* The server receive time (epoch milliseconds) */
  receivedAt: number;
}
