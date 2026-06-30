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
 * █████████████████████████████████████████████ server/utils/tcx/types.ts █████████████████████████████████████████████
 *
 * Type definitions for the TCX builder.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An interface representing the subset of a Strava activity that buildTcx reads; IStravaActivity is structurally
 * assignable to it
 * @interface
 */
export interface ITcxSourceActivity {
  /* The ISO 8601 start time of the activity */
  start_date: string;

  /* The total elapsed time, in seconds */
  elapsed_time: number;

  /* The total distance, in meters */
  distance: number;

  /* The optional free-text description, copied into the TCX <Notes> element */
  description?: string;
}

/**
 * An interface representing a single Strava data stream (e.g. `time`, `distance`, `heartrate`, `cadence`)
 * @interface
 */
export interface ITcxStream {
  /* The stream sample values */
  data: number[];
}

/**
 * A type representing a map of stream key to payload, as returned by the Strava activity streams endpoint
 * @typedef
 */
export type TTcxStreams = Record<string, ITcxStream | undefined>;
