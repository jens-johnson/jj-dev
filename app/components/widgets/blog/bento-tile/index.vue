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
 * ███████████████████████████████████ #components/widgets/blog/bento-tile/index.vue ███████████████████████████████████
 *
 * Bento tile; renders a single pick card, switching layout on the card variant (image, quote, link, text).
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
import type { IBentoTileProps } from './types';
import { embedSrc } from './utils';

/* ─── PROPS ──────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Component props; the single card this tile renders, switched on `card.type`
 * @internal
 * @constant
 */
const props = defineProps<IBentoTileProps>();

/* ─── COMPUTED ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The card's outbound link, when it carries one; embed cards have no `href` (they own an interactive player), so the
 * `in` guard keeps the union access type-safe
 * @internal
 * @constant
 */
const href: ComputedRef<string | undefined> = computed((): string | undefined =>
  'href' in props.card ? props.card.href : undefined,
);

/**
 * The root element for the tile; an anchor when the card carries an outbound link, otherwise a plain div
 * @internal
 * @constant
 */
const rootTag: ComputedRef<'a' | 'div'> = computed((): 'a' | 'div' => (href.value ? 'a' : 'div'));

/**
 * The attributes bound to the root element; wires up the outbound link (new tab, safe rel) when one is present
 * @internal
 * @constant
 */
const rootAttrs: ComputedRef<Record<string, string>> = computed(
  (): Record<string, string> =>
    href.value
      ? {
          href: href.value,
          target: '_blank',
          rel: 'noopener noreferrer',
        }
      : {},
);

/**
 * The iframe embed src for an embed card, resolved from its provider + share URL; null for non-embed cards or an
 * unparseable URL, in which case the tile falls back to a plain outbound link
 * @internal
 * @constant
 */
const embedUrl: ComputedRef<string | null> = computed((): string | null =>
  props.card.type === 'embed' ? embedSrc(props.card.provider, props.card.url) : null,
);
</script>

<template>
  <component
    :is="rootTag"
    v-bind="rootAttrs"
    class="relative flex h-full flex-col focus:outline-none"
  >
    <!-- ─── Image tile ────────────────────────────────────────────────────────── -->
    <template v-if="card.type === 'image'">
      <img
        :src="card.src"
        :alt="card.alt"
        loading="lazy"
        class="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />

      <!-- Legibility scrim behind the tag + caption -->
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/55 via-transparent to-transparent"
      />

      <div class="relative flex h-full flex-col justify-between p-3">
        <DataCategoryTag
          :category="card.category"
          class="bg-bg/85 backdrop-blur-sm"
        />

        <p
          v-if="card.caption"
          class="font-body text-body-sm leading-snug font-medium text-stone-50 drop-shadow"
        >
          {{ card.caption }}
        </p>
      </div>
    </template>

    <!-- ─── Quote tile ────────────────────────────────────────────────────────── -->
    <template v-else-if="card.type === 'quote'">
      <div class="flex h-full flex-col justify-between p-6">
        <Icon
          name="lucide:quote"
          size="22"
          class="text-accent/40 mb-3"
        />

        <blockquote class="font-display text-h5 text-ink leading-snug font-medium text-balance italic">
          {{ card.text }}
        </blockquote>

        <div class="mt-4 flex items-center justify-between gap-3">
          <p
            v-if="card.attribution"
            class="text-caption text-ink-muted font-mono"
          >
            — {{ card.attribution }}
          </p>

          <DataCategoryTag
            :category="card.category"
            class="ml-auto"
          />
        </div>
      </div>
    </template>

    <!-- ─── Link tile ─────────────────────────────────────────────────────────── -->
    <template v-else-if="card.type === 'link'">
      <img
        v-if="card.src"
        :src="card.src"
        :alt="card.alt ?? ''"
        loading="lazy"
        class="h-28 w-full shrink-0 object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />

      <div class="flex h-full flex-col p-5">
        <DataCategoryTag :category="card.category" />

        <h3 class="font-display text-h5 text-ink group-hover:text-accent mt-3 leading-snug font-bold transition-colors">
          {{ card.title }}
        </h3>

        <p
          v-if="card.note"
          class="font-body text-body-sm text-ink-muted mt-1.5 leading-relaxed"
        >
          {{ card.note }}
        </p>

        <span
          class="text-caption text-accent mt-auto inline-flex items-center gap-1 pt-4 font-mono tracking-widest uppercase"
        >
          Visit
          <Icon
            name="lucide:arrow-up-right"
            size="12"
            class="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </template>

    <!-- ─── Embed tile (playable media) ───────────────────────────────────────── -->
    <template v-else-if="card.type === 'embed'">
      <div class="flex h-full flex-col p-5">
        <div class="flex items-center justify-between gap-3">
          <DataCategoryTag :category="card.category" />

          <a
            :href="card.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-caption text-ink-subtle hover:text-accent inline-flex items-center gap-1 font-mono tracking-widest uppercase transition-colors"
          >
            Open
            <Icon
              name="lucide:arrow-up-right"
              size="11"
            />
          </a>
        </div>

        <h3
          v-if="card.title"
          class="font-display text-h5 text-ink mt-3 leading-snug font-bold"
        >
          {{ card.title }}
        </h3>

        <p
          v-if="card.note"
          class="font-body text-body-sm text-ink-muted mt-1.5 leading-relaxed"
        >
          {{ card.note }}
        </p>

        <!-- Player -->
        <div class="mt-4">
          <!-- Spotify: compact fixed-height player -->
          <iframe
            v-if="embedUrl && card.provider === 'spotify'"
            :src="embedUrl"
            :title="card.title ?? 'Spotify player'"
            height="152"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            class="w-full rounded-xl border-0"
          />

          <!-- YouTube: 16:9 responsive player -->
          <div
            v-else-if="embedUrl && card.provider === 'youtube'"
            class="aspect-video w-full overflow-hidden rounded-xl"
          >
            <iframe
              :src="embedUrl"
              :title="card.title ?? 'YouTube player'"
              loading="lazy"
              allow="
                accelerometer;
                autoplay;
                clipboard-write;
                encrypted-media;
                gyroscope;
                picture-in-picture;
                web-share;
              "
              allowfullscreen
              referrerpolicy="strict-origin-when-cross-origin"
              class="size-full border-0"
            />
          </div>

          <!-- Fallback: unparseable URL → plain outbound link -->
          <a
            v-else
            :href="card.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-caption text-accent inline-flex items-center gap-1 font-mono tracking-widest uppercase"
          >
            Open link
            <Icon
              name="lucide:arrow-up-right"
              size="12"
            />
          </a>
        </div>
      </div>
    </template>

    <!-- ─── Text tile ─────────────────────────────────────────────────────────── -->
    <template v-else>
      <div class="flex h-full flex-col p-5">
        <DataCategoryTag :category="card.category" />

        <h3
          v-if="card.title"
          class="font-display text-h5 text-ink mt-3 leading-snug font-bold"
        >
          {{ card.title }}
        </h3>

        <p class="font-body text-body-sm text-ink-muted mt-2 leading-relaxed whitespace-pre-line">
          {{ card.body }}
        </p>
      </div>
    </template>
  </component>
</template>
