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
 * ██████████████████████████████████ scripts/neighborhood-explorer/build-dataset.ts ███████████████████████████████████
 *
 * Builds the neighborhood explorer dataset: per-tract ACS, OpenStreetMap, and climate features, ranked to percentiles.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * pnpm data:neighborhoods
 *
 * Fetches every tract in each NEIGHBORHOOD_METROS county (TIGERweb geometry, Census Reporter ACS tables), amenity and
 * neighborhood-name points from Overpass, and daily weather from the Open-Meteo archive; then writes
 * server/assets/neighborhood-explorer/dataset.json and public/data/neighborhood-explorer/<metro>.geojson. Raw responses
 * cache under .cache/neighborhood-explorer, so reruns are offline; delete that folder to refresh the sources.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 *   • https://censusreporter.org/
 *   • https://tigerweb.geo.census.gov/
 *   • https://wiki.openstreetmap.org/wiki/Overpass_API
 *   • https://open-meteo.com/en/docs/historical-weather-api
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/* eslint-disable no-console -- this is a CLI script; stdout/stderr is its interface. */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type {
  INeighborhoodDataset,
  INeighborhoodDatasetPlace,
  INeighborhoodDatasetTract,
} from '../../server/utils/neighborhood-explorer/types';
import {
  NEIGHBORHOOD_FEATURES,
  NEIGHBORHOOD_METROS,
  NEIGHBORHOOD_MIN_TRACT_POPULATION,
} from '../../shared/neighborhood-explorer/constants';
import type { INeighborhoodMetro } from '../../shared/neighborhood-explorer/types';
import type { TPolygonGeometry } from './utils';
import { haversineKm, percentileRanks, pointInPolygon, share, weightedMeanVector } from './utils';

/* ─── Config ─────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The repository root, resolved from this script's location
 * @internal
 * @constant
 */
const ROOT: string = fileURLToPath(new URL('../../', import.meta.url));

/**
 * Where raw upstream responses are cached between runs (gitignored via `.cache`)
 * @internal
 * @constant
 */
const CACHE_DIR: string = join(ROOT, '.cache/neighborhood-explorer');

/**
 * Where the dataset lands; Nitro bundles `server/assets` into the server build
 * @internal
 * @constant
 */
const DATASET_PATH: string = join(ROOT, 'server/assets/neighborhood-explorer/dataset.json');

/**
 * Where the per-metro tract geometry lands; served statically for the map
 * @internal
 * @constant
 */
const GEOMETRY_DIR: string = join(ROOT, 'public/data/neighborhood-explorer');

/**
 * The User-Agent sent upstream; Overpass rejects anonymous clients
 * @internal
 * @constant
 */
const USER_AGENT: string = 'jj-dev-neighborhood-explorer/0.1 (+https://jens-johnson.com)';

/**
 * The ACS tables the features draw from
 * @internal
 * @constant
 */
const ACS_TABLES: string[] = [
  'B01003',
  'B01002',
  'B25010',
  'B11005',
  'B15003',
  'B19013',
  'B25064',
  'B25077',
  'B25003',
  'B25035',
  'B08301',
  'B25024',
];

/**
 * The amenity radius around each tract's interior point, in kilometers
 * @internal
 * @constant
 */
const AMENITY_RADIUS_KM: number = 1;

/**
 * The surroundings radius around each tract's interior point, in kilometers
 * @internal
 * @constant
 */
const AREA_RADIUS_KM: number = 5;

/**
 * The radius of tracts blended into a named place's profile, in kilometers
 * @internal
 * @constant
 */
const PLACE_RADIUS_KM: number = 1.2;

/**
 * The climate grid size in degrees; tract points snap to this grid so nearby tracts share one weather lookup
 * @internal
 * @constant
 */
const CLIMATE_GRID_DEGREES: number = 0.25;

/**
 * The climate sample window; two full years keeps the Open-Meteo call budget small for the proof of concept
 * @internal
 * @constant
 */
const CLIMATE_WINDOW: { start: string; end: string; years: number } = {
  start: '2023-01-01',
  end: '2024-12-31',
  years: 2,
};

/* ─── Types ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * An interface representing a tract polygon from TIGERweb
 * @internal
 * @interface
 */
