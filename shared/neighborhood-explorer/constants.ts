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
 * ████████████████████████████████████ #shared/neighborhood-explorer/constants.ts █████████████████████████████████████
 *
 * Neighborhood explorer configuration shared by the data pipeline, server, and client: lenses, features, metros.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type {
  INeighborhoodFeatureDefinition,
  INeighborhoodLensDefinition,
  INeighborhoodMetro,
  TNeighborhoodWeights,
} from './types';

/* ─── Lenses ─────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The lenses in slider order. Deliberately excludes race, ethnicity, religion, ancestry, and language: the explorer
 * compares places, never who lives in them, so it can't double as a steering tool
 * @public
 * @constant
 */
export const NEIGHBORHOOD_LENSES: INeighborhoodLensDefinition[] = [
  {
    id: 'people',
    label: 'People',
    hint: 'Age, household size, kids, education',
  },
  {
    id: 'money',
    label: 'Cost & income',
    hint: 'Income, rent, home values',
  },
  {
    id: 'housing',
    label: 'Housing stock',
    hint: 'Owners vs renters, building age and type',
  },
  {
    id: 'mobility',
    label: 'Getting around',
    hint: 'Density and how people commute',
  },
  {
    id: 'vibe',
    label: 'Vibe',
    hint: 'Cafés, bars, restaurants, parks within 1 km',
  },
  {
    id: 'climate',
    label: 'Climate',
    hint: 'Temperature, rain, snow, hot and freezing days',
  },
  {
    id: 'surroundings',
    label: 'Surroundings',
    hint: 'What the wider 5 km area is like',
  },
];

/**
 * The default slider weights; every lens counts equally
 * @public
 * @constant
 */
export const NEIGHBORHOOD_DEFAULT_WEIGHTS: TNeighborhoodWeights = {
  people: 50,
  money: 50,
  housing: 50,
  mobility: 50,
  vibe: 50,
  climate: 50,
  surroundings: 50,
};

/* ─── Features ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Every comparable feature, in the positional order the dataset stores values
 * @public
 * @constant
 */
export const NEIGHBORHOOD_FEATURES: INeighborhoodFeatureDefinition[] = [
  /* People */
  {
    key: 'medianAge',
    label: 'Median age',
    lens: 'people',
    format: 'number',
  },
  {
    key: 'householdSize',
    label: 'Average household size',
    lens: 'people',
    format: 'number',
  },
  {
    key: 'householdsWithKids',
    label: 'Households with kids',
    lens: 'people',
    format: 'percent',
  },
  {
    key: 'bachelorsPlus',
    label: "Adults with a bachelor's+",
    lens: 'people',
    format: 'percent',
  },

  /* Cost & income */
  {
    key: 'medianIncome',
    label: 'Median household income',
    lens: 'money',
    format: 'usd',
  },
  {
    key: 'medianRent',
    label: 'Median gross rent',
    lens: 'money',
    format: 'usd',
  },
  {
    key: 'medianHomeValue',
    label: 'Median home value',
    lens: 'money',
    format: 'usd',
  },

  /* Housing stock */
  {
    key: 'ownerOccupied',
    label: 'Owner-occupied homes',
    lens: 'housing',
    format: 'percent',
  },
  {
    key: 'medianYearBuilt',
    label: 'Median year built',
    lens: 'housing',
    format: 'year',
  },
  {
    key: 'singleFamily',
    label: 'Detached single-family homes',
    lens: 'housing',
    format: 'percent',
  },
  {
    key: 'largeBuildings',
    label: 'Homes in 20+ unit buildings',
    lens: 'housing',
    format: 'percent',
  },

  /* Getting around */
  {
    key: 'popDensity',
    label: 'Population density',
    lens: 'mobility',
    format: 'density',
  },
  {
    key: 'carCommute',
    label: 'Commute by car',
    lens: 'mobility',
    format: 'percent',
  },
  {
    key: 'transitCommute',
    label: 'Commute by transit',
    lens: 'mobility',
    format: 'percent',
  },
  {
    key: 'walkBikeCommute',
    label: 'Commute by walking or bike',
    lens: 'mobility',
    format: 'percent',
  },
  {
    key: 'workFromHome',
    label: 'Work from home',
    lens: 'mobility',
    format: 'percent',
  },

  /* Vibe */
  {
    key: 'cafes',
    label: 'Cafés within 1 km',
    lens: 'vibe',
    format: 'count',
  },
  {
    key: 'bars',
    label: 'Bars and pubs within 1 km',
    lens: 'vibe',
    format: 'count',
  },
  {
    key: 'restaurants',
    label: 'Restaurants within 1 km',
    lens: 'vibe',
    format: 'count',
  },
  {
    key: 'fastFood',
    label: 'Fast food within 1 km',
    lens: 'vibe',
    format: 'count',
  },
  {
    key: 'groceries',
    label: 'Grocery stores within 1 km',
    lens: 'vibe',
    format: 'count',
  },
  {
    key: 'parks',
    label: 'Parks within 1 km',
    lens: 'vibe',
    format: 'count',
  },

  /* Climate */
  {
    key: 'meanTemp',
    label: 'Average temperature',
    lens: 'climate',
    format: 'temperature',
  },
  {
    key: 'annualPrecip',
    label: 'Annual precipitation',
    lens: 'climate',
    format: 'inches',
  },
  {
    key: 'annualSnow',
    label: 'Annual snowfall',
    lens: 'climate',
    format: 'inches',
  },
  {
    key: 'hotDays',
    label: 'Days above 90°F',
    lens: 'climate',
    format: 'days',
  },
  {
    key: 'freezeDays',
    label: 'Nights below freezing',
    lens: 'climate',
    format: 'days',
  },

  /* Surroundings */
  {
    key: 'areaDensity',
    label: 'Area population density (5 km)',
    lens: 'surroundings',
    format: 'density',
  },
  {
    key: 'areaIncome',
    label: 'Area median income (5 km)',
    lens: 'surroundings',
    format: 'usd',
  },
  {
    key: 'areaBachelors',
    label: "Area bachelor's+ share (5 km)",
    lens: 'surroundings',
    format: 'percent',
  },
  {
    key: 'areaCarCommute',
    label: 'Area car commute share (5 km)',
    lens: 'surroundings',
    format: 'percent',
  },
];

