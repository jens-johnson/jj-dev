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
 * ███████████████████████████████ #composables/use-neighborhood-explorer/composable.ts ████████████████████████████████
 *
 * Neighborhood explorer state: origin, weights, scope, and view, mirrored into the URL and scored server-side.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { useDebounceFn } from '@vueuse/core';

import type {
  INeighborhoodLensDefinition,
  INeighborhoodMatchesResult,
  INeighborhoodPlaceSummary,
  TNeighborhoodLens,
  TNeighborhoodMatchScope,
  TNeighborhoodWeights,
} from '#shared/neighborhood-explorer';
import {
  NEIGHBORHOOD_DEFAULT_ORIGIN,
  NEIGHBORHOOD_DEFAULT_WEIGHTS,
  NEIGHBORHOOD_LENSES,
  NEIGHBORHOOD_METROS,
} from '#shared/neighborhood-explorer';

import type { IUseNeighborhoodExplorerReturn } from './types';

/**
 * Reads a single string from a route query value
 * @internal
 * @function
 * @param value - The raw query value
 * @returns The string, or undefined when absent or repeated
 */
function queryString(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}

/**
 * Parses the `w` query value into weights, ignoring malformed pairs (the server validates strictly)
 * @internal
 * @function
 * @param value - The raw `w` value
 * @returns The weights, defaults filled in
 */
function parseWeights(value: string | undefined): TNeighborhoodWeights {
  const weights: TNeighborhoodWeights = { ...NEIGHBORHOOD_DEFAULT_WEIGHTS };
  for (const pair of value?.split(',') ?? []) {
    const [lens, raw] = pair.split(':');
    const number: number = Number(raw);
    if (lens && lens in weights && raw !== '' && Number.isFinite(number)) {
      weights[lens as TNeighborhoodLens] = Math.min(100, Math.max(0, number));
    }
  }
  return weights;
}

/**
 * Serializes weights to the `w` query value, listing only the lenses that differ from the defaults
 * @internal
 * @function
 * @param weights - The weights
 * @returns The `w` value, or undefined when every lens is at its default
 */
function serializeWeights(weights: TNeighborhoodWeights): string | undefined {
  const pairs: string[] = NEIGHBORHOOD_LENSES.flatMap((lens: INeighborhoodLensDefinition): string[] =>
    weights[lens.id] === NEIGHBORHOOD_DEFAULT_WEIGHTS[lens.id] ? [] : [`${lens.id}:${weights[lens.id]}`],
  );
  return pairs.length ? pairs.join(',') : undefined;
}

/**
 * Drives the neighborhood explorer: holds the origin, weights, scope, and map view; mirrors them into the URL so any
 * state is shareable; and refetches the ranked matches (debounced, latest-wins) whenever they change. Scoring runs
 * server-side, so the browser never downloads the feature matrix
 * @public
 * @function
 * @returns The explorer state and actions
 */
export function useNeighborhoodExplorer(): IUseNeighborhoodExplorerReturn {
  const route = useRoute();
  const router = useRouter();

  /* ─── State ────────────────────────────────────────────────────────────────────────────────────────────────────── */

  /**
   * The origin id, seeded from the URL
   * @internal
   * @constant
   */
  const origin: Ref<string> = ref(queryString(route.query.from) ?? NEIGHBORHOOD_DEFAULT_ORIGIN);

  /**
   * The lens weights, seeded from the URL
   * @internal
   * @constant
   */
  const weights: Ref<TNeighborhoodWeights> = ref(parseWeights(queryString(route.query.w)));

  /**
   * The ranking scope, seeded from the URL; other metros by default since same-city twins are less surprising
   * @internal
   * @constant
   */
  const scope: Ref<TNeighborhoodMatchScope> = ref(queryString(route.query.scope) === 'all' ? 'all' : 'other');

  /**
   * The metro the map shows, seeded from the URL when it names a covered metro
   * @internal
   * @constant
   */
  const view: Ref<string | null> = ref(
    NEIGHBORHOOD_METROS.some((metro) => metro.id === route.query.view) ? (route.query.view as string) : null,
  );

  /**
   * The latest matches response
   * @internal
   * @constant
   */
  const result: Ref<INeighborhoodMatchesResult | null> = ref(null);

  /**
   * Whether a matches request is in flight
   * @internal
   * @constant
   */
  const pending: Ref<boolean> = ref(false);

  /**
   * The latest request's error message
   * @internal
   * @constant
   */
  const error: Ref<string | null> = ref(null);

  /**
   * The abort handle for the in-flight request, so a newer request always wins
   * @internal
   */
  let inflight: AbortController | null = null;

  /* ─── Methods ──────────────────────────────────────────────────────────────────────────────────────────────────── */

  /**
   * Fetches matches for the current state and mirrors that state into the URL
   * @internal
   * @function
   */
  async function refresh(): Promise<void> {
    const query: Record<string, string | undefined> = {
      from: origin.value,
      w: serializeWeights(weights.value),
      scope: scope.value === 'all' ? 'all' : undefined,
      view: view.value ?? undefined,
    };

    // Replace (not push) so slider drags don't flood the history stack
    void router.replace({ query: Object.fromEntries(Object.entries(query).filter(([, value]) => value)) });

    inflight?.abort();
    const controller: AbortController = new AbortController();
    inflight = controller;
    pending.value = true;
    try {
      result.value = await $fetch<INeighborhoodMatchesResult>('/api/projects/neighborhood-explorer/matches', {
        query,
        signal: controller.signal,
      });
      error.value = null;
    } catch (caught: unknown) {
      if (!controller.signal.aborted) {
        error.value =
          (caught as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'The matches could not be loaded.';
      }
    } finally {
      if (inflight === controller) {
        pending.value = false;
      }
    }
  }

  /**
   * The debounced refresh; slider drags settle before a request fires
   * @internal
   * @constant
   */
  const scheduleRefresh: () => void = useDebounceFn(refresh, 180);

  /**
   * Searches the covered neighborhoods by name
   * @internal
   * @function
   * @param query - The search text
   * @returns The matching places
   */
  async function searchPlaces(query: string): Promise<INeighborhoodPlaceSummary[]> {
    if (!query.trim()) {
      return [];
    }
    return $fetch<INeighborhoodPlaceSummary[]>('/api/projects/neighborhood-explorer/places', { query: { q: query } });
  }

  /**
   * Restores every lens to its default weight
   * @internal
   * @function
   */
  function resetWeights(): void {
    weights.value = { ...NEIGHBORHOOD_DEFAULT_WEIGHTS };
  }

  /* ─── Lifecycle ────────────────────────────────────────────────────────────────────────────────────────────────── */

  // A new origin recenters the map on the origin's metro
  watch(origin, (): void => {
    view.value = null;
  });

  watch([origin, weights, scope, view], scheduleRefresh, { deep: true });
  onMounted(refresh);

  return {
    origin,
    weights,
    scope,
    view,
    result,
    pending,
    error,
    searchPlaces,
    resetWeights,
  };
}
