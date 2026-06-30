<script setup lang="ts">
/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                ██        ██                     ▄▄
 *                                ▀▀        ▀▀                     ██
 *                              ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                             ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * ██████████████████████████████ #components/content/DesignInspiration.vue ██████████████████████████████████████████
 *
 * MDC component embedded as `::design-inspiration`. Tells the design story: three nature photos (mountain valley,
 * coastal sunset, city twilight) each became one of the three themes on the site (day / sunset / night). Each card
 * shows the source image, the dominant palette extracted from it as swatches, and the resulting theme variables.
 *
 * Interactive: hover lifts the card, click previews that theme live on the whole site (toggleable). The active site
 * theme is highlighted so the user can see which one they're currently looking at.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { TTheme } from '~/composables/use-theme';

const { theme, setTheme } = useTheme();

interface InspirationCard {
  theme: TTheme;
  title: string;
  vibe: string;
  image: { src: string; alt: string; credit: string };
  palette: { name: string; hex: string; token: string }[];
}

const cards: InspirationCard[] = [
  {
    theme: 'day',
    title: 'Day',
    vibe: 'A mountain valley at noon: cream sky, earth, sage forest.',
    image: {
      src: '/images/blog/building-jj-dev/inspiration/kalen-emsley-Bkci_8qcdvQ-unsplash.jpg',
      alt: 'Kluane mountain valley with snow-capped peaks and forested foreground',
      credit: 'Kalen Emsley',
    },
    palette: [
      { name: 'Sky', hex: '#F8F4EE', token: '--color-bg' },
      { name: 'Stone', hex: '#DDD0BF', token: '--color-border' },
      { name: 'Earth', hex: '#8B6534', token: '--color-accent' },
      { name: 'Forest', hex: '#5E8C65', token: '--color-accent-secondary' },
    ],
  },
  {
    theme: 'sunset',
    title: 'Sunset',
    vibe: 'A coastal road at golden hour: terra, ember, warm rose.',
    image: {
      src: '/images/blog/building-jj-dev/inspiration/iris-papillon-FuxRM_jOFHY-unsplash.jpg',
      alt: 'Big Sur coastline at sunset with winding road and warm golden light',
      credit: 'Iris Papillon',
    },
    palette: [
      { name: 'Haze', hex: '#F4D9B8', token: '--color-bg' },
      { name: 'Rose', hex: '#C8765A', token: '--color-border' },
      { name: 'Ember', hex: '#A84835', token: '--color-accent' },
      { name: 'Gold', hex: '#D4763B', token: '--color-accent-secondary' },
    ],
  },
  {
    theme: 'night',
    title: 'Night',
    vibe: 'A city at twilight: deep blue, sage spark, ember on the horizon.',
    image: {
      src: '/images/blog/building-jj-dev/inspiration/martin-fu-jmJ62_Zq1bo-unsplash.jpg',
      alt: 'City lights at twilight under a deep blue sky fading to orange at the horizon',
      credit: 'Martin Fu',
    },
    palette: [
      { name: 'Twilight', hex: '#1A2138', token: '--color-bg' },
      { name: 'Steel', hex: '#3A4760', token: '--color-border' },
      { name: 'Spark', hex: '#9DB8A0', token: '--color-accent' },
      { name: 'Horizon', hex: '#D4763B', token: '--color-accent-secondary' },
    ],
  },
];

function preview(t: TTheme) {
  setTheme(t);
}
</script>

