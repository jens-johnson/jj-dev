<script setup lang="ts">
// ─── WidgetsHomeHorizontalJourney ─────────────────────────────────────────────
// Vertical scroll → horizontal panel sweep.
// The outer wrapper is PANELS × 100vh tall; a sticky inner container translates
// the panel track left as you scroll, so every scroll pixel = horizontal travel.
//
// Panels:  01 About · 02 Projects · 03 Writing · 04 Connect

const PANELS      = 4;
const PANEL_NAMES = ['About', 'Projects', 'Writing', 'Connect'];

// ── Data ──────────────────────────────────────────────────────────────────────
const { data: projects } = await useAsyncData('journey-projects', () =>
  queryCollection('projects')
    .where('featured', '=', true)
    .where('draft', '=', false)
    .order('order', 'ASC')
    .limit(3)
    .all(),
);

const { data: posts } = await useAsyncData('journey-posts', () =>
  queryCollection('blog')
    .where('draft', '=', false)
    .order('publishedAt', 'DESC')
    .limit(4)
    .all(),
);

// ── Scroll tracking ───────────────────────────────────────────────────────────
const outerRef    = ref<HTMLElement | null>(null);
const rawProgress = ref(0);
const lerpProgress = ref(0);
let raf: number;

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function onScroll() {
  if (!outerRef.value || !import.meta.client) return;
  const rect       = outerRef.value.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  rawProgress.value = scrollable > 0
    ? Math.max(0, Math.min(1, -rect.top / scrollable))
    : 0;
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
const activePanel = computed(() =>
  Math.min(PANELS - 1, Math.round(rawProgress.value * (PANELS - 1))),
);

/** How far (0–1) into a given panel's reveal slot. Used for content entrance. */
function panelProgress(i: number) {
  const per   = 1 / (PANELS - 1);
  const start = i * per;
  return Math.max(0, Math.min(1, (rawProgress.value - start) / per));
}

// ── 3D tilt (Projects panel) ──────────────────────────────────────────────────
const MAX_TILT = 7;

interface TiltState { rx: number;
  ry: number;
  gx: number;
  gy: number;
  on: boolean }

const tilts = ref<TiltState[]>(Array.from({
  length: 3,
}, () =>
  ({
    rx: 0,
    ry: 0,
    gx: 50,
    gy: 50,
    on: false,
  }),
));

function onTiltMove(e: MouseEvent, i: number) {
  const el = e.currentTarget as HTMLElement;
  const {
    left, top, width, height,
  } = el.getBoundingClientRect();
  const x = (e.clientX - left) / width;
  const y = (e.clientY - top)  / height;
  tilts.value[i] = {
    rx: (0.5 - y) * MAX_TILT,
    ry: (x - 0.5) * MAX_TILT,
    gx: x * 100,
    gy: y * 100,
    on: true,
  };
}
function onTiltLeave(i: number) {
  tilts.value[i] = {
    rx: 0,
    ry: 0,
    gx: 50,
    gy: 50,
    on: false,
  };
}
function tiltStyle(i: number) {
  const t = tilts.value[i];
  if (!t) return {
  };
  return {
    transform: `perspective(900px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.on ? 1.02 : 1})`,
    transition: t.on ? 'transform 0.08s ease-out' : 'transform 0.55s ease-out',
  };
}
function glareStyle(i: number) {
  const t = tilts.value[i];
  if (!t) return {
    opacity: '0',
  };
  return {
    background: `radial-gradient(circle at ${t.gx}% ${t.gy}%, rgba(255,255,255,0.10), transparent 60%)`,
    opacity: t.on ? '1' : '0',
    transition: 'opacity 0.3s ease',
  };
}

// ── Navigation click (indicator dots) ────────────────────────────────────────
function scrollToPanel(i: number) {
  if (!import.meta.client || !outerRef.value) return;
  const rect       = outerRef.value.getBoundingClientRect();
  const scrollable = outerRef.value.offsetHeight - window.innerHeight;
  const target     = window.scrollY + rect.top + (i / (PANELS - 1)) * scrollable;
  window.scrollTo({
    top: target,
    behavior: 'smooth',
  });
}

// ── Stack tags (About panel) ──────────────────────────────────────────────────
const stack = ['Vue / Nuxt', 'TypeScript', 'Node.js', 'PostgreSQL', 'Python', 'Tailwind'];

// ── Craft tiles (About panel right column) ────────────────────────────────────
const crafts = [
  {
    label: 'Systems thinking',
    icon: 'lucide:layers',
  },
  {
    label: 'Product design',
    icon: 'lucide:pen-tool',
  },
  {
    label: 'Frontend craft',
    icon: 'lucide:code-2',
  },
  {
    label: 'API architecture',
    icon: 'lucide:network',
  },
  {
    label: 'Dev tooling',
    icon: 'lucide:wrench',
  },
  {
    label: 'Open source',
    icon: 'lucide:github',
  },
];
</script>

<template>
  <!-- Outer: tall enough for PANELS scroll lengths -->
  <div
    ref="outerRef"
    class="relative"
    :style="{ height: `${PANELS * 100}vh` }"
  >
    <!-- Sticky viewport-height container -->
    <div class="sticky top-0 h-screen overflow-hidden">

      <!-- ── Panel indicator ──────────────────────────────────────────────── -->
      <div
        class="pointer-events-none absolute right-8 top-1/2 z-20 -translate-y-1/2 flex flex-col items-center gap-3"
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
            class="font-mono text-[10px] uppercase tracking-widest transition-colors duration-300"
            :class="i === activePanel ? 'text-accent' : 'text-ink-subtle opacity-0 group-hover:opacity-100'"
          >{{ name }}</span>
          <span
            class="block rounded-full transition-all duration-300"
            :class="i === activePanel
              ? 'h-5 w-1.5 bg-accent'
              : 'h-1.5 w-1.5 bg-border hover:bg-ink-subtle'"
          />
        </button>
      </div>

      <!-- ── Bottom progress bar ──────────────────────────────────────────── -->
      <div
        class="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-px bg-border"
        aria-hidden="true"
      >
        <div
          class="h-full bg-accent origin-left"
          :style="{ transform: `scaleX(${rawProgress})` }"
        />
      </div>

      <!-- ── Horizontal track ─────────────────────────────────────────────── -->
      <div
        class="flex h-full will-change-transform"
        :style="trackStyle"
      >

        <!-- ══════════════════════════════════════════════════════════════════
             PANEL 01 — ABOUT
        ═══════════════════════════════════════════════════════════════════ -->
        <section class="relative flex h-full w-screen flex-shrink-0 items-center overflow-hidden border-r border-border">

          <!-- Decorative number -->
          <span
            class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 translate-x-[10%] select-none font-display font-bold leading-none text-ink opacity-[0.04]"
            style="font-size: clamp(12rem, 28vw, 22rem)"
            aria-hidden="true"
          >01</span>

          <div class="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-20">

            <!-- Left: bio — always visible (first panel) -->
            <div class="flex flex-col justify-center">
              <p class="mb-4 font-mono text-caption uppercase tracking-widest text-accent">
                01 — About
              </p>
              <h2
class="mb-6 font-display font-bold leading-[1.05] tracking-tight text-ink"
                  style="font-size: clamp(2.5rem, 5vw, 4rem)">
                Engineer by trade,<br>designer at heart.
              </h2>
              <p class="mb-8 max-w-md font-body text-body leading-relaxed text-ink-muted">
                Software engineer based in San Diego. I build thoughtful products
                at the intersection of engineering and design — from zero-to-one
                apps to design systems and everything between.
              </p>

              <!-- Stack pills -->
              <ul class="mb-8 flex flex-wrap gap-2" role="list">
                <li
                  v-for="tag in stack"
                  :key="tag"
                  class="rounded-full border border-border px-3 py-1 font-mono text-caption text-ink-subtle"
                >
                  {{ tag }}
                </li>
              </ul>

              <NuxtLink
                to="/about"
                class="inline-flex w-fit items-center gap-2 font-body text-body-sm font-semibold text-ink transition-colors hover:text-accent"
              >
                Full story <Icon name="lucide:arrow-right" size="14" />
              </NuxtLink>
            </div>

            <!-- Right: craft tiles -->
            <div
              class="hidden lg:grid grid-cols-2 gap-3 content-center"
              style="opacity: 1;"
            >
              <div
                v-for="(craft, i) in crafts"
                :key="craft.label"
                class="flex items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent/30 hover:bg-surface"
                :style="{ transitionDelay: `${i * 40}ms` }"
              >
                <Icon :name="craft.icon" size="16" class="flex-shrink-0 text-accent" />
                <span class="font-body text-body-sm font-medium text-ink">{{ craft.label }}</span>
              </div>
            </div>

          </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════════════
             PANEL 02 — PROJECTS
        ═══════════════════════════════════════════════════════════════════ -->
        <section class="relative flex h-full w-screen flex-shrink-0 items-center overflow-hidden border-r border-border">

          <span
            class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 translate-x-[10%] select-none font-display font-bold leading-none text-ink opacity-[0.04]"
            style="font-size: clamp(12rem, 28vw, 22rem)"
            aria-hidden="true"
          >02</span>

          <div class="mx-auto w-full max-w-6xl px-6">

            <!-- Header -->
            <div
              class="mb-10 flex items-end justify-between"
              :style="{ opacity: panelProgress(1) > 0.3 ? 1 : 0, transform: `translateY(${panelProgress(1) > 0.3 ? 0 : 20}px)`, transition: 'opacity 0.5s ease, transform 0.5s ease' }"
            >
              <div>
                <p class="mb-2 font-mono text-caption uppercase tracking-widest text-accent">
                  02 — Projects
                </p>
                <h2
class="font-display font-bold leading-tight text-ink"
                    style="font-size: clamp(2rem, 4vw, 3rem)">
                  Things I've built.
                </h2>
              </div>
              <NuxtLink
                to="/projects"
                class="hidden items-center gap-1.5 font-body text-body-sm font-medium text-ink-muted transition-colors hover:text-ink sm:flex"
              >
                All projects <Icon name="lucide:arrow-right" size="13" />
              </NuxtLink>
            </div>

            <!-- Project cards -->
            <ul
              v-if="projects?.length"
              class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              role="list"
            >
              <li
                v-for="(project, i) in projects"
                :key="project.path"
                style="transform-style: preserve-3d;"
                :style="{ opacity: panelProgress(1) > 0.3 ? 1 : 0, transform: `translateY(${panelProgress(1) > 0.3 ? 0 : 28}px)`, transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms` }"
              >
                <NuxtLink
                  :to="project.path"
                  class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6"
                  :style="tiltStyle(i)"
                  @mousemove="(e) => onTiltMove(e, i)"
                  @mouseleave="() => onTiltLeave(i)"
                >
                  <div
                    class="pointer-events-none absolute inset-0 rounded-2xl"
                    :style="glareStyle(i)"
                    aria-hidden="true"
                  />
                  <DataStatusBadge :status="project.status" class="mb-4" />
                  <h3 class="mb-2 font-display text-h5 font-bold text-ink transition-colors group-hover:text-accent">
                    {{ project.shortTitle ?? project.title }}
                  </h3>
                  <p class="flex-1 font-body text-body-sm leading-relaxed text-ink-muted">
                    {{ project.description }}
                  </p>
                  <ul v-if="project.stack?.length" class="mt-5 flex flex-wrap gap-1.5" role="list">
                    <li
                      v-for="tech in project.stack.slice(0, 4)"
                      :key="tech"
                      class="rounded-full border border-border px-2.5 py-0.5 font-mono text-caption text-ink-subtle"
                    >{{ tech }}</li>
                  </ul>
                </NuxtLink>
              </li>
            </ul>

            <p v-else class="font-body text-body-sm text-ink-subtle">
              Projects coming soon.
            </p>

          </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════════════
             PANEL 03 — WRITING
        ═══════════════════════════════════════════════════════════════════ -->
        <section class="relative flex h-full w-screen flex-shrink-0 items-center overflow-hidden border-r border-border">

          <span
            class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 translate-x-[10%] select-none font-display font-bold leading-none text-ink opacity-[0.04]"
            style="font-size: clamp(12rem, 28vw, 22rem)"
            aria-hidden="true"
          >03</span>

          <div class="mx-auto grid w-full max-w-6xl grid-cols-1 gap-16 px-6 lg:grid-cols-[1fr_1.6fr]">

            <!-- Left: heading -->
            <div
              class="flex flex-col justify-center"
              :style="{ opacity: panelProgress(2) > 0.3 ? 1 : 0, transform: `translateY(${panelProgress(2) > 0.3 ? 0 : 20}px)`, transition: 'opacity 0.5s ease, transform 0.5s ease' }"
            >
              <p class="mb-4 font-mono text-caption uppercase tracking-widest text-accent">
                03 — Writing
              </p>
              <h2
class="mb-6 font-display font-bold leading-[1.05] text-ink"
                  style="font-size: clamp(2rem, 4vw, 3rem)">
                Notes on craft<br>and code.
              </h2>
              <p class="mb-8 font-body text-body leading-relaxed text-ink-muted">
                I write about building software — the decisions, the tradeoffs,
                and the occasional rabbit hole.
              </p>
              <NuxtLink
                to="/blog"
                class="inline-flex w-fit items-center gap-2 font-body text-body-sm font-semibold text-ink transition-colors hover:text-accent"
              >
                Browse the archive <Icon name="lucide:arrow-right" size="14" />
              </NuxtLink>
            </div>

            <!-- Right: post list -->
            <div
              class="hidden lg:flex flex-col justify-center divide-y divide-border"
              :style="{ opacity: panelProgress(2) > 0.3 ? 1 : 0, transition: 'opacity 0.6s ease 0.1s' }"
            >
              <template v-if="posts?.length">
                <NuxtLink
                  v-for="(post, i) in posts"
                  :key="post.path"
                  :to="post.path"
                  class="group flex items-center justify-between gap-8 py-5 transition-colors hover:text-ink"
                  :style="{ transitionDelay: `${i * 50}ms` }"
                >
                  <div class="flex-1 min-w-0">
                    <h3 class="truncate font-body text-body font-medium text-ink transition-colors group-hover:text-accent">
                      {{ post.title }}
                    </h3>
                    <p v-if="post.description" class="mt-0.5 truncate font-body text-body-sm text-ink-muted">
                      {{ post.description }}
                    </p>
                  </div>
                  <div class="flex flex-shrink-0 items-center gap-4 text-right">
                    <span class="font-mono text-caption text-ink-subtle">
                      {{ post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '' }}
                    </span>
                    <Icon name="lucide:arrow-up-right" size="14" class="text-ink-subtle transition-colors group-hover:text-accent" />
                  </div>
                </NuxtLink>
              </template>
              <p v-else class="py-8 font-body text-body-sm text-ink-subtle">
                Posts coming soon.
              </p>
            </div>

          </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════════════
             PANEL 04 — CONNECT
        ═══════════════════════════════════════════════════════════════════ -->
        <section class="relative flex h-full w-screen flex-shrink-0 items-center justify-center overflow-hidden text-center">

          <span
            class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 translate-x-[10%] select-none font-display font-bold leading-none text-ink opacity-[0.04]"
            style="font-size: clamp(12rem, 28vw, 22rem)"
            aria-hidden="true"
          >04</span>

          <div
            class="relative z-10 max-w-2xl px-6"
            :style="{ opacity: panelProgress(3) > 0.3 ? 1 : 0, transform: `translateY(${panelProgress(3) > 0.3 ? 0 : 24}px)`, transition: 'opacity 0.6s ease, transform 0.6s ease' }"
          >
            <p class="mb-6 font-mono text-caption uppercase tracking-widest text-accent">
              04 — Connect
            </p>
            <h2
class="mb-6 font-display font-bold leading-[1.05] tracking-tight text-ink"
                style="font-size: clamp(2.5rem, 6vw, 5rem)">
              Let's build<br>something.
            </h2>
            <p class="mb-10 font-body text-body leading-relaxed text-ink-muted">
              Always open to interesting projects, collaborations,
              or just a good conversation about craft.
            </p>

            <!-- Email -->
            <a
              href="mailto:hello@jens-johnson.com"
              class="mb-10 block font-display font-bold tracking-tight text-ink transition-colors hover:text-accent"
              style="font-size: clamp(1.25rem, 3vw, 2rem)"
            >
              hello@jens-johnson.com
            </a>

            <!-- Social links -->
            <div class="flex items-center justify-center gap-4">
              <a
                href="https://github.com/jensjohnson"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 font-body text-body-sm font-medium text-ink-muted transition-colors hover:border-ink hover:text-ink"
              >
                <Icon name="lucide:github" size="15" /> GitHub
              </a>
              <a
                href="https://linkedin.com/in/jensjohnson"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 font-body text-body-sm font-medium text-ink-muted transition-colors hover:border-ink hover:text-ink"
              >
                <Icon name="lucide:linkedin" size="15" /> LinkedIn
              </a>
              <NuxtLink
                to="/about"
                class="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-body text-body-sm font-semibold text-stone-50 transition-opacity hover:opacity-90"
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
