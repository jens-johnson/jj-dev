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
 * █████████████████████████████████████ #composables/use-vertifix-upload/enums.ts █████████████████████████████████████
 *
 * The stage enumeration for a Vertifix item as it moves through the flow.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An enumeration of the stages a Vertifix item moves through as it works its way through the flow
 * @public
 * @enum
 */
export enum VertifixStatus {
  /* The photo's EXIF capture time is being read */
  reading = 'reading',

  /* Read; ready to search Strava for matching runs */
  ready = 'ready',

  /* Searching Strava for runs near the capture time */
  matching = 'matching',

  /* Candidate runs have been returned */
  matched = 'matched',

  /* Requesting a corrected-elevation TCX for the selected activity */
  preparing = 'preparing',

  /* The corrected-elevation TCX is ready to commit */
  prepared = 'prepared',

  /* Posting the prepared TCX to the commit endpoint */
  committing = 'committing',

  /* The re-upload committed successfully */
  done = 'done',

  /* The item hit an error and can be retried */
  error = 'error',
}