interface ITractFeature {
  type: 'Feature';
  geometry: TPolygonGeometry;
  properties: { GEOID: string; AREALAND: number; INTPTLAT: string; INTPTLON: string };
}

/**
 * An interface representing a Census Reporter table payload for one geography
 * @internal
 * @interface
 */
interface IAcsTableValue {
  estimate: Record<string, number | null>;
}

/**
 * An interface representing an OpenStreetMap point of interest, reduced to its category
 * @internal
 * @interface
 */
interface IPoi {
  point: [number, number];
  category: 'cafes' | 'bars' | 'restaurants' | 'fastFood' | 'groceries' | 'parks';
}

/**
 * An interface representing the five climate features for one grid cell
 * @internal
 * @interface
 */
interface IClimate {
  meanTemp: number;
  annualPrecip: number;
  annualSnow: number;
  hotDays: number;
  freezeDays: number;
}

/**
 * An interface representing a tract while the pipeline assembles it
 * @internal
 * @interface
 */
interface IWorkingTract {
  geoid: string;
  metro: string;
  point: [number, number];
  geometry: TPolygonGeometry;
  areaSqMi: number;
  acs: Record<string, number | null>;
  values: Record<string, number | null>;
}

/* ─── Fetch helpers ──────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Pauses for the given number of milliseconds
 * @internal
 * @function
 * @param ms - The delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches a URL as text through the on-disk cache, retrying rate limits and gateway timeouts with backoff
 * @internal
 * @function
 * @param key - The cache filename
 * @param url - The URL to fetch
 * @param init - Optional fetch options (i.e. an Overpass POST body)
 * @returns The response body
 */
async function cachedFetch(key: string, url: string, init?: RequestInit): Promise<string> {
  const path: string = join(CACHE_DIR, key);
  try {
    return await readFile(path, 'utf8');
  } catch {
    // Cache miss; fall through to the network
  }

  for (let attempt = 1; attempt <= 6; attempt++) {
    const response: Response = await fetch(url, {
      ...init,
      headers: { 'User-Agent': USER_AGENT, ...init?.headers },
    });
    if (response.ok) {
      const body: string = await response.text();
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, body);
      return body;
    }
    if (![429, 502, 503, 504].includes(response.status)) {
      throw new Error(`${response.status} ${response.statusText} for ${url}\n${await response.text()}`);
    }
    const wait: number = 15_000 * attempt;
    console.warn(`  ${response.status} from ${new URL(url).host}; retrying in ${wait / 1000}s`);
    await sleep(wait);
  }
  throw new Error(`Gave up on ${url}`);
}

/**
 * Runs an Overpass QL query through the cache
 * @internal
 * @function
 * @param key - The cache filename
 * @param query - The Overpass QL query
 * @returns The response body
 */
function overpass(key: string, query: string): Promise<string> {
  return cachedFetch(key, 'https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ data: query }).toString(),
  });
}

/* ─── Sources ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Fetches a county's generalized (1:500k) tract polygons from TIGERweb
 * @internal
 * @function
 * @param state - The state FIPS code
 * @param county - The county FIPS code
 * @returns The tract features
 */
async function fetchTracts(state: string, county: string): Promise<ITractFeature[]> {
  const features: ITractFeature[] = [];
  for (let offset = 0; ; offset += 1000) {
    const params: URLSearchParams = new URLSearchParams({
      where: `STATE='${state}' AND COUNTY='${county}'`,
      outFields: 'GEOID,AREALAND,INTPTLAT,INTPTLON',
      returnGeometry: 'true',
      geometryPrecision: '5',
      maxAllowableOffset: '0.0002',
      outSR: '4326',
      resultOffset: String(offset),
      resultRecordCount: '1000',
      f: 'geojson',
    });
    const url: string = `https://tigerweb.geo.census.gov/arcgis/rest/services/Generalized_ACS2023/Tracts_Blocks/MapServer/4/query?${params}`;
    const page: { features: ITractFeature[]; exceededTransferLimit?: boolean } = JSON.parse(
      await cachedFetch(`tracts-${state}${county}-${offset}.json`, url),
    );
    features.push(...page.features);
    if (page.features.length < 1000 && !page.exceededTransferLimit) {
      return features;
    }
  }
}

