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
 * ████████████████████ #components/widgets/projects/neighborhood-explorer/origin-search/index.vue █████████████████████
 *
 * Combobox for picking the origin neighborhood by name, with keyboard navigation.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import { useDebounceFn } from '@vueuse/core';

import type { INeighborhoodPlaceSummary } from '#shared/neighborhood-explorer';

import type { INeighborhoodOriginSearchEmits, INeighborhoodOriginSearchProps } from './types';

/* ─── PROPS & EMITS ──────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The component props
 * @internal
 * @constant
 */
const props: INeighborhoodOriginSearchProps = defineProps<INeighborhoodOriginSearchProps>();

/**
 * The component emits
 * @internal
 * @constant
 */
const emit = defineEmits<INeighborhoodOriginSearchEmits>();

/* ─── STATE ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The text in the search box
 * @internal
 * @constant
 */
const query: Ref<string> = ref('');

/**
 * The latest suggestions
 * @internal
 * @constant
 */
const suggestions: Ref<INeighborhoodPlaceSummary[]> = ref([]);

/**
 * The keyboard-highlighted suggestion index
 * @internal
 * @constant
 */
const highlighted: Ref<number> = ref(0);

/**
 * Whether the suggestion list is open
 * @internal
 * @constant
 */
const open: Ref<boolean> = ref(false);

/* ─── METHODS ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Fetches suggestions for the current text, dropping responses for text the user has since changed
 * @internal
 * @constant
 */
const lookup: () => void = useDebounceFn(async (): Promise<void> => {
  const text: string = query.value;
  const results: INeighborhoodPlaceSummary[] = await props.search(text).catch(() => []);
  if (text === query.value) {
    suggestions.value = results;
    highlighted.value = 0;
    open.value = true;
  }
}, 150);

/**
 * Handles typing in the search box
 * @internal
 * @function
 */
function onInput(): void {
  if (!query.value.trim()) {
    suggestions.value = [];
    open.value = false;
    return;
  }
  lookup();
}

/**
 * Picks a suggestion and clears the box
 * @internal
 * @function
 * @param place - The chosen place
 */
function choose(place: INeighborhoodPlaceSummary | undefined): void {
  if (!place) {
    return;
  }
  emit('select', place.id);
  query.value = '';
  suggestions.value = [];
  open.value = false;
}

/**
 * Handles arrow, enter, and escape keys in the search box
 * @internal
 * @function
 * @param event - The keyboard event
 */
function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const step: number = event.key === 'ArrowDown' ? 1 : -1;
    const count: number = suggestions.value.length;
    highlighted.value = count ? (highlighted.value + step + count) % count : 0;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    choose(suggestions.value[highlighted.value]);
  } else if (event.key === 'Escape') {
    open.value = false;
  }
}
</script>

<template>
  <div class="relative">
    <label
      for="origin-search"
      class="text-caption text-ink-muted mb-2 block font-mono tracking-widest uppercase"
    >
      Start from
    </label>

    <div
      class="border-border bg-bg focus-within:border-accent flex items-center gap-2 rounded-2xl border px-4 py-3 transition-colors"
    >
      <Icon
        name="lucide:map-pin"
        size="16"
        class="text-accent shrink-0"
      />

      <input
        id="origin-search"
        v-model="query"
        type="search"
        autocomplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-controls="origin-search-list"
        :aria-expanded="open && suggestions.length > 0"
        :placeholder="origin ? `${origin.name}, ${origin.metroLabel}` : 'Search a neighborhood'"
        class="font-body text-body-sm text-ink placeholder:text-ink min-w-0 flex-1 bg-transparent outline-none placeholder:font-semibold"
        @input="onInput"
        @keydown="onKeydown"
        @focus="open = suggestions.length > 0"
        @blur="open = false"
      />
    </div>

    <ul
      v-if="open && query.trim()"
      id="origin-search-list"
      role="listbox"
      class="border-border bg-bg absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border shadow-lg"
    >
      <li
        v-for="(place, index) in suggestions"
        :key="place.id"
        role="option"
        :aria-selected="index === highlighted"
        class="cursor-pointer px-4 py-2.5"
        :class="index === highlighted ? 'bg-surface' : ''"
        @mousedown.prevent="choose(place)"
        @mouseenter="highlighted = index"
      >
        <span class="font-body text-body-sm text-ink font-semibold">{{ place.name }}</span>

        <span class="text-caption text-ink-muted ml-2">{{ place.metroLabel }}</span>
      </li>

      <li
        v-if="!suggestions.length"
        class="text-body-sm text-ink-muted px-4 py-2.5"
      >
        No covered neighborhood matches. Try another name.
      </li>
    </ul>
  </div>
</template>