<template>
  <div class="not-prose my-12">
    <!-- Intro line -->
    <p class="text-caption text-ink-subtle mb-6 font-mono tracking-widest uppercase">
      Three palettes, three moments in light
      <span class="text-ink-subtle/60 ml-2 tracking-normal normal-case">(click a card to preview live)</span>
    </p>

    <div class="grid gap-5 md:grid-cols-3">
      <article
        v-for="card in cards"
        :key="card.theme"
        class="inspiration-card group bg-surface relative overflow-hidden rounded-2xl border transition-all duration-500"
        :class="theme === card.theme ? 'border-accent ring-accent/30 shadow-lg ring-1' : 'border-border'"
      >
        <!-- Image — clean, no text overlay -->
        <div class="relative aspect-[4/5] overflow-hidden">
          <NuxtImg
            :src="card.image.src"
            :alt="card.image.alt"
            width="560"
            height="700"
            format="webp"
            quality="78"
            loading="lazy"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <!-- Active indicator — only thing on the image -->
          <span
            v-if="theme === card.theme"
            class="bg-accent absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] tracking-widest text-stone-50 uppercase"
          >
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-stone-50" />
            Active
          </span>
        </div>

        <!-- Palette + meta -->
        <div class="p-5">
          <!-- Photo credit — tiny caption, low contrast. Uses <span> + display:block to avoid the prose `<p>` overrides. -->
          <span class="credit-line text-ink-subtle/60 font-mono tracking-wide">
            {{ card.image.credit }} · Unsplash
          </span>

          <!-- Theme title -->
          <h3 class="font-display text-h5 text-ink mt-2 mb-3 leading-tight font-bold">
            {{ card.title }}
          </h3>

          <span class="vibe-line font-body text-ink-muted leading-snug italic">
            {{ card.vibe }}
          </span>

          <!-- Palette swatches -->
          <div class="mb-4 flex gap-1.5">
            <div
              v-for="swatch in card.palette"
              :key="swatch.token"
              class="group/sw border-border/50 relative h-9 flex-1 rounded-md border"
              :style="{ backgroundColor: swatch.hex }"
              :title="`${swatch.name} · ${swatch.hex} · ${swatch.token}`"
            >
              <!-- Hover tooltip with hex + token -->
              <div
                class="border-border bg-bg text-ink-muted pointer-events-none absolute -top-12 left-1/2 z-10 -translate-x-1/2 rounded-md border px-2 py-1 font-mono text-[10px] whitespace-nowrap opacity-0 transition-opacity group-hover/sw:opacity-100"
              >
                <span class="font-medium">{{ swatch.hex }}</span>
                <span class="text-ink-subtle ml-1.5">{{ swatch.token }}</span>
              </div>
            </div>
          </div>

          <!-- Preview CTA -->
          <button
            type="button"
            class="text-caption inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 font-mono tracking-widest uppercase transition-colors"
            :class="
              theme === card.theme
                ? 'border-accent bg-accent/10 text-accent cursor-default'
                : 'border-border bg-bg text-ink-muted hover:border-accent hover:text-accent'
            "
            :disabled="theme === card.theme"
            @click="preview(card.theme)"
          >
            <Icon v-if="theme === card.theme" name="lucide:check" size="13" />
            <Icon v-else name="lucide:eye" size="13" />
            {{ theme === card.theme ? 'Previewing' : 'Preview theme' }}
          </button>
        </div>
      </article>
    </div>

    <!-- Footnote / lineage explanation -->
    <p class="font-body text-body-sm text-ink-muted mt-6 leading-relaxed">
      Each palette feeds the same set of semantic design tokens:
      <code class="text-caption text-accent font-mono">--color-bg</code>,
      <code class="text-caption text-accent font-mono">--color-accent</code>, etc. The themes themselves are nothing
      more than a single CSS attribute swap on <code class="text-caption text-accent font-mono">&lt;html&gt;</code>.
    </p>
  </div>
</template>

<style scoped>
.inspiration-card {
  transform: translateY(0);
  transition:
    transform 400ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 200ms ease,
    box-shadow 400ms ease;
}

.inspiration-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 40px -20px color-mix(in oklch, var(--color-accent) 35%, transparent);
}

/* Tight overrides to bypass prose `:deep(p)` cascading into this MDC component. */
.credit-line {
  display: block;
  font-size: 9px;
  letter-spacing: 0.05em;
  line-height: 1.4;
  margin: 0 0 0.5rem;
}

.vibe-line {
  display: block;
  font-size: var(--text-body-sm);
  margin: 0 0 1rem;
}
</style>
