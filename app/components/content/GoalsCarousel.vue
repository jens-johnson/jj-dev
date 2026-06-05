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
 * ████████████████████████████████ #components/content/GoalsCarousel.vue ████████████████████████████████████████████
 *
 * MDC component embedded as `::goals-carousel`. The three foundational project goals as an interactive card
 * carousel: snap-scroll on mobile, three-up grid on desktop with hover tilt + accent illustrations.
 *
 * Each goal has its own subtle micro-illustration (geometric SVG) and an animation that plays on hover, plus a
 * persistent active state that lets the user dwell on whichever card is currently focused.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

const goals = [
  {
    num: '01',
    title: 'Bare Metal, No Template',
    icon: 'lucide:layers',
    body: 'After several iterations and headaches adapting libraries and templates (Vuetify, PrimeBlocks, you name it), I decided to build this iteration from scratch. A design token set and component library with a Tailwind-native approach, building off concepts like Material UI. Personal, highly customized, from the very beginning.',
    visual: 'layers' as const,
  },
  {
    num: '02',
    title: 'Design Driven by Nature',
    icon: 'lucide:leaf',
    body: 'A design rooted in natural concepts is an integral facet of my personal and professional ethos. Design tokens and theming based on an earthy, natural feel, instead of the "neutral grey + electric techno accent" aesthetic that has become the growing trend amongst portfolio websites.',
    visual: 'leaf' as const,
  },
  {
    num: '03',
    title: 'Public from the Start',
    icon: 'lucide:git-branch',
    body: 'Like any good open-source project: capture and document my process from day one. Show the learnings, the wins, the losses, and let `jj-dev` document itself. Every PR, every iteration, every dead-end visible to anyone curious enough to look.',
    visual: 'branch' as const,
  },
];

const activeIdx = ref(0);
const scrollContainer = ref<HTMLElement | null>(null);

function scrollTo(i: number) {
  activeIdx.value = i;
  if (!scrollContainer.value) return;
  const target = scrollContainer.value.children[i] as HTMLElement | undefined;
  if (target) {
    scrollContainer.value.scrollTo({ left: target.offsetLeft - 16, behavior: 'smooth' });
  }
}

/** Track scroll position to update activeIdx on mobile swipe. */
function onScroll() {
  if (!scrollContainer.value) return;
  const { scrollLeft, clientWidth } = scrollContainer.value;
  const i = Math.round(scrollLeft / (clientWidth * 0.85));
  activeIdx.value = Math.min(goals.length - 1, Math.max(0, i));
}
</script>

<template>
  <div class="not-prose my-12">
    <!-- ── Mobile: horizontal snap carousel ────────────────────────────── -->
    <div
      ref="scrollContainer"
      class="scrollbar-hide -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:hidden"
      @scroll.passive="onScroll"
    >
      <article
        v-for="(goal, i) in goals"
        :key="goal.num"
        class="goal-card border-border bg-surface w-[85%] shrink-0 snap-center rounded-2xl border p-6"
        :class="{ 'is-active': i === activeIdx }"
      >
        <ContentGoalsCarouselVisual :variant="goal.visual" :icon="goal.icon" />
        <p class="text-caption text-accent mt-4 font-mono tracking-widest">{{ goal.num }}</p>
        <h3 class="font-display text-h5 text-ink mt-1 mb-3 leading-tight font-bold">{{ goal.title }}</h3>
        <p class="font-body text-body-sm text-ink-muted leading-relaxed">{{ goal.body }}</p>
      </article>
    </div>

    <!-- Mobile dots -->
    <div class="mt-2 flex justify-center gap-2 md:hidden">
      <button
        v-for="(_, i) in goals"
        :key="i"
        type="button"
        class="h-1.5 rounded-full transition-all"
        :class="i === activeIdx ? 'bg-accent w-8' : 'bg-border w-1.5'"
        :aria-label="`Goal ${i + 1}`"
        @click="scrollTo(i)"
      />
    </div>

    <!-- ── Desktop: three-up grid with hover-tilt ─────────────────────── -->
    <div class="hidden gap-5 md:grid md:grid-cols-3">
      <article
        v-for="(goal, i) in goals"
        :key="goal.num"
        class="goal-card group border-border bg-surface relative overflow-hidden rounded-2xl border p-7 transition-all duration-500"
        :class="{ 'is-active': i === activeIdx }"
        @mouseenter="activeIdx = i"
      >
        <!-- Decorative number watermark (giant, behind content) -->
        <span
          class="font-display text-accent pointer-events-none absolute -right-2 -bottom-6 text-[7rem] leading-none font-bold opacity-[0.05] select-none"
          aria-hidden="true"
          >{{ goal.num }}</span
        >

        <!-- Visual illustration -->
        <div class="relative z-10 mb-5">
          <ContentGoalsCarouselVisual :variant="goal.visual" :icon="goal.icon" />
        </div>

        <!-- Meta -->
        <p class="text-caption text-accent relative z-10 font-mono tracking-widest">{{ goal.num }}</p>
        <h3 class="font-display text-h5 text-ink relative z-10 mt-1 mb-3 leading-tight font-bold">
          {{ goal.title }}
        </h3>
        <p class="font-body text-body-sm text-ink-muted relative z-10 leading-relaxed">
          {{ goal.body }}
        </p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.goal-card {
  transform: translateY(0);
  transition:
    transform 400ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 200ms ease,
    box-shadow 400ms ease;
}

.goal-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-accent);
  box-shadow: 0 12px 32px -16px color-mix(in oklch, var(--color-accent) 30%, transparent);
}

.goal-card.is-active {
  border-color: color-mix(in oklch, var(--color-accent) 40%, var(--color-border));
}

.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
