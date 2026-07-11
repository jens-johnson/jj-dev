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
 * ████████████████████████████████ #components/widgets/lab/substrate-overview/types.ts ████████████████████████████████
 *
 * Type definitions for the substrate overview tab: the phase-status enum, its derived union, and the roadmap shapes.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An enumeration of the roadmap phase statuses
 * @public
 * @enum
 */
export enum PhaseStatus {
  /* Not yet scheduled; a later ambition */
  future = 'future',

  /* Queued up after the in-progress work */
  next = 'next',

  /* Scheduled but not yet started */
  planned = 'planned',

  /* Actively being built */
  progress = 'progress',
}

/**
 * A type representing a roadmap phase status; one of {@link PhaseStatus}
 * @public
 */
export type TPhaseStatus = `${PhaseStatus}`;

/**
 * A single phase on the roadmap timeline
 * @public
 * @interface
 */
export interface IPhase {
  /* The phase title, e.g. "Network & edge" */
  title: string;

  /* The one-line phase description */
  desc: string;

  /* The phase status; drives the badge visuals */
  status: TPhaseStatus;
}

/**
 * The visual treatment for a phase status badge
 * @public
 * @interface
 */
export interface IPhaseStatusVisual {
  /* The badge label */
  label: string;

  /* The background class for the status dot */
  dot: string;

  /* The text class for the badge label */
  text: string;

  /* The background tint class for the badge pill */
  tint: string;
}