/**
 * Fetches a county's ACS tables for every tract from Census Reporter, flattened to column → estimate
 * @internal
 * @function
 * @param state - The state FIPS code
 * @param county - The county FIPS code
 * @returns The release name and the estimates keyed by tract GEOID
 */
async function fetchAcs(
  state: string,
  county: string,
): Promise<{ release: string; byGeoid: Map<string, Record<string, number | null>> }> {
  const url: string = `https://api.censusreporter.org/1.0/data/show/latest?table_ids=${ACS_TABLES.join(',')}&geo_ids=140|05000US${state}${county}`;
  const payload: {
    release: { name: string };
    data: Record<string, Record<string, IAcsTableValue>>;
  } = JSON.parse(await cachedFetch(`acs-${state}${county}.json`, url));

  const byGeoid: Map<string, Record<string, number | null>> = new Map();
  for (const [geoId, tables] of Object.entries(payload.data)) {
    const columns: Record<string, number | null> = {};
    for (const table of Object.values(tables)) {
      for (const [column, estimate] of Object.entries(table.estimate)) {
        // Census Reporter reports suppressed estimates as null; guard negative sentinels just in case
        columns[column] = typeof estimate === 'number' && estimate >= 0 ? estimate : null;
      }
    }
    byGeoid.set(geoId.replace('14000US', ''), columns);
  }
  return { release: payload.release.name, byGeoid };
}

/**
 * Fetches a bounding box's points of interest from OpenStreetMap, reduced to the vibe categories
 * @internal
 * @function
 * @param metro - The metro slug, for the cache key
 * @param bbox - The [south, west, north, east] bounding box
 * @returns The categorized points
 */
async function fetchPois(metro: string, bbox: [number, number, number, number]): Promise<IPoi[]> {
  const box: string = bbox.join(',');
  const csv: string = await overpass(
    `pois-${metro}.csv`,
    `[out:csv(::lat,::lon,amenity,shop,leisure;false)][timeout:300];
     (
       nwr["amenity"~"^(cafe|bar|pub|restaurant|fast_food)$"](${box});
       nwr["shop"~"^(supermarket|greengrocer)$"](${box});
       nwr["leisure"="park"](${box});
     );
     out center;`,
  );

  const pois: IPoi[] = [];
  for (const line of csv.split('\n')) {
    const [lat, lon, amenity, shop, leisure] = line.split('\t');
    const point: [number, number] = [Number(lon), Number(lat)];
    if (!Number.isFinite(point[0]) || !Number.isFinite(point[1])) {
      continue;
    }
    if (amenity === 'cafe') {
      pois.push({ point, category: 'cafes' });
    } else if (amenity === 'bar' || amenity === 'pub') {
      pois.push({ point, category: 'bars' });
    } else if (amenity === 'restaurant') {
      pois.push({ point, category: 'restaurants' });
    } else if (amenity === 'fast_food') {
      pois.push({ point, category: 'fastFood' });
    } else if (shop) {
      pois.push({ point, category: 'groceries' });
    } else if (leisure === 'park') {
      pois.push({ point, category: 'parks' });
    }
  }
  return pois;
}

/**
 * Fetches a bounding box's named neighborhood nodes from OpenStreetMap
 * @internal
 * @function
 * @param metro - The metro slug, for the cache key
 * @param bbox - The [south, west, north, east] bounding box
 * @returns The named place nodes
 */
async function fetchPlaces(
  metro: string,
  bbox: [number, number, number, number],
): Promise<{ id: number; name: string; point: [number, number] }[]> {
  const payload: { elements: { id: number; lat: number; lon: number; tags: { name?: string } }[] } = JSON.parse(
    await overpass(
      `places-${metro}.json`,
      `[out:json][timeout:120];node["place"~"^(suburb|neighbourhood|quarter)$"]["name"](${bbox.join(',')});out;`,
    ),
  );
  return payload.elements
    .filter((element) => element.tags.name)
    .map((element) => ({
      id: element.id,
      name: element.tags.name as string,
      point: [element.lon, element.lat],
    }));
}

/**
 * Fetches daily weather for a batch of grid cells from the Open-Meteo archive and reduces it to annual climate
 * @internal
 * @function
 * @param cells - The [longitude, latitude] cell centers
 * @returns The climate for each cell, in input order
 */
