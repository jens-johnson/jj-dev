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
 * █████████████████████████████████████████ #types/jenscraft-metrics/types.ts █████████████████████████████████████████
 *
 * Client-side shape of the `/api/services/jenscraft/metrics` response, consumed by the Jenscraft service dashboard.
 * Mirrors the server public read shape (kept here so app code does not import server-only utils).
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An enumeration of the freshness states of the Jenscraft metrics feed
 * @public
 * @enum
 */
export enum JenscraftMetricsState {
  /* The feed is reporting fresh samples */
  live = 'live',

  /* The latest sample has aged past the freshness window */
  stale = 'stale',

  /* No sample has arrived; the publisher is down */
  offline = 'offline',
}

/**
 * A type representing the freshness state of the Jenscraft metrics feed; one of {@link JenscraftMetricsState}
 * @public
 */
export type TJenscraftMetricsState = `${JenscraftMetricsState}`;

/**
 * An interface representing the player counts reported by the Jenscraft server
 * @interface
 */
export interface IJenscraftPlayers {
  /* The total players currently online */
  online: number;

  /* The maximum player slots */
  max: number;

  /* The players connected via Java edition */
  java: number;

  /* The players connected via Bedrock edition */
  bedrock: number;
}

/**
 * An interface representing the client-facing view of the Jenscraft metrics feed
 * @interface
 */
export interface IJenscraftMetricsView {
  /* The freshness state of the feed */
  state: TJenscraftMetricsState;

  /* The age of the latest sample in seconds, or null when no sample has arrived */
  ageSec: number | null;

  /* The ISO timestamp of the latest sample, or null when none */
  ts: string | null;

  /* The player counts, or null when none */
  players: IJenscraftPlayers | null;

  /* The ticks-per-second figure, or null when none */
  tps: number | null;

  /* The milliseconds-per-tick figure, or null when none */
  mspt: number | null;

  /* The server uptime in seconds, or null when none */
  uptimeSec: number | null;

  /* The world-explored percentage, or null when none */
  world: { exploredPct: number } | null;

  /* The defeated-mob count, or null when none */
  mobs: { defeated: number } | null;
}
