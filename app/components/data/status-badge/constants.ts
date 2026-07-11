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
 * ████████████████████████████████████ #components/data/status-badge/constants.ts █████████████████████████████████████
 *
 * Constants for the status badge component: the status-to-visual-treatment lookup.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { IStatusBadgeVisual } from './types';

/**
 * The visual treatment (label and Tailwind color classes) for each known content status; statuses missing from this
 * lookup render as a neutral badge showing the raw value
 * @public
 * @constant
 */
export const BADGE_VISUAL_BY_STATUS: Record<string, IStatusBadgeVisual> = {
  active: {
    label: 'Active',
    cls: 'bg-accent/10 text-accent',
  },
  wip: {
    label: 'In progress',
    cls: 'bg-earth-300/20 text-earth-500',
  },
  archived: {
    label: 'Archived',
    cls: 'bg-surface text-ink-subtle',
  },
};