async function fetchClimate(cells: [number, number][]): Promise<IClimate[]> {
  const params: URLSearchParams = new URLSearchParams({
    latitude: cells.map((cell) => cell[1].toFixed(3)).join(','),
    longitude: cells.map((cell) => cell[0].toFixed(3)).join(','),
    start_date: CLIMATE_WINDOW.start,
    end_date: CLIMATE_WINDOW.end,
    daily: 'temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum',
    timezone: 'UTC',
  });
  const key: string = `climate-${cells.map((cell) => `${cell[0]}_${cell[1]}`).join('-')}.json`.slice(0, 200);
  const body: unknown = JSON.parse(await cachedFetch(key, `https://archive-api.open-meteo.com/v1/archive?${params}`));
  const locations: { daily: Record<string, (number | null)[]> }[] = Array.isArray(body) ? body : [body as never];

  return locations.map(({ daily }): IClimate => {
    const sum = (values: (number | null)[] | undefined): number =>
      (values ?? []).reduce<number>((total, value) => total + (value ?? 0), 0);
    const count = (values: (number | null)[] | undefined, test: (value: number) => boolean): number =>
      (values ?? []).filter((value) => value !== null && test(value)).length;
    const means: number[] = (daily.temperature_2m_mean ?? []).filter((value): value is number => value !== null);

    return {
      meanTemp: (means.reduce((total, value) => total + value, 0) / means.length) * 1.8 + 32,
      annualPrecip: sum(daily.precipitation_sum) / 25.4 / CLIMATE_WINDOW.years,
      annualSnow: sum(daily.snowfall_sum) / 2.54 / CLIMATE_WINDOW.years,
      hotDays: count(daily.temperature_2m_max, (value) => value > 32.22) / CLIMATE_WINDOW.years,
      freezeDays: count(daily.temperature_2m_min, (value) => value < 0) / CLIMATE_WINDOW.years,
    };
  });
}

/* ─── Assembly ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Computes a geometry's [south, west, north, east] bounding box across a set of tracts
 * @internal
 * @function
 * @param tracts - The tracts to bound
 * @returns The bounding box
 */
function boundingBox(tracts: IWorkingTract[]): [number, number, number, number] {
  let [south, west, north, east] = [90, 180, -90, -180];
  const visit = (point: [number, number]): void => {
    west = Math.min(west, point[0]);
    east = Math.max(east, point[0]);
    south = Math.min(south, point[1]);
    north = Math.max(north, point[1]);
  };
  for (const tract of tracts) {
    const rings = tract.geometry.type === 'Polygon' ? tract.geometry.coordinates : tract.geometry.coordinates.flat();
    rings.forEach((ring) => ring.forEach(visit));
  }
  return [south, west, north, east].map((value) => Number(value.toFixed(4))) as [number, number, number, number];
}

/**
 * Derives a tract's demographic, housing, and commute features from its ACS columns
 * @internal
 * @function
 * @param tract - The tract with its ACS columns populated
 * @returns The derived feature values
 */
function acsFeatures(tract: IWorkingTract): Record<string, number | null> {
  const c = (column: string): number | null => tract.acs[column] ?? null;
  const add = (...columns: string[]): number | null =>
    columns.some((column) => c(column) === null)
      ? null
      : columns.reduce((total, column) => total + (c(column) ?? 0), 0);
  const population: number | null = c('B01003001');

  return {
    medianAge: c('B01002001'),
    householdSize: c('B25010001'),
    householdsWithKids: share(c('B11005002'), c('B11005001')),
    bachelorsPlus: share(add('B15003022', 'B15003023', 'B15003024', 'B15003025'), c('B15003001')),
    medianIncome: c('B19013001'),
    medianRent: c('B25064001'),
    medianHomeValue: c('B25077001'),
    ownerOccupied: share(c('B25003002'), c('B25003001')),
    medianYearBuilt: c('B25035001') || null,
    singleFamily: share(c('B25024002'), c('B25024001')),
    largeBuildings: share(add('B25024008', 'B25024009'), c('B25024001')),
    popDensity: population !== null && tract.areaSqMi > 0 ? population / tract.areaSqMi : null,
    carCommute: share(c('B08301002'), c('B08301001')),
    transitCommute: share(c('B08301010'), c('B08301001')),
    walkBikeCommute: share(add('B08301018', 'B08301019'), c('B08301001')),
    workFromHome: share(c('B08301021'), c('B08301001')),
  };
}

