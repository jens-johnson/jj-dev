<script setup lang="ts">
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
 * █████████████████████████████████████ #pages/projects/neighborhood-explorer.vue █████████████████████████████████████
 *
 * Neighborhood Explorer proof of concept: pick a neighborhood and find its closest twins in other cities.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type {
  INeighborhoodFeatureDefinition,
  INeighborhoodFeatureValue,
  INeighborhoodMatch,
  INeighborhoodMetro,
} from '#shared/neighborhood-explorer';
import { NEIGHBORHOOD_FEATURES, NEIGHBORHOOD_METROS } from '#shared/neighborhood-explorer';

useSeoMeta({
  title: 'Neighborhood Explorer · Projects · Jens Johnson',
  description: 'Pick a neighborhood and find its closest twins in other cities, weighted by what matters to you.',
  robots: 'noindex',
});

/* ─── STATE ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The explorer state, URL-synced, with server-side scoring
 * @internal
 * @constant
 */
const { origin, weights, scope, view, result, pending, error, searchPlaces, resetWeights } = useNeighborhoodExplorer();

/**
 * The id of the expanded match
 * @internal
 * @constant
 */
const selectedId: Ref<string | null> = ref(null);

/**
 * The headline stats shown under the origin, in display order
 * @internal
 * @constant
 */
const HEADLINE_KEYS: string[] = ['medianIncome', 'medianRent', 'popDensity', 'medianAge', 'meanTemp', 'cafes'];

/* ─── COMPUTED ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The metro the map shows: the explicit view, else the origin's metro, else the first covered metro
 * @internal
 * @constant
 */
const viewMetro: ComputedRef<INeighborhoodMetro> = computed(
  (): INeighborhoodMetro =>
    NEIGHBORHOOD_METROS.find((metro: INeighborhoodMetro) => metro.id === (view.value ?? result.value?.view)) ??
    (NEIGHBORHOOD_METROS[0] as INeighborhoodMetro),
);

/**
 * The expanded match, if it is still in the latest results
 * @internal
 * @constant
 */
const selectedMatch: ComputedRef<INeighborhoodMatch | undefined> = computed(() =>
  result.value?.matches.find((match: INeighborhoodMatch) => match.place.id === selectedId.value),
);

/**
 * Where the map should fly: the expanded match, else the origin when its metro is in view, else the whole metro
 * @internal
 * @constant
 */
const focus: ComputedRef<[number, number] | null> = computed((): [number, number] | null => {
  if (selectedMatch.value && selectedMatch.value.place.metro === viewMetro.value.id) {
    return selectedMatch.value.centroid;
  }
  if (result.value && result.value.origin.metro === viewMetro.value.id) {
    return result.value.originCentroid;
  }
  return null;
});

/**
 * The origin's headline stats, formatted
 * @internal
 * @constant
 */
const headline: ComputedRef<{ label: string; value: string }[]> = computed(() =>
  HEADLINE_KEYS.flatMap((key: string) => {
    const feature: INeighborhoodFeatureDefinition | undefined = NEIGHBORHOOD_FEATURES.find(
      (candidate: INeighborhoodFeatureDefinition) => candidate.key === key,
    );
    const value: INeighborhoodFeatureValue | undefined = result.value?.originFeatures.find(
      (candidate: INeighborhoodFeatureValue) => candidate.key === key,
    );
    return feature && value
      ? [{ label: feature.label, value: formatNeighborhoodValue(feature.format, value.value) }]
      : [];
  }),
);

/* ─── METHODS ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Expands a match (or collapses it on a second click) and shows its metro on the map
 * @internal
 * @function
 * @param match - The picked match
 */
function selectMatch(match: INeighborhoodMatch): void {
  if (selectedId.value === match.place.id) {
    selectedId.value = null;
    return;
  }
  selectedId.value = match.place.id;
  view.value = match.place.metro;
}

/**
 * Makes a place or tract the new origin
 * @internal
 * @function
 * @param id - The place id or tract GEOID
 */
function compareFrom(id: string): void {
  selectedId.value = null;
  origin.value = id;
}
</script>

