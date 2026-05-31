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
 * █████████████████████████████████ #components/widgets/home/hero-parallax/index.vue ██████████████████████████████████
 *
 * Home hero widget. Composes PrimitivesBaseHero and PrimitivesBaseParallax to produce the full scroll-reveal parallax hero.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

const revealed = ref(false);

onMounted(() => {
  setTimeout(() => {
    revealed.value = true;
  }, 80);
});
</script>

<template>
  <PrimitivesBaseParallax v-slot="{ layerStyle, markStyle, scrollY }" :lerp="0.055">
    <PrimitivesBaseHero>
      <template #backdrop>
        <!-- ── Grain overlay ──────────────────────────────────────────────── -->
        <div class="pointer-events-none fixed inset-0 z-[5] opacity-[0.06]" aria-hidden="true">
          <svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <filter id="grain-filter">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain-filter)" />
          </svg>
        </div>

        <!-- ── Orb A — top right ──────────────────────────────────────────── -->
        <div
          class="pointer-events-none absolute -top-24 -right-24 z-[10] h-[640px] w-[640px] rounded-full will-change-transform"
          :style="{
            background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 65%)',
            opacity: 0.18,
            ...layerStyle(-35, -25, -0.22),
          }"
          aria-hidden="true"
        />

        <!-- ── Orb B — bottom left ────────────────────────────────────────── -->
        <div
          class="pointer-events-none absolute -bottom-16 -left-24 z-[10] h-[520px] w-[520px] rounded-full will-change-transform"
          :style="{
            background: 'radial-gradient(circle, var(--color-accent-secondary) 0%, transparent 65%)',
            opacity: 0.14,
            ...layerStyle(28, 22, -0.14),
          }"
          aria-hidden="true"
        />

        <!-- ── Orb C — mid drift ──────────────────────────────────────────── -->
        <div
          class="pointer-events-none absolute top-[30%] left-[40%] z-[10] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform"
          :style="{
            background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 65%)',
            opacity: 0.1,
            ...layerStyle(55, 42, -0.3),
          }"
          aria-hidden="true"
        />

        <!-- ── Logo mark — scroll-reveal backdrop ────────────────────────── -->
        <div
          class="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center will-change-transform select-none"
          :style="markStyle()"
          aria-hidden="true"
        >
          <BrandLogoMark class="text-ink w-[min(115vw,105vh)]" />
        </div>
      </template>

      <!-- ── Content ──────────────────────────────────────────────────────── -->
      <div
        class="relative z-[30] mx-auto w-full max-w-6xl px-6 pt-8 pb-24 will-change-transform"
        :style="layerStyle(8, 6, 0)"
      >
        <!-- Eyebrow -->
        <p
          class="text-caption text-accent mb-6 font-mono tracking-widest uppercase"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'"
          style="
            transition:
              opacity 0.6s ease,
              transform 0.6s ease;
            transition-delay: 0ms;
          "
        >
          Software engineer · San Diego, CA
        </p>

        <!-- Headline — clip-based line reveal -->
        <h1 class="font-display text-ink leading-[1.02] font-bold tracking-tight">
          <span class="block overflow-hidden">
            <span
              class="block"
              style="
                font-size: clamp(4rem, 12vw, 9rem);
                transition:
                  transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                  opacity 0.8s ease;
                transition-delay: 100ms;
              "
              :style="{ transform: revealed ? 'translateY(0)' : 'translateY(110%)', opacity: revealed ? '1' : '0' }"
            >
              Jens
            </span>
          </span>
          <span class="block overflow-hidden">
            <span
              class="block"
              style="
                font-size: clamp(4rem, 12vw, 9rem);
                transition:
                  transform 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                  opacity 0.8s ease;
                transition-delay: 190ms;
              "
              :style="{ transform: revealed ? 'translateY(0)' : 'translateY(110%)', opacity: revealed ? '1' : '0' }"
            >
              Johnson
            </span>
          </span>
        </h1>

        <!-- Sub-headline -->
        <p
          class="font-body text-body-lg text-ink-muted mt-6 max-w-lg leading-relaxed md:mt-8"
          style="
            transition:
              opacity 0.7s ease,
              transform 0.7s ease;
            transition-delay: 340ms;
          "
          :style="{ opacity: revealed ? '1' : '0', transform: revealed ? 'translateY(0)' : 'translateY(12px)' }"
        >
          Building thoughtful and impactful software at the intersection of engineering, design, and human experience.
        </p>

        <!-- CTAs -->
        <div
          class="mt-10 flex flex-wrap items-center gap-4"
          style="
            transition:
              opacity 0.7s ease,
              transform 0.7s ease;
            transition-delay: 460ms;
          "
          :style="{ opacity: revealed ? '1' : '0', transform: revealed ? 'translateY(0)' : 'translateY(12px)' }"
        >
          <NuxtLink
            to="/work"
            class="bg-accent font-body text-body-sm inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-stone-50 transition-opacity hover:opacity-90"
          >
            View my work
            <Icon name="lucide:arrow-right" size="14" />
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="border-border font-body text-body-sm text-ink-muted hover:border-ink hover:text-ink inline-flex items-center gap-2 rounded-full border px-6 py-3 font-semibold transition-colors"
          >
            About me
          </NuxtLink>
        </div>
      </div>

      <template #hint>
        <!-- ── Scroll hint ──────────────────────────────────────────────────── -->
        <div
          class="absolute bottom-8 left-1/2 z-[30] flex -translate-x-1/2 flex-col items-center gap-2"
          :style="{ opacity: scrollY > 60 ? '0' : '1', transition: 'opacity 0.4s ease' }"
          aria-hidden="true"
        >
          <span class="text-caption text-ink-subtle font-mono tracking-widest uppercase">Scroll</span>
          <div
            class="from-ink-subtle h-10 w-[1px] origin-top bg-gradient-to-b to-transparent"
            style="animation: scroll-pulse 1.8s ease-in-out infinite"
          />
        </div>
      </template>
    </PrimitivesBaseHero>
  </PrimitivesBaseParallax>
</template>
