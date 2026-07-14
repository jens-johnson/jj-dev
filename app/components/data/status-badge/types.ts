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
 * ██████████████████████████████████████ #components/data/status-badge/types.ts ███████████████████████████████████████
 *
 * Type definitions for the status badge component: the props contract and the per-status visual treatment shape.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The props accepted by the status badge; the status value is optional and unknown values fall back to a neutral badge
 * @public
 * @interface
 */
export interface IStatusBadgeProps {
  /* The content status to render; active | wip | archived, or any raw value for the neutral fallback */
  status?: string;
}

/**
 * The visual treatment rendered for a status: the human-readable label and the Tailwind color classes
 * @public
 * @interface
 */
export interface IStatusBadgeVisual {
  /* The human-readable label rendered inside the badge */
  label: string;

  /* The Tailwind background/text color classes applied to the badge */
  cls: string;
}
