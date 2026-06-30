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
 * ███████████████████████████████████████████ server/utils/strava/types.ts ████████████████████████████████████████████
 *
 * Type definitions for the server-only Strava client.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An interface representing a Strava activity; the fields the TCX builder's ITcxSourceActivity needs are a
 * structural subset
 * @interface
 */
export interface IStravaActivity {
  /* The Strava activity id */
  id: number;

  /* The activity name */
  name: string;

  /* The activity start time (UTC ISO string) */
  start_date: string;

  /* The activity start time (local ISO string) */
  start_date_local: string;

  /* The total elapsed time in seconds */
  elapsed_time: number;

  /* The moving time in seconds */
  moving_time: number;

  /* The distance in meters */
  distance: number;

  /* The total elevation gain in meters */
  total_elevation_gain: number;

  /* The Strava sport type */
  sport_type: string;

  /* Whether the activity is flagged as a trainer/treadmill run */
  trainer: boolean;

  /* The optional free-text description */
  description?: string;
}

/**
 * A type representing the minimal activity fields the upload needs; a full IStravaActivity satisfies it too
 * @typedef
 */
export type TUploadActivity = Pick<IStravaActivity, 'id' | 'name' | 'description'>;

/**
 * An interface representing a single Strava data stream payload (`time`, `distance`, `heartrate`, `cadence`, etc.)
 * @interface
 */
export interface IStravaStream {
  /* The stream sample values */
  data: number[];
}

/**
 * A type representing streams keyed by type, as returned with `key_by_type=true`
 * @typedef
 */
export type TStravaStreams = Record<string, IStravaStream | undefined>;

/**
 * An interface representing the response shape from `POST /uploads` and `GET /uploads/{id}`
 * @interface
 */
export interface IStravaUpload {
  /* The upload id */
  id: number;

  /* The created activity id, set once processing completes */
  activity_id?: number;

  /* The error message, set when the upload failed */
  error?: string | null;

  /* The processing status text */
  status?: string;
}

/**
 * An interface representing the outcome of validateReplacement: whether the re-uploaded activity matches expectations
 * @interface
 */
export interface IReplacementValidation {
  /* Whether both distance and elevation are within tolerance */
  valid: boolean;

  /* Whether the distance is within tolerance */
  distanceValid: boolean;

  /* Whether the elevation is within tolerance */
  elevationValid: boolean;

  /* The expected distance in meters */
  expectedDistanceMeters: number;

  /* The actual distance in meters */
  actualDistanceMeters: number;

  /* The expected elevation gain in feet */
  expectedElevationFeet: number;

  /* The actual elevation gain in feet */
  actualElevationFeet: number;
}