/**
 * Derives the surroundings features from every tract within the area radius, weighting by population
 * @internal
 * @function
 * @param tract - The tract to describe
 * @param all - Every tract in the metro, the tract itself included
 * @returns The derived feature values
 */
function areaFeatures(tract: IWorkingTract, all: IWorkingTract[]): Record<string, number | null> {
  let population = 0;
  let area = 0;
  let incomeSum = 0;
  let incomeWeight = 0;
  let bachelors = 0;
  let adults = 0;
  let car = 0;
  let commuters = 0;

  for (const other of all) {
    if (haversineKm(tract.point, other.point) > AREA_RADIUS_KM) {
      continue;
    }
    const pop: number = other.acs.B01003001 ?? 0;
    population += pop;
    area += other.areaSqMi;
    if (other.values.medianIncome !== null && other.values.medianIncome !== undefined) {
      incomeSum += other.values.medianIncome * pop;
      incomeWeight += pop;
    }
    bachelors +=
      (other.acs.B15003022 ?? 0) + (other.acs.B15003023 ?? 0) + (other.acs.B15003024 ?? 0) + (other.acs.B15003025 ?? 0);
    adults += other.acs.B15003001 ?? 0;
    car += other.acs.B08301002 ?? 0;
    commuters += other.acs.B08301001 ?? 0;
  }

  return {
    areaDensity: area > 0 ? population / area : null,
    areaIncome: incomeWeight > 0 ? incomeSum / incomeWeight : null,
    areaBachelors: share(bachelors, adults),
    areaCarCommute: share(car, commuters),
  };
}

/**
 * Rounds a value for storage, keeping nulls
 * @internal
 * @function
 * @param value - The value to round
 * @param digits - The decimal places to keep
 * @returns The rounded value
 */
function round(value: number | null, digits: number): number | null {
  return value === null ? null : Number(value.toFixed(digits));
}

/* ─── Stages ─────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * An interface representing a named place node before it is blended into a profile
 * @internal
 * @interface
 */
interface IRawPlace {
  id: number;
  name: string;
  point: [number, number];
  metro: string;
}

/**
 * An interface representing everything the fetch stage collects across the metros
 * @internal
 * @interface
 */
interface ICollected {
  release: string;
  working: IWorkingTract[];
  pois: Map<string, IPoi[]>;
  rawPlaces: IRawPlace[];
  geometry: Map<string, ITractFeature[]>;
}

/**
 * Fetches each metro's tracts, ACS estimates, points of interest, and named places
 * @internal
 * @function
 * @returns The collected sources
 */
async function collect(): Promise<ICollected> {
  const collected: ICollected = {
    release: '',
    working: [],
    pois: new Map(),
    rawPlaces: [],
    geometry: new Map(),
  };

  for (const metro of NEIGHBORHOOD_METROS as INeighborhoodMetro[]) {
    console.log(`▸ ${metro.name}`);
    const metroTracts: IWorkingTract[] = [];
    const metroGeometry: ITractFeature[] = [];

    for (const [state, county] of metro.counties) {
      const [tracts, acs] = await Promise.all([fetchTracts(state, county), fetchAcs(state, county)]);
      collected.release = acs.release;
      console.log(`  county ${state}${county}: ${tracts.length} tracts, ${acs.byGeoid.size} ACS rows`);
      metroGeometry.push(...tracts);
      metroTracts.push(
        ...tracts.map(
          (feature: ITractFeature): IWorkingTract => ({
            geoid: feature.properties.GEOID,
            metro: metro.id,
            point: [Number(feature.properties.INTPTLON), Number(feature.properties.INTPTLAT)],
            geometry: feature.geometry,
            areaSqMi: feature.properties.AREALAND / 2_589_988,
            acs: acs.byGeoid.get(feature.properties.GEOID) ?? {},
            values: {},
          }),
        ),
      );
    }

    const bbox: [number, number, number, number] = boundingBox(metroTracts);
    const pois: IPoi[] = await fetchPois(metro.id, bbox);
    // Keep only places that actually sit inside one of the metro's tracts (the bbox overshoots the counties)
    const places: IRawPlace[] = (await fetchPlaces(metro.id, bbox))
      .filter((place) => metroTracts.some((tract) => pointInPolygon(place.point, tract.geometry)))
      .map((place) => ({ ...place, metro: metro.id }));
    console.log(`  ${pois.length} POIs, ${places.length} places`);

    collected.pois.set(metro.id, pois);
    collected.rawPlaces.push(...places);
    collected.working.push(...metroTracts);
    collected.geometry.set(metro.id, metroGeometry);
  }
  return collected;
}

