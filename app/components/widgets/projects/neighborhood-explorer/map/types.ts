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
 * ██████████████████████████ #components/widgets/projects/neighborhood-explorer/map/types.ts ██████████████████████████
 *
 * Prop and emit types for the neighborhood explorer map.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { INeighborhoodMetro } from '#shared/neighborhood-explorer';

/**
 * An interface representing the explorer map's props
 * @public
 * @interface
 */
export interface INeighborhoodExplorerMapProps {
  /* The metro whose tracts render */
  metro: INeighborhoodMetro;

  /* Per-tract similarity on 0–100, keyed by GEOID; unscored tracts render as no-data */
  scores: Record<string, number>;

  /* The GEOIDs to outline as the origin */
  originTracts: string[];

  /* A [longitude, latitude] point to fly to, or null to frame the whole metro */
  focus: [number, number] | null;
}

/**
 * An interface representing the explorer map's emits
 * @public
 * @interface
 */
export interface INeighborhoodExplorerMapEmits {
  /* Fired when the user asks to compare from a clicked tract */
  compare: [geoid: string];
}
