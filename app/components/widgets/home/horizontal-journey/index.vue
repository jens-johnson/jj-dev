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
 * ███████████████████████████████ #components/widgets/home/horizontal-journey/index.vue ███████████████████████████████
 *
 * Vertical scroll to horizontal panel sweep. The outer wrapper is PANELS × 100vh tall; a sticky container translates the track.
 *
 * ─── USAGE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Panels: 01 About · 02 Projects · 03 Writing · 04 Connect.
 *
 * Scroll position drives lerpProgress (0–1), which translates the panel track
 * left by (progress × (PANELS-1) × 100vw). Panel indicator dots navigate by
 * programmatic scrollTo.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

const PANELS = 4;
const PANEL_NAMES = ['About', 'Projects', 'Writing', 'Connect'];

// ── Data ──────────────────────────────────────────────────────────────────────
const { data: posts } = await useAsyncData('journey-posts', () =>
  queryCollection('blog').where('draft', '=', false).order('publishedAt', 'DESC').limit(4).all(),
);

// ── Scroll tracking ───────────────────────────────────────────────────────────
const outerRef = ref<HTMLElement | null>(null);
const rawProgress = ref(0);
const lerpProgress = ref(0);
let raf: number;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function onScroll() {
  if (!outerRef.value || !import.meta.client) return;
  const rect = outerRef.value.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  rawProgress.value = scrollable > 0 ? Math.max(0, Math.min(1, -rect.top / scrollable)) : 0;
}

function tick() {
  lerpProgress.value = lerp(lerpProgress.value, rawProgress.value, 0.09);
  raf = requestAnimationFrame(tick);
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, {
    passive: true,
  });
  raf = requestAnimationFrame(tick);
  onScroll();
});
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  cancelAnimationFrame(raf);
});

// ── Derived ───────────────────────────────────────────────────────────────────
/** Translate the track left by (progress × panels-1 × 100vw). */
const trackStyle = computed(() => ({
  transform: `translateX(${-lerpProgress.value * (PANELS - 1) * 100}vw)`,
}));

/** Snap-nearest panel index (for indicators). */
const activePanel = computed(() => Math.min(PANELS - 1, Math.round(rawProgress.value * (PANELS - 1))));

// ── Navigation click (indicator dots) ────────────────────────────────────────
function scrollToPanel(i: number) {
  if (!import.meta.client || !outerRef.value) return;
  const rect = outerRef.value.getBoundingClientRect();
  const scrollable = outerRef.value.offsetHeight - window.innerHeight;
  const target = window.scrollY + rect.top + (i / (PANELS - 1)) * scrollable;
  window.scrollTo({
    top: target,
    behavior: 'smooth',
  });
}
</script>

