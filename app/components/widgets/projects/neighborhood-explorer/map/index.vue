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
 * █████████████████████████ #components/widgets/projects/neighborhood-explorer/map/index.vue ██████████████████████████
 *
 * MapLibre map shading each tract in the viewed metro by similarity to the origin; click a tract to compare from it.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import 'maplibre-gl/dist/maplibre-gl.css';

import type { ExpressionSpecification, Map as MaplibreMap, MapLayerMouseEvent, Popup } from 'maplibre-gl';

import {
  NEIGHBORHOOD_MAP_FOCUS_ZOOM,
  NEIGHBORHOOD_MAP_LAYERS,
  NEIGHBORHOOD_MAP_OPACITY_STOPS,
  NEIGHBORHOOD_MAP_SOURCE,
  NEIGHBORHOOD_MAP_STYLES,
} from './constants';
import type { INeighborhoodExplorerMapEmits, INeighborhoodExplorerMapProps } from './types';

/* ─── PROPS & EMITS ──────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The component props
 * @internal
 * @constant
 */
const props: INeighborhoodExplorerMapProps = defineProps<INeighborhoodExplorerMapProps>();

/**
 * The component emits
 * @internal
 * @constant
 */
const emit = defineEmits<INeighborhoodExplorerMapEmits>();

/* ─── STATE ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The map container element
 * @internal
 * @constant
 */
const container: Ref<HTMLDivElement | null> = ref(null);

/**
 * The active theme; drives the basemap style and the fill color
 * @internal
 * @constant
 */
const { theme } = useTheme();

/**
 * The basemap style URL for the active theme
 * @internal
 * @constant
 */
const styleUrl: ComputedRef<string> = computed(
  (): string => NEIGHBORHOOD_MAP_STYLES[theme.value === 'day' ? 'light' : 'dark'],
);

/**
 * The MapLibre module, loaded lazily on mount so it never runs during SSR
 * @internal
 */
let maplibre: typeof import('maplibre-gl') | null = null;

/**
 * The live map instance
 * @internal
 */
let map: MaplibreMap | null = null;

/**
 * The metro whose geometry the tract source currently holds
 * @internal
 */
let loadedMetro: string | null = null;

/**
 * The open click popup, if any
 * @internal
 */
let popup: Popup | null = null;

/**
 * Whether the current basemap style has finished parsing; `isStyleLoaded()` stays false until every basemap tile
 * source settles, which is too late (and racy) for adding our own layers
 * @internal
 */
let styleReady: boolean = false;

/* ─── METHODS ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Reads a design token from the document root
 * @internal
 * @function
 * @param name - The CSS custom property name
 * @returns The token value
 */
function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Adds (or replaces) the tract source and its layers for the current metro, beneath the basemap labels
 * @internal
 * @function
 */
function ensureLayers(): void {
  if (!map || !styleReady) {
    return;
  }

  // Swap the source when the metro changed (or after a style reload wiped it)
  if (loadedMetro !== props.metro.id || !map.getSource(NEIGHBORHOOD_MAP_SOURCE)) {
    for (const layer of Object.values(NEIGHBORHOOD_MAP_LAYERS)) {
      if (map.getLayer(layer)) {
        map.removeLayer(layer);
      }
    }
    if (map.getSource(NEIGHBORHOOD_MAP_SOURCE)) {
      map.removeSource(NEIGHBORHOOD_MAP_SOURCE);
    }

    map.addSource(NEIGHBORHOOD_MAP_SOURCE, {
      type: 'geojson',
      // Absolute, because MapLibre fetches GeoJSON inside a web worker that can't resolve root-relative paths
      data: new URL(`/data/neighborhood-explorer/${props.metro.id}.geojson`, window.location.origin).href,
      promoteId: 'geoid',
    });

    const beforeId: string | undefined = map.getStyle().layers.find((layer) => layer.type === 'symbol')?.id;
    const score: ExpressionSpecification = ['feature-state', 'score'];
    map.addLayer(
      {
        id: NEIGHBORHOOD_MAP_LAYERS.fill,
        type: 'fill',
        source: NEIGHBORHOOD_MAP_SOURCE,
        paint: {
          'fill-opacity': [
            'case',
            ['==', ['typeof', score], 'number'],
            ['interpolate', ['linear'], ['number', score], ...NEIGHBORHOOD_MAP_OPACITY_STOPS.flat()],
            0,
          ],
        },
      },
      beforeId,
    );
    map.addLayer(
      {
        id: NEIGHBORHOOD_MAP_LAYERS.outline,
        type: 'line',
        source: NEIGHBORHOOD_MAP_SOURCE,
        paint: { 'line-width': 0.4, 'line-opacity': 0.35 },
      },
      beforeId,
    );
    map.addLayer(
      {
        id: NEIGHBORHOOD_MAP_LAYERS.origin,
        type: 'line',
        source: NEIGHBORHOOD_MAP_SOURCE,
        paint: { 'line-width': 2.25 },
      },
      beforeId,
    );
    loadedMetro = props.metro.id;
  }

  applyPaint();
  applyScores();
}

/**
 * Paints the tract layers from the current theme's tokens
 * @internal
 * @function
 */
function applyPaint(): void {
  if (!map?.getLayer(NEIGHBORHOOD_MAP_LAYERS.fill)) {
    return;
  }
  map.setPaintProperty(NEIGHBORHOOD_MAP_LAYERS.fill, 'fill-color', token('--color-accent'));
  map.setPaintProperty(NEIGHBORHOOD_MAP_LAYERS.outline, 'line-color', token('--color-ink-muted'));
  map.setPaintProperty(NEIGHBORHOOD_MAP_LAYERS.origin, 'line-color', token('--color-ink'));
}

