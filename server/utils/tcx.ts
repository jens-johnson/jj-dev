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
 * ████████████████████████████████████████████████ server/utils/tcx.ts ████████████████████████████████████████████████
 *
 * Pure builder that re-renders a Strava activity as a Garmin TCX file with a corrected elevation gain,
 * preserving the original time, distance, heart-rate, and cadence streams. Treadmill runs sync to Strava
 * with zero vertical gain; Vertifix injects a steady incline so the elevation metric is restored before
 * the activity is re-uploaded. Pure and side-effect free — no Strava calls, no I/O — so it is unit-tested.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://developers.strava.com/docs/uploads/
 * • https://www8.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/* ─── Types ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

/** The subset of a Strava activity that {@link buildTcx} reads. JEN-71's `StravaActivity` is structurally assignable. */
export interface TcxSourceActivity {
  /** ISO 8601 start time of the activity. */
  start_date: string;
  /** Total elapsed time, in seconds. */
  elapsed_time: number;
  /** Total distance, in metres. */
  distance: number;
  /** Optional free-text description, copied into the TCX `<Notes>` element. */
  description?: string;
}

/** A single Strava data stream (e.g. `time`, `distance`, `heartrate`, `cadence`). */
export interface TcxStream {
  data: number[];
}

/** Map of stream key to payload, as returned by the Strava activity streams endpoint. */
export type TcxStreams = Record<string, TcxStream | undefined>;

/* ─── Constants ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/** Feet → metres. */
const FEET_TO_METRES = 0.3048;

/** XML entities that must be escaped inside the generated TCX document. */
const XML_ENTITIES: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;',
};

/* ─── Helpers ─────────────────────────────────────────────────────────────────────────────────────────────────────── */

/** XML-escapes a value for safe interpolation into the TCX document. */
function escapeXml(value: unknown): string {
  return String(value ?? '').replace(/[<>&'"]/g, (character) => XML_ENTITIES[character] ?? character);
}

/* ─── Builder ─────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Builds a Garmin TCX document for `activity` with its elevation gain forced to `elevationFeet`.
 *
 * Altitude ramps linearly from zero to the target gain across the run, modelling the steady incline of a
 * treadmill. Distance is taken from the distance stream (scaled to the activity total) and falls back to a
 * linear interpolation from elapsed time when no stream is present; heart-rate and cadence are carried
 * through per trackpoint when available and omitted otherwise.
 */
export function buildTcx(activity: TcxSourceActivity, streams: TcxStreams, elevationFeet: number): string {
  const times = streams.time?.data ?? [0, activity.elapsed_time];
  const rawDistances = streams.distance?.data;
  const rawDistanceEnd = rawDistances?.at(-1) ?? 0;
  const distances =
    rawDistances && rawDistanceEnd > 0
      ? rawDistances.map((distance) => (distance * activity.distance) / rawDistanceEnd)
      : times.map((time) => activity.distance * (time / Math.max(activity.elapsed_time, 1)));

  const heartRates = streams.heartrate?.data;
  const cadences = streams.cadence?.data;
  const start = new Date(activity.start_date);
  const gainMetres = elevationFeet * FEET_TO_METRES;
  const lastTime = Math.max(times.at(-1) ?? activity.elapsed_time, 1);

  const trackpoints = times
    .map((time, index) => {
      const timestamp = new Date(start.getTime() + time * 1000).toISOString();
      const altitude = gainMetres * (time / lastTime);
      const distance = distances[index] ?? (activity.distance * time) / lastTime;
      const heartRate = heartRates?.[index];
      const cadence = cadences?.[index];

      const parts = [
        '<Trackpoint>',
        `<Time>${timestamp}</Time>`,
        `<AltitudeMeters>${altitude.toFixed(2)}</AltitudeMeters>`,
        `<DistanceMeters>${distance.toFixed(2)}</DistanceMeters>`,
      ];
      if (heartRate) parts.push(`<HeartRateBpm><Value>${Math.round(heartRate)}</Value></HeartRateBpm>`);
      if (cadence) parts.push(`<Cadence>${Math.round(cadence)}</Cadence>`);
      parts.push('</Trackpoint>');

      return parts.join('');
    })
    .join('');

  const document = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"' +
      ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">',
    '<Activities>',
    '<Activity Sport="Running">',
    `<Id>${start.toISOString()}</Id>`,
    `<Lap StartTime="${start.toISOString()}">`,
    `<TotalTimeSeconds>${activity.elapsed_time}</TotalTimeSeconds>`,
    `<DistanceMeters>${activity.distance}</DistanceMeters>`,
    '<MaximumSpeed>0</MaximumSpeed>',
    '<Calories>0</Calories>',
    '<Intensity>Active</Intensity>',
    '<TriggerMethod>Manual</TriggerMethod>',
    `<Track>${trackpoints}</Track>`,
    '</Lap>',
    `<Notes>${escapeXml(activity.description ?? '')}</Notes>`,
    '<Creator xsi:type="Device_t">',
    // ⚠️ DO NOT remove "barometer" from this name. Strava only honours uploaded <AltitudeMeters>
    // when it believes the recording device has a barometric altimeter — the literal word
    // "barometer" in the device name is how that is signalled. Without it, Strava recomputes
    // elevation from GPS (which a treadmill run has none of) and the activity lands at 0 ft.
    // Proven against the working prototype: identical TCX, only the device name differed.
    '<Name>Vertifix with barometer</Name>',
    '<UnitId>0</UnitId>',
    '<ProductID>0</ProductID>',
    '<Version><VersionMajor>1</VersionMajor><VersionMinor>0</VersionMinor>' +
      '<BuildMajor>0</BuildMajor><BuildMinor>0</BuildMinor></Version>',
    '</Creator>',
    '</Activity>',
    '</Activities>',
    '</TrainingCenterDatabase>',
  ];

  return document.join('');
}