<template>
  <div class="bg-bg min-h-screen">
    <div class="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 md:pt-28">
      <NuxtLink
        to="/projects"
        class="text-body-sm text-ink-muted hover:text-accent mb-8 inline-flex items-center gap-1.5 font-medium transition-colors"
      >
        <Icon
          name="lucide:arrow-left"
          size="15"
        />
        Projects
      </NuxtLink>

      <!-- ─── Hero ──────────────────────────────────────────────────────────────────── -->
      <header class="mb-10 max-w-3xl">
        <div class="mb-4 flex items-center gap-3">
          <span class="text-caption text-accent font-mono tracking-widest uppercase">Neighborhood Explorer</span>

          <span
            class="border-accent/30 bg-accent/10 text-caption text-accent inline-flex items-center rounded-full border px-2 py-0.5 font-medium"
          >
            Proof of concept
          </span>
        </div>

        <h1
          class="font-display text-ink font-bold tracking-tight"
          style="font-size: clamp(2.25rem, 5vw, 3.5rem)"
        >
          Find your neighborhood's twins.
        </h1>

        <p class="font-body text-body-lg text-ink-muted mt-4 leading-relaxed">
          Pick a neighborhood, tell it what matters, and see which places in other cities feel the most like it. Built
          from census, OpenStreetMap, and weather data. It compares places, never who lives in them.
        </p>
      </header>

      <div class="grid gap-6 lg:grid-cols-[23rem_minmax(0,1fr)] lg:items-start">
        <!-- ─── Origin ──────────────────────────────────────────────────────────────── -->
        <section class="lg:col-start-1 lg:row-start-1">
          <WidgetsProjectsNeighborhoodExplorerOriginSearch
            :origin="result?.origin ?? null"
            :search="searchPlaces"
            @select="compareFrom"
          />

          <dl
            v-if="headline.length"
            class="mt-4 grid grid-cols-3 gap-x-3 gap-y-3"
          >
            <div
              v-for="stat in headline"
              :key="stat.label"
            >
              <dt class="text-caption text-ink-muted truncate">{{ stat.label }}</dt>

              <dd class="font-body text-body-sm text-ink font-semibold tabular-nums">{{ stat.value }}</dd>
            </div>
          </dl>
        </section>

        <!-- ─── Map ─────────────────────────────────────────────────────────────────── -->
        <section
          class="border-border bg-surface relative h-[55vh] overflow-hidden rounded-3xl border lg:sticky lg:top-24 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:h-[calc(100vh-8rem)]"
          aria-label="Similarity map"
        >
          <ClientOnly>
            <WidgetsProjectsNeighborhoodExplorerMap
              :metro="viewMetro"
              :scores="result?.view === viewMetro.id ? result.tractScores : {}"
              :origin-tracts="result?.originTracts ?? []"
              :focus="focus"
              @compare="compareFrom"
            />
          </ClientOnly>

          <!-- Metro switcher -->
          <nav
            class="absolute inset-x-3 top-3 flex gap-1.5 overflow-x-auto pr-12"
            aria-label="Metros"
          >
            <button
              v-for="metro in NEIGHBORHOOD_METROS"
              :key="metro.id"
              type="button"
              class="text-caption shrink-0 rounded-full border px-3 py-1 font-semibold backdrop-blur transition-colors"
              :class="
                metro.id === viewMetro.id
                  ? 'border-accent bg-accent text-bg'
                  : 'border-border bg-bg/85 text-ink-muted hover:text-ink'
              "
              :aria-pressed="metro.id === viewMetro.id"
              @click="view = metro.id"
            >
              {{ metro.name }}
            </button>
          </nav>

          <!-- Legend -->
          <div
            class="border-border bg-bg/90 absolute bottom-3 left-3 rounded-xl border px-3 py-2 backdrop-blur"
            aria-hidden="true"
          >
            <p class="text-caption text-ink-muted mb-1">
              Similarity to <span class="text-ink font-semibold">{{ result?.origin.name ?? '…' }}</span>
            </p>

            <div class="legend-ramp h-1.5 w-40 rounded-full" />

            <div class="text-caption text-ink-subtle mt-0.5 flex justify-between font-mono">
              <span>0</span>

              <span>100</span>
            </div>
          </div>

          <span
            v-if="pending"
            class="border-border bg-bg/90 text-caption text-ink-muted absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur"
          >
            <Icon
              name="lucide:loader-circle"
              size="12"
              class="animate-spin"
            />
            Scoring
          </span>
        </section>

        <!-- ─── Matches ─────────────────────────────────────────────────────────────── -->
        <section
          class="lg:col-start-1 lg:row-start-3"
          aria-labelledby="matches-heading"
        >
          <h2
            id="matches-heading"
            class="text-caption text-ink-muted mb-3 font-mono tracking-widest uppercase"
          >
            Closest matches
          </h2>

          <p
            v-if="error"
            class="text-body-sm text-ink-muted"
            role="alert"
          >
            {{ error }}
          </p>

          <WidgetsProjectsNeighborhoodExplorerMatchList
            v-else-if="result"
            :matches="result.matches"
            :origin-name="result.origin.name"
            :selected-id="selectedId"
            @select="selectMatch"
            @compare="compareFrom"
          />

          <p
            v-else
            class="text-body-sm text-ink-muted"
          >
            Scoring neighborhoods…
          </p>
        </section>

        <!-- ─── Lenses ──────────────────────────────────────────────────────────────── -->
        <ContainmentCard
          class="lg:col-start-1 lg:row-start-2"
          pad="md"
        >
          <WidgetsProjectsNeighborhoodExplorerLensControls
            v-model:weights="weights"
            v-model:scope="scope"
            @reset="resetWeights"
          />
        </ContainmentCard>
      </div>

      <!-- ─── Notes ───────────────────────────────────────────────────────────────── -->
      <footer class="text-caption text-ink-muted mt-12 max-w-3xl space-y-2 leading-relaxed">
        <p>
          Covers {{ NEIGHBORHOOD_METROS.length }} metros at census-tract level. Demographics and housing come from the
          ACS 2020–2024 5-year estimates via Census Reporter; amenities and neighborhood names from OpenStreetMap;
          climate from Open-Meteo's ERA5 reanalysis (2023–2024). Every feature is ranked to a percentile, so a match
          means "similar relative to these metros," not identical raw numbers.
        </p>

        <p>
          Race, ethnicity, ancestry, religion, and language are deliberately left out. The explorer compares the places,
          not the people.
        </p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.legend-ramp {
  background: linear-gradient(
    to right,
    color-mix(in sRGB, var(--color-accent) 4%, transparent),
    color-mix(in sRGB, var(--color-accent) 12%, transparent) 50%,
    color-mix(in sRGB, var(--color-accent) 35%, transparent) 70%,
    color-mix(in sRGB, var(--color-accent) 85%, transparent)
  );
}
</style>