/* ─── Coverage ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The metros the proof of concept covers; the data pipeline pulls every tract in each metro's counties
 * @public
 * @constant
 */
export const NEIGHBORHOOD_METROS: INeighborhoodMetro[] = [
  {
    id: 'san-diego',
    name: 'San Diego',
    state: 'CA',
    counties: [['06', '073']],
    center: [-117.16, 32.8],
    zoom: 10,
  },
  {
    id: 'denver',
    name: 'Denver',
    state: 'CO',
    counties: [['08', '031']],
    center: [-104.96, 39.74],
    zoom: 11,
  },
  {
    id: 'new-york',
    name: 'New York',
    state: 'NY',
    counties: [
      ['36', '047'],
      ['36', '061'],
    ],
    center: [-73.96, 40.71],
    zoom: 11,
  },
  {
    id: 'austin',
    name: 'Austin',
    state: 'TX',
    counties: [['48', '453']],
    center: [-97.74, 30.3],
    zoom: 10.5,
  },
  {
    id: 'portland',
    name: 'Portland',
    state: 'OR',
    counties: [['41', '051']],
    center: [-122.62, 45.52],
    zoom: 11,
  },
  {
    id: 'seattle',
    name: 'Seattle',
    state: 'WA',
    counties: [['53', '033']],
    center: [-122.3, 47.6],
    zoom: 10.5,
  },
  {
    id: 'minneapolis',
    name: 'Minneapolis',
    state: 'MN',
    counties: [['27', '053']],
    center: [-93.3, 44.98],
    zoom: 10.5,
  },
  {
    id: 'nashville',
    name: 'Nashville',
    state: 'TN',
    counties: [['47', '037']],
    center: [-86.78, 36.16],
    zoom: 10.5,
  },
];

/**
 * The origin the explorer opens on: Clairemont, San Diego (OpenStreetMap node 4837263739)
 * @public
 * @constant
 */
export const NEIGHBORHOOD_DEFAULT_ORIGIN: string = 'p-4837263739';

/**
 * Tracts below this population are excluded from matching; airports, parks, and bases carry noisy or empty estimates
 * @public
 * @constant
 */
export const NEIGHBORHOOD_MIN_TRACT_POPULATION: number = 300;
