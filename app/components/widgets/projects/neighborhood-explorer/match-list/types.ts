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
 * ██████████████████████ #components/widgets/projects/neighborhood-explorer/match-list/types.ts ███████████████████████
 *
 * Prop and emit types for the neighborhood explorer match list.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { INeighborhoodMatch } from '#shared/neighborhood-explorer';

/**
 * An interface representing the match list's props
 * @public
 * @interface
 */
export interface INeighborhoodMatchListProps {
  /* The ranked matches, most similar first */
  matches: INeighborhoodMatch[];

  /* The origin's display name, for the "vs" labels */
  originName: string;

  /* The id of the expanded match, or null */
  selectedId: string | null;
}

/**
 * An interface representing the match list's emits
 * @public
 * @interface
 */
export interface INeighborhoodMatchListEmits {
  /* Fired when a match is picked; the page expands it and flies the map there */
  select: [match: INeighborhoodMatch];

  /* Fired when the user makes a match the new origin */
  compare: [placeId: string];
}