/**
 * Pushes the tract scores into feature state and outlines the origin tracts
 * @internal
 * @function
 */
function applyScores(): void {
  if (!map?.getSource(NEIGHBORHOOD_MAP_SOURCE)) {
    return;
  }
  map.removeFeatureState({ source: NEIGHBORHOOD_MAP_SOURCE });
  for (const [geoid, score] of Object.entries(props.scores)) {
    map.setFeatureState({ source: NEIGHBORHOOD_MAP_SOURCE, id: geoid }, { score });
  }
  map.setFilter(NEIGHBORHOOD_MAP_LAYERS.origin, ['in', ['get', 'geoid'], ['literal', props.originTracts]]);
}

/**
 * Flies to the focus point, or frames the whole metro when there is none
 * @internal
 * @function
 */
function frame(): void {
  map?.flyTo(
    props.focus
      ? { center: props.focus, zoom: NEIGHBORHOOD_MAP_FOCUS_ZOOM }
      : { center: props.metro.center, zoom: props.metro.zoom },
  );
}

/**
 * Opens a popup for a clicked tract with its score and a compare-from-here action
 * @internal
 * @function
 * @param event - The layer click event
 */
function openPopup(event: MapLayerMouseEvent): void {
  const geoid: unknown = event.features?.[0]?.properties?.geoid;
  if (!map || !maplibre || typeof geoid !== 'string') {
    return;
  }
  const score: number | undefined = props.scores[geoid];

  // Build the popup with DOM APIs so no tract data is ever interpolated into HTML
  const body: HTMLDivElement = document.createElement('div');
  body.className = 'neighborhood-popup';
  const title: HTMLParagraphElement = document.createElement('p');
  title.className = 'neighborhood-popup__score';
  title.textContent = score === undefined ? 'Not enough data' : `${score}% similar`;
  const meta: HTMLParagraphElement = document.createElement('p');
  meta.className = 'neighborhood-popup__meta';
  meta.textContent = `Tract ${geoid.slice(5, 9)}.${geoid.slice(9)}`;
  body.append(title, meta);

  if (score !== undefined) {
    const button: HTMLButtonElement = document.createElement('button');
    button.type = 'button';
    button.className = 'neighborhood-popup__action';
    button.textContent = 'Compare from here';
    button.addEventListener('click', (): void => {
      popup?.remove();
      emit('compare', geoid);
    });
    body.append(button);
  }

  popup?.remove();
  popup = new maplibre.Popup({
    closeButton: false,
    offset: 8,
    maxWidth: '220px',
  })
    .setLngLat(event.lngLat)
    .setDOMContent(body)
    .addTo(map);
}

/* ─── LIFECYCLE ──────────────────────────────────────────────────────────────────────────────────────────────────── */

onMounted(async (): Promise<void> => {
  maplibre = await import('maplibre-gl');
  if (!container.value) {
    return;
  }

  map = new maplibre.Map({
    container: container.value,
    style: styleUrl.value,
    center: props.metro.center,
    zoom: props.metro.zoom,
    attributionControl: { compact: true },
  });
  map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');

  // Style reloads (theme switches) wipe custom layers; re-add them each time, then frame whatever arrived meanwhile
  map.on('style.load', (): void => {
    styleReady = true;
    ensureLayers();
  });
  map.once('load', frame);
  map.on('click', NEIGHBORHOOD_MAP_LAYERS.fill, openPopup);
  map.on('mouseenter', NEIGHBORHOOD_MAP_LAYERS.fill, (): void => {
    map?.getCanvas().style.setProperty('cursor', 'pointer');
  });
  map.on('mouseleave', NEIGHBORHOOD_MAP_LAYERS.fill, (): void => {
    map?.getCanvas().style.removeProperty('cursor');
  });
});

onBeforeUnmount((): void => {
  popup?.remove();
  map?.remove();
  map = null;
});

watch(
  (): string => props.metro.id,
  (): void => {
    popup?.remove();
    ensureLayers();
  },
);
// Compare the focus by value; every rescore hands over a fresh array for the same point
watch([(): string => props.metro.id, (): string => props.focus?.join() ?? ''], frame);
watch([(): Record<string, number> => props.scores, (): string[] => props.originTracts], applyScores);
watch(styleUrl, (url: string): void => {
  styleReady = false;
  map?.setStyle(url, { diff: false });
});

// Sunset and night share the dark basemap, so a theme switch between them only repaints the accent
watch(theme, (): void => {
  void nextTick(applyPaint);
});
</script>

<template>
  <div
    ref="container"
    class="h-full w-full"
    role="region"
    aria-label="Map of neighborhood similarity"
  />
</template>

<style scoped>
:deep(.maplibregl-popup-content) {
  padding: 0.75rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-bg);
  color: var(--color-ink);
  box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
}

:deep(.maplibregl-popup-tip) {
  display: none;
}

:deep(.neighborhood-popup__score) {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
}

:deep(.neighborhood-popup__meta) {
  margin-top: 0.125rem;
  color: var(--color-ink-muted);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
}

:deep(.neighborhood-popup__action) {
  margin-top: 0.5rem;
  color: var(--color-accent);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
}

:deep(.neighborhood-popup__action:hover) {
  text-decoration: underline;
}
</style>