/**
 * Counts each vibe category within the amenity radius of a tract's interior point
 * @internal
 * @function
 * @param tract - The tract to describe
 * @param pois - The metro's points of interest
 * @returns The count per category
 */
function amenityCounts(tract: IWorkingTract, pois: IPoi[]): Record<IPoi['category'], number> {
  const counts: Record<IPoi['category'], number> = {
    cafes: 0,
    bars: 0,
    restaurants: 0,
    fastFood: 0,
    groceries: 0,
    parks: 0,
  };
  for (const poi of pois) {
    // A cheap degree-box prefilter before the exact distance keeps this pass fast
    const nearby: boolean =
      Math.abs(poi.point[1] - tract.point[1]) <= 0.02 && Math.abs(poi.point[0] - tract.point[0]) <= 0.03;
    if (nearby && haversineKm(tract.point, poi.point) <= AMENITY_RADIUS_KM) {
      counts[poi.category]++;
    }
  }
  return counts;
}

/**
 * Attaches climate to every tract, fetching one lookup per snapped grid cell in batches that stay inside
 * Open-Meteo's free-tier limits
 * @internal
 * @function
 * @param working - Every tract
 */
async function attachClimate(working: IWorkingTract[]): Promise<void> {
  const snap = (value: number): number => Math.round(value / CLIMATE_GRID_DEGREES) * CLIMATE_GRID_DEGREES;
  const cellKey = (point: [number, number]): string => `${snap(point[0]).toFixed(2)},${snap(point[1]).toFixed(2)}`;
  const cells: string[] = [...new Set(working.map((tract) => cellKey(tract.point)))];
  const climateByCell: Map<string, IClimate> = new Map();

  console.log(`▸ Climate for ${cells.length} grid cells`);
  for (let i = 0; i < cells.length; i += 10) {
    const batch: string[] = cells.slice(i, i + 10);
    const results: IClimate[] = await fetchClimate(
      batch.map((cell) => cell.split(',').map(Number) as [number, number]),
    );
    batch.forEach((cell, index) => climateByCell.set(cell, results[index] as IClimate));
  }
  for (const tract of working) {
    Object.assign(tract.values, climateByCell.get(cellKey(tract.point)));
  }
}

/**
 * Drops tracts below the population floor and ranks every feature across the rest
 * @internal
 * @function
 * @param working - Every tract, values populated
 * @param keys - The feature keys in stored order
 * @returns The dataset tracts
 */
function rankTracts(working: IWorkingTract[], keys: string[]): INeighborhoodDatasetTract[] {
  const kept: IWorkingTract[] = working.filter(
    (tract) => (tract.acs.B01003001 ?? 0) >= NEIGHBORHOOD_MIN_TRACT_POPULATION,
  );
  const rawMatrix: (number | null)[][] = kept.map((tract) => keys.map((key) => tract.values[key] ?? null));
  const pctColumns: (number | null)[][] = keys.map((_, slot) =>
    percentileRanks(rawMatrix.map((row) => row[slot] ?? null)),
  );

  return kept.map((tract, row) => ({
    geoid: tract.geoid,
    metro: tract.metro,
    population: tract.acs.B01003001 ?? 0,
    centroid: [round(tract.point[0], 5) as number, round(tract.point[1], 5) as number],
    raw: (rawMatrix[row] ?? []).map((value) => round(value, 3)),
    pct: keys.map((_, slot) => round(pctColumns[slot]?.[row] ?? null, 3)),
  }));
}

