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
 * ██████████████████████████████ #components/widgets/lab/substrate-overview/constants.ts ██████████████████████████████
 *
 * Constants for the substrate overview tab: the badge visuals for each roadmap phase status.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { IPhaseStatusVisual, TPhaseStatus } from './types';

/**
 * The badge visuals for each roadmap phase status. In progress reads as the green/success state; Up next keeps the
 * bronze accent so the two stay distinct
 * @public
 * @constant
 */
export const PHASE_STATUS_VISUALS: Record<TPhaseStatus, IPhaseStatusVisual> = {
  progress: {
    label: 'In progress',
    dot: 'bg-accent-secondary',
    text: 'text-accent-secondary',
    tint: 'bg-accent-secondary/10',
  },
  next: {
    label: 'Up next',
    dot: 'bg-accent',
    text: 'text-accent',
    tint: 'bg-accent/10',
  },
  planned: {
    label: 'Planned',
    dot: 'bg-ink-subtle',
    text: 'text-ink-subtle',
    tint: 'bg-ink-subtle/10',
  },
  future: {
    label: 'Future',
    dot: 'bg-ink-subtle',
    text: 'text-ink-subtle',
    tint: 'bg-ink-subtle/10',
  },
};
