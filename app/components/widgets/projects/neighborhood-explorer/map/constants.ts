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
 * ████████████████████████ #components/widgets/projects/neighborhood-explorer/map/constants.ts ████████████████████████
 *
 * Basemap styles, layer ids, and the similarity opacity ramp for the neighborhood explorer map.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The OpenFreeMap basemap styles (no key required), light for the day theme and dark for sunset and night
 * @public
 * @constant
 */
export const NEIGHBORHOOD_MAP_STYLES: { light: string; dark: string } = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};

/**
 * The tract source id
 * @public
 * @constant
 */
export const NEIGHBORHOOD_MAP_SOURCE: string = 'neighborhood-tracts';

/**
 * The layer ids the map adds on top of the basemap
 * @public
 * @constant
 */
export const NEIGHBORHOOD_MAP_LAYERS: { fill: string; outline: string; origin: string } = {
  fill: 'neighborhood-tracts-fill',
  outline: 'neighborhood-tracts-outline',
  origin: 'neighborhood-tracts-origin',
};

/**
 * The similarity → fill-opacity ramp; flat at the low end so only genuinely similar tracts stand out
 * @public
 * @constant
 */
export const NEIGHBORHOOD_MAP_OPACITY_STOPS: [number, number][] = [
  [0, 0.03],
  [50, 0.1],
  [70, 0.3],
  [85, 0.6],
  [100, 0.85],
];

/**
 * The zoom used when flying to a single neighborhood
 * @public
 * @constant
 */
export const NEIGHBORHOOD_MAP_FOCUS_ZOOM: number = 12.5;
