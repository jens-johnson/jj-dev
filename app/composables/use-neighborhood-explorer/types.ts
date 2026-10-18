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
 * ██████████████████████████████████ #composables/use-neighborhood-explorer/types.ts ██████████████████████████████████
 *
 * Type definitions for the neighborhood explorer composable.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type {
  INeighborhoodMatchesResult,
  INeighborhoodPlaceSummary,
  TNeighborhoodMatchScope,
  TNeighborhoodWeights,
} from '#shared/neighborhood-explorer';

/**
 * An interface representing the explorer's shared state and actions
 * @public
 * @interface
 */
export interface IUseNeighborhoodExplorerReturn {
  /* The origin id; a place id or a tract GEOID */
  readonly origin: Ref<string>;

  /* The lens weights on 0–100 */
  readonly weights: Ref<TNeighborhoodWeights>;

  /* Which metros the ranking covers */
  readonly scope: Ref<TNeighborhoodMatchScope>;

  /* The metro the map shows, or null to follow the origin */
  readonly view: Ref<string | null>;

  /* The latest matches response, or null before the first one lands */
  readonly result: Ref<INeighborhoodMatchesResult | null>;

  /* Whether a matches request is in flight */
  readonly pending: Ref<boolean>;

  /* The latest request's error message, or null */
  readonly error: Ref<string | null>;

  /* Searches the covered neighborhoods by name */
  searchPlaces: (query: string) => Promise<INeighborhoodPlaceSummary[]>;

  /* Restores every lens to its default weight */
  resetWeights: () => void;
}
