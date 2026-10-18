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
 * █████████████████████ #components/widgets/projects/neighborhood-explorer/origin-search/types.ts █████████████████████
 *
 * Prop and emit types for the neighborhood explorer origin search.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { INeighborhoodPlaceSummary } from '#shared/neighborhood-explorer';

/**
 * An interface representing the origin search's props
 * @public
 * @interface
 */
export interface INeighborhoodOriginSearchProps {
  /* The current origin, shown until the user starts typing; null while the first response loads */
  origin: INeighborhoodPlaceSummary | null;

  /* The place search, injected so the component stays free of API wiring */
  search: (query: string) => Promise<INeighborhoodPlaceSummary[]>;
}

/**
 * An interface representing the origin search's emits
 * @public
 * @interface
 */
export interface INeighborhoodOriginSearchEmits {
  /* Fired with the chosen place's id */
  select: [placeId: string];
}