/**
 * Blends each named place from its containing tract and every tract within the place radius, weighted by population;
 * keeps the first place per name per metro and drops places with no covered tract
 * @internal
 * @function
 * @param rawPlaces - The named place nodes
 * @param tracts - The ranked dataset tracts
 * @param geometryByGeoid - Tract polygons keyed by GEOID, for the containment check
 * @returns The dataset places
 */
function blendPlaces(
  rawPlaces: IRawPlace[],
  tracts: INeighborhoodDatasetTract[],
  geometryByGeoid: Map<string, TPolygonGeometry>,
): INeighborhoodDatasetPlace[] {
  const seen: Set<string> = new Set();
  const places: INeighborhoodDatasetPlace[] = [];

  for (const place of rawPlaces) {
    const dedupeKey: string = `${place.metro}:${place.name.toLowerCase()}`;
    const members: INeighborhoodDatasetTract[] = seen.has(dedupeKey)
      ? []
      : tracts.filter((tract) => {
          const geometry: TPolygonGeometry | undefined = geometryByGeoid.get(tract.geoid);
          return (
            tract.metro === place.metro &&
            (haversineKm(place.point, tract.centroid) <= PLACE_RADIUS_KM ||
              (geometry !== undefined && pointInPolygon(place.point, geometry)))
          );
        });
    if (!members.length) {
      continue;
    }

    seen.add(dedupeKey);
    const weights: number[] = members.map((member) => member.population);
    places.push({
      id: `p-${place.id}`,
      name: place.name,
      metro: place.metro,
      centroid: [round(place.point[0], 5) as number, round(place.point[1], 5) as number],
      tracts: members.map((member) => member.geoid),
      raw: weightedMeanVector(
        members.map((member) => member.raw),
        weights,
      ).map((value) => round(value, 3)),
      pct: weightedMeanVector(
        members.map((member) => member.pct),
        weights,
      ).map((value) => round(value, 3)),
    });
  }
  return places;
}

/**
 * Writes the dataset asset and the per-metro geometry, trimmed to the GEOID property the map joins scores on
 * @internal
 * @function
 * @param dataset - The dataset
 * @param geometry - The tract polygons per metro
 */
async function writeOutputs(dataset: INeighborhoodDataset, geometry: Map<string, ITractFeature[]>): Promise<void> {
  await mkdir(dirname(DATASET_PATH), { recursive: true });
  await writeFile(DATASET_PATH, JSON.stringify(dataset));
  console.log(`✓ ${dataset.tracts.length} tracts, ${dataset.places.length} places → ${DATASET_PATH}`);

  await mkdir(GEOMETRY_DIR, { recursive: true });
  for (const [metro, features] of geometry) {
    const collection = {
      type: 'FeatureCollection',
      features: features.map((feature) => ({
        type: 'Feature',
        properties: { geoid: feature.properties.GEOID },
        geometry: feature.geometry,
      })),
    };
    await writeFile(join(GEOMETRY_DIR, `${metro}.geojson`), JSON.stringify(collection));
  }
  console.log(`✓ geometry for ${geometry.size} metros → ${GEOMETRY_DIR}`);
}

/* ─── Main ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Builds the dataset and per-metro geometry end to end
 * @internal
 * @function
 */
async function main(): Promise<void> {
  const keys: string[] = NEIGHBORHOOD_FEATURES.map((feature) => feature.key);
  const { release, working, pois, rawPlaces, geometry }: ICollected = await collect();

  // Demographics, housing, commute, and amenities first; surroundings read those values across neighbors
  for (const tract of working) {
    tract.values = { ...acsFeatures(tract), ...amenityCounts(tract, pois.get(tract.metro) ?? []) };
  }
  for (const tract of working) {
    Object.assign(
      tract.values,
      areaFeatures(
        tract,
        working.filter((other) => other.metro === tract.metro),
      ),
    );
  }
  await attachClimate(working);

  const tracts: INeighborhoodDatasetTract[] = rankTracts(working, keys);
  const places: INeighborhoodDatasetPlace[] = blendPlaces(
    rawPlaces,
    tracts,
    new Map(working.map((tract) => [tract.geoid, tract.geometry])),
  );
  await writeOutputs(
    {
      release,
      builtAt: new Date().toISOString(),
      featureKeys: keys,
      tracts,
      places,
    },
    geometry,
  );
}

await main();
