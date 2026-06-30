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
 * █████████████████████████████████████████████ shared/vertifix/types.ts ██████████████████████████████████████████████
 *
 * Shared data-transfer types for the Vertifix lab flow. Isomorphic; imported by both the Nitro endpoints under
 * server/api/lab/vertifix and the client composable/widget, so the request/response contracts live in one place.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/* ─── Match candidates ───────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * An interface representing a Strava run near a photo capture time, offered to the user as a possible match
 * @interface
 */
export interface IVertifixCandidate {
  /* The Strava activity id */
  id: number;

  /* The activity name */
  name: string;

  /* The activity start date (ISO string) */
  startDate: string;

  /* The activity distance in meters */
  distanceMeters: number;

  /* The activity moving time in seconds */
  movingTimeSeconds: number;

  /* The activity elevation gain in meters */
  elevationGainMeters: number;
}

/**
 * An interface representing the response from GET /api/lab/vertifix/matches
 * @interface
 */
export interface IVertifixMatchesResult {
  /* The photo capture timestamp (ISO string) used to find candidates */
  capturedAt: string;

  /* The candidate activities near the capture time */
  candidates: IVertifixCandidate[];
}

/* ─── Prepare ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * An interface representing the body for POST /api/lab/vertifix/prepare
 * @interface
 */
export interface IVertifixPrepareRequest {
  /* The chosen Strava activity id */
  activityId: number;

  /* The corrected elevation in feet */
  elevationFeet: number;
}

/**
 * An interface representing a human-readable summary of what the prepared replacement will contain
 * @interface
 */
export interface IVertifixSummary {
  /* The activity name */
  name: string;

  /* The activity description */
  description: string;

  /* The activity start date (ISO string) */
  startDate: string;

  /* The activity distance in meters */
  distanceMeters: number;

  /* The activity moving time in seconds */
  movingTimeSeconds: number;

  /* The current elevation gain in feet, before correction */
  currentElevationFeet: number;

  /* The target elevation gain in feet, after correction */
  targetElevationFeet: number;
}

/**
 * An interface representing the response from POST /api/lab/vertifix/prepare; the TCX is held by the client until commit
 * @interface
 */
export interface IVertifixPrepareResult {
  /* The prepared Strava activity id */
  activityId: number;

  /* The generated TCX payload, held client-side until commit */
  tcx: string;

  /* The Strava activity URL */
  stravaUrl: string;

  /* The human-readable summary of the prepared replacement */
  summary: IVertifixSummary;
}

/* ─── Commit ─────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * An interface representing the body for POST /api/lab/vertifix/commit
 * @interface
 */
export interface IVertifixCommitRequest {
  /* The Strava activity id being replaced */
  activityId: number;

  /* The TCX payload to upload */
  tcx: string;

  /* The activity name to apply */
  name: string;

  /* The activity description to apply */
  description: string;

  /* The corrected elevation in feet */
  elevationFeet: number;

  /* The expected distance in meters, used to validate the re-upload */
  expectedDistanceMeters: number;
}

/**
 * An interface representing validation of the re-uploaded activity against the expected metrics
 * @interface
 */
export interface IVertifixValidation {
  /* Whether the re-upload passed all validation checks */
  valid: boolean;

  /* Whether the actual distance matched the expected distance */
  distanceValid: boolean;

  /* Whether the actual elevation matched the target elevation */
  elevationValid: boolean;

  /* The actual distance of the re-upload in meters */
  actualDistanceMeters: number;

  /* The actual elevation gain of the re-upload in feet */
  actualElevationFeet: number;
}

/**
 * An interface representing the response from POST /api/lab/vertifix/commit
 * @interface
 */
export interface IVertifixCommitResult {
  /* Whether the commit succeeded */
  ok: boolean;

  /* The id of the newly created replacement activity */
  replacementActivityId: number;

  /* The validation result for the re-uploaded activity */
  validation: IVertifixValidation;
}