<template>
  <!-- Outer: tall enough for PANELS scroll lengths -->
  <div ref="outerRef" class="relative" :style="{ height: `${PANELS * 100}vh` }">
    <!-- Sticky viewport-height container -->
    <div class="sticky top-0 h-screen overflow-hidden">
      <!-- ── Panel indicator ──────────────────────────────────────────────── -->
      <div
        class="pointer-events-none absolute top-1/2 right-8 z-20 flex -translate-y-1/2 flex-col items-center gap-3"
        aria-hidden="true"
      >
        <button
          v-for="(name, i) in PANEL_NAMES"
          :key="i"
          class="group pointer-events-auto flex items-center gap-2"
          :aria-label="name"
          @click="scrollToPanel(i)"
        >
          <span
            class="font-mono text-[10px] tracking-widest uppercase transition-colors duration-300"
            :class="i === activePanel ? 'text-accent' : 'text-ink-subtle opacity-0 group-hover:opacity-100'"
            >{{ name }}</span
          >
          <span
            class="block rounded-full transition-all duration-300"
            :class="i === activePanel ? 'bg-accent h-5 w-1.5' : 'bg-border hover:bg-ink-subtle h-1.5 w-1.5'"
          />
        </button>
      </div>

      <!-- ── Bottom progress bar ──────────────────────────────────────────── -->
      <div class="bg-border pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-px" aria-hidden="true">
        <div class="bg-accent h-full origin-left" :style="{ transform: `scaleX(${rawProgress})` }" />
      </div>

      <!-- ── Horizontal track ─────────────────────────────────────────────── -->
      <div class="flex h-full will-change-transform" :style="trackStyle">
        <!-- ══════════════════════════════════════════════════════════════════
             PANEL 01 — ABOUT
        ═══════════════════════════════════════════════════════════════════ -->
        <section class="border-border relative flex h-full w-screen flex-shrink-0 overflow-hidden border-r">
          <!-- Decorative number -->
          <span
            class="font-display text-ink pointer-events-none absolute top-1/2 right-0 translate-x-[10%] -translate-y-1/2 leading-none font-bold opacity-[0.04] select-none"
            style="font-size: clamp(12rem, 28vw, 22rem)"
            aria-hidden="true"
            >01</span
          >

          <!-- Two-column layout: bio left, animation right -->
          <div class="grid h-full w-full grid-cols-1 lg:grid-cols-2">
            <!-- Left: bio — always visible (first panel) -->
            <div class="z-10 flex flex-col justify-center px-8 lg:px-16">
              <p class="text-caption text-accent mb-4 font-mono tracking-widest uppercase">01 — About</p>
              <h2
                class="font-display text-ink mb-6 leading-[1.05] font-bold tracking-tight"
                style="font-size: clamp(2.5rem, 5vw, 4rem)"
              >
                Engineer by trade.<br />Designer by Obsession.
              </h2>
              <p class="font-body text-body text-ink-muted mb-10 max-w-md leading-relaxed">
                Software engineer based in San Diego. I'm interested in creating products and technology that are rooted
                in human-centered design, supported by thoughtful systems, and presented through seamless, intuitive
                experiences.
              </p>
              <NuxtLink
                to="/about"
                class="font-body text-body-sm text-ink hover:text-accent inline-flex w-fit items-center gap-2 font-semibold transition-colors"
              >
                Full story <Icon name="lucide:arrow-right" size="14" />
              </NuxtLink>
            </div>

            <!-- Right: topographic animation -->
            <div class="relative hidden lg:block">
              <WidgetsHomeAboutAnimation />
            </div>
          </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════════════
             PANEL 02 — PROJECTS
        ═══════════════════════════════════════════════════════════════════ -->
        <section
          class="border-border relative flex h-full w-screen flex-shrink-0 items-center overflow-hidden border-r"
        >
          <span
            class="font-display text-ink pointer-events-none absolute top-1/2 right-0 translate-x-[10%] -translate-y-1/2 leading-none font-bold opacity-[0.04] select-none"
            style="font-size: clamp(12rem, 28vw, 22rem)"
            aria-hidden="true"
            >02</span
          >

          <div class="mx-auto w-full max-w-6xl px-6">
            <!-- Header -->
            <div
              class="mb-10 flex items-end justify-between"
              :style="{
                opacity: activePanel >= 1 ? 1 : 0,
                transform: `translateY(${activePanel >= 1 ? 0 : 20}px)`,
                transition: 'opacity 0.5s ease, transform 0.5s ease',
              }"
            >
              <div>
                <p class="text-caption text-accent mb-2 font-mono tracking-widest uppercase">02 — Projects</p>
                <h2 class="font-display text-ink leading-tight font-bold" style="font-size: clamp(2rem, 4vw, 3rem)">
                  Things I've built.
                </h2>
              </div>
              <NuxtLink
                to="/projects"
                class="font-body text-body-sm text-ink-muted hover:text-ink hidden items-center gap-1.5 font-medium transition-colors sm:flex"
              >
                All projects <Icon name="lucide:arrow-right" size="13" />
              </NuxtLink>
            </div>

            <!-- Coming soon placeholder -->
            <div
              class="flex flex-col items-start gap-4"
              :style="{
                opacity: activePanel >= 1 ? 1 : 0,
                transform: `translateY(${activePanel >= 1 ? 0 : 20}px)`,
                transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
              }"
            >
              <div class="border-border bg-surface flex items-center gap-3 rounded-full border px-4 py-2">
                <span class="bg-accent h-1.5 w-1.5 rounded-full" />
                <span class="text-caption text-ink-subtle font-mono tracking-widest uppercase">Coming soon</span>
              </div>
              <p class="font-body text-body text-ink-muted max-w-sm leading-relaxed">
                Projects are on their way. Check back soon.
              </p>
            </div>
          </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════════════
             PANEL 03 — WRITING
        ═══════════════════════════════════════════════════════════════════ -->
        <section
          class="border-border relative flex h-full w-screen flex-shrink-0 items-center overflow-hidden border-r"
        >
          <span
            class="font-display text-ink pointer-events-none absolute top-1/2 right-0 translate-x-[10%] -translate-y-1/2 leading-none font-bold opacity-[0.04] select-none"
            style="font-size: clamp(12rem, 28vw, 22rem)"
            aria-hidden="true"
            >03</span
          >

          <div class="mx-auto grid w-full max-w-6xl grid-cols-1 gap-16 px-6 lg:grid-cols-[1fr_1.6fr]">
            <!-- Left: heading -->
            <div
              class="flex flex-col justify-center"
              :style="{
                opacity: activePanel >= 2 ? 1 : 0,
                transform: `translateY(${activePanel >= 2 ? 0 : 20}px)`,
                transition: 'opacity 0.5s ease, transform 0.5s ease',
              }"
            >
              <p class="text-caption text-accent mb-4 font-mono tracking-widest uppercase">03 — Writing</p>
              <h2 class="font-display text-ink mb-6 leading-[1.05] font-bold" style="font-size: clamp(2rem, 4vw, 3rem)">
                Notes on craft<br />and code.
              </h2>
              <p class="font-body text-body text-ink-muted mb-8 leading-relaxed">
                I write about building software — the decisions, the tradeoffs, and the occasional rabbit hole.
              </p>
              <NuxtLink
                to="/blog"
                class="font-body text-body-sm text-ink hover:text-accent inline-flex w-fit items-center gap-2 font-semibold transition-colors"
              >
                Browse the archive <Icon name="lucide:arrow-right" size="14" />
              </NuxtLink>
            </div>

            <!-- Right: post bento cards -->
            <div
              class="hidden flex-col justify-center gap-4 lg:flex"
              :style="{ opacity: activePanel >= 2 ? 1 : 0, transition: 'opacity 0.6s ease 0.1s' }"
            >
              <template v-if="posts?.length">
                <ContainmentBentoCard
                  v-for="(post, i) in posts"
                  :key="post.path"
                  :intensity="9"
                  :shine-opacity="0.1"
                  class="group border-border bg-surface hover:border-accent relative block rounded-2xl border p-6 transition-colors"
                  :style="{ transitionDelay: `${i * 60}ms` }"
                >
                  <NuxtLink :to="post.path" class="relative z-20 block">
                    <!-- Top meta row -->
                    <div class="mb-3 flex items-center gap-3">
                      <span class="text-caption text-accent font-mono tracking-widest uppercase">
                        {{
                          post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric',
                              })
                            : ''
                        }}
                      </span>
                      <span v-if="post.series" class="text-caption text-ink-subtle font-mono">
                        · {{ post.series.name }} · Part {{ post.series.part }}
                      </span>
                    </div>

                    <!-- Title -->
                    <h3
                      class="font-display text-h5 text-ink group-hover:text-accent mb-1 leading-tight font-bold transition-colors"
                    >
                      {{ post.title }}
                    </h3>

                    <!-- Subtitle -->
                    <p v-if="post.subtitle" class="font-body text-body-sm text-ink-muted mb-2 leading-snug italic">
                      {{ post.subtitle }}
                    </p>

                    <!-- Description -->
                    <p v-if="post.description" class="font-body text-body-sm text-ink-muted mb-4 leading-relaxed">
                      {{ post.description }}
                    </p>

                    <!-- Bottom row: tags + arrow -->
                    <div class="flex items-end justify-between gap-4">
                      <div class="flex flex-wrap items-center gap-1.5">
                        <span
                          v-for="tag in (post.tags ?? []).slice(0, 3)"
                          :key="tag"
                          class="bg-bg text-caption text-ink-muted rounded-full px-2.5 py-0.5 font-mono"
                        >
                          {{ tag }}
                        </span>
                      </div>
                      <Icon
                        name="lucide:arrow-up-right"
                        size="15"
                        class="text-ink-subtle group-hover:text-accent shrink-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
                  </NuxtLink>
                </ContainmentBentoCard>
              </template>
              <p v-else class="font-body text-body-sm text-ink-subtle py-8">Posts coming soon.</p>
            </div>
          </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════════════
             PANEL 04 — CONNECT
        ═══════════════════════════════════════════════════════════════════ -->
        <section
          class="relative flex h-full w-screen flex-shrink-0 items-center justify-center overflow-hidden text-center"
        >
          <span
            class="font-display text-ink pointer-events-none absolute top-1/2 right-0 translate-x-[10%] -translate-y-1/2 leading-none font-bold opacity-[0.04] select-none"
            style="font-size: clamp(12rem, 28vw, 22rem)"
            aria-hidden="true"
            >04</span
          >

          <div
            class="relative z-10 max-w-2xl px-6"
            :style="{
              opacity: activePanel >= 3 ? 1 : 0,
              transform: `translateY(${activePanel >= 3 ? 0 : 24}px)`,
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }"
          >
            <p class="text-caption text-accent mb-6 font-mono tracking-widest uppercase">04 — Connect</p>
            <h2
              class="font-display text-ink mb-6 leading-[1.05] font-bold tracking-tight"
              style="font-size: clamp(2.5rem, 6vw, 5rem)"
            >
              Let's build<br />something.
            </h2>
            <p class="font-body text-body text-ink-muted mb-10 leading-relaxed">
              Always open to interesting projects, collaborations, or just a good conversation about craft.
            </p>

            <!-- Email -->
            <a
              href="mailto:jens@jens-johnson.com"
              class="font-display text-ink hover:text-accent mb-10 block font-bold tracking-tight transition-colors"
              style="font-size: clamp(1.25rem, 3vw, 2rem)"
            >
              jens@jens-johnson.com
            </a>

            <!-- Social links -->
            <div class="flex items-center justify-center gap-4">
              <a
                href="https://github.com/jensjohnson"
                target="_blank"
                rel="noopener noreferrer"
                class="border-border font-body text-body-sm text-ink-muted hover:border-ink hover:text-ink flex items-center gap-2 rounded-full border px-5 py-2.5 font-medium transition-colors"
              >
                <Icon name="lucide:github" size="15" /> GitHub
              </a>
              <a
                href="https://linkedin.com/in/jensjohnson"
                target="_blank"
                rel="noopener noreferrer"
                class="border-border font-body text-body-sm text-ink-muted hover:border-ink hover:text-ink flex items-center gap-2 rounded-full border px-5 py-2.5 font-medium transition-colors"
              >
                <Icon name="lucide:linkedin" size="15" /> LinkedIn
              </a>
              <NuxtLink
                to="/about"
                class="bg-accent font-body text-body-sm flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold text-stone-50 transition-opacity hover:opacity-90"
              >
                More about me
              </NuxtLink>
            </div>
          </div>
        </section>
      </div>
      <!-- end track -->
    </div>
    <!-- end sticky -->
  </div>
  <!-- end outer -->
</template>
