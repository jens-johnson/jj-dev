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
 * ████████████████████████████████████████████████ shared/vertifix.ts █████████████████████████████████████████████████
 *
 * Shared data-transfer types for the Vertifix lab flow. Isomorphic — imported by both the Nitro endpoints
 * under server/api/lab/vertifix and the client composable/widget, so the request/response contracts live in
 * one place.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/* ─── Match candidates ────────────────────────────────────────────────────────────────────────────────────────────── */

/** A Strava run near a photo's capture time, offered to the user as a possible match. */
export interface VertifixCandidate {
  id: number;
  name: string;
  startDate: string;
  distanceMeters: number;
  movingTimeSeconds: number;
  elevationGainMeters: number;
}

/** Response from `GET /api/lab/vertifix/matches`. */
export interface VertifixMatchesResult {
  capturedAt: string;
  candidates: VertifixCandidate[];
}

/* ─── Prepare ─────────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Body for `POST /api/lab/vertifix/prepare`. */
export interface VertifixPrepareRequest {
  activityId: number;
  elevationFeet: number;
}

/** Human-readable summary of what the prepared replacement will contain. */
export interface VertifixSummary {
  name: string;
  description: string;
  startDate: string;
  distanceMeters: number;
  movingTimeSeconds: number;
  currentElevationFeet: number;
  targetElevationFeet: number;
}

/** Response from `POST /api/lab/vertifix/prepare` — the TCX is held by the client until commit. */
export interface VertifixPrepareResult {
  activityId: number;
  tcx: string;
  stravaUrl: string;
  summary: VertifixSummary;
}

/* ─── Commit ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Body for `POST /api/lab/vertifix/commit`. */
export interface VertifixCommitRequest {
  activityId: number;
  tcx: string;
  name: string;
  description: string;
  elevationFeet: number;
  expectedDistanceMeters: number;
}

/** Validation of the re-uploaded activity against the expected metrics. */
export interface VertifixValidation {
  valid: boolean;
  distanceValid: boolean;
  elevationValid: boolean;
  actualDistanceMeters: number;
  actualElevationFeet: number;
}

/** Response from `POST /api/lab/vertifix/commit`. */
export interface VertifixCommitResult {
  ok: boolean;
  replacementActivityId: number;
  validation: VertifixValidation;
}
