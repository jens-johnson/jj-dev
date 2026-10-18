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
 * ██████████████████████████████████ #server/utils/neighborhood-explorer/dataset.ts ███████████████████████████████████
 *
 * Loads and indexes the precomputed neighborhood dataset from Nitro server assets, once per server instance.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { INeighborhoodFeatureDefinition } from '#shared/neighborhood-explorer';
import { NEIGHBORHOOD_FEATURES } from '#shared/neighborhood-explorer';

import type {
  INeighborhoodDataset,
  INeighborhoodDatasetPlace,
  INeighborhoodDatasetTract,
  INeighborhoodIndex,
} from './types';

/**
 * The memoized index; the dataset is immutable for the life of the server instance, so it loads once
 * @internal
 */
let index: Promise<INeighborhoodIndex> | null = null;

/**
 * Loads the precomputed dataset from Nitro server assets (bundled from `server/assets/neighborhood-explorer`) and
 * indexes it, once per server instance. Rejects when the asset is missing or its feature order has drifted from
 * `NEIGHBORHOOD_FEATURES`, since positional values would then misalign silently
 * @public
 * @function
 * @returns The indexed dataset
 */
export function loadNeighborhoodIndex(): Promise<INeighborhoodIndex> {
  index ??= (async (): Promise<INeighborhoodIndex> => {
    const dataset: INeighborhoodDataset | null = await useStorage('assets:server').getItem<INeighborhoodDataset>(
      'neighborhood-explorer:dataset.json',
    );
    if (!dataset) {
      throw new Error('The neighborhood dataset asset is missing; run the build-dataset pipeline.');
    }

    const expected: string = NEIGHBORHOOD_FEATURES.map((feature: INeighborhoodFeatureDefinition) => feature.key).join();
    if (dataset.featureKeys.join() !== expected) {
      throw new Error('The neighborhood dataset feature order is stale; rerun the build-dataset pipeline.');
    }

    return {
      dataset,
      tracts: new Map(dataset.tracts.map((tract: INeighborhoodDatasetTract) => [tract.geoid, tract])),
      places: new Map(dataset.places.map((place: INeighborhoodDatasetPlace) => [place.id, place])),
    };
  })().catch((error: unknown) => {
    // Never memoize a failure; the next request retries the load
    index = null;
    throw error;
  });
  return index;
}
