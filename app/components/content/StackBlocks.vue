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
 * ███████████████████████████████ #components/content/StackBlocks.vue ██████████████████████████████████████████████
 *
 * MDC component embedded as `::stack-blocks`. Renders the tech stack as five layered blocks; each block is one
 * layer of the platform (Vercel, Nuxt 4, Tailwind, DX tooling, Agentic dev). Clicking a block expands it to reveal
 * the body copy. Default-open is the top layer; only one expanded at a time.
 *
 * The visual metaphor: layers in a stack, with the bottom (infrastructure) up to the top (developer/agent experience).
 * Hovering a layer lifts it slightly out of the stack.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

interface IStackLayer {
  num: string;
  title: string;
  icon: string;
  tagline: string;
  body: string;
  links?: { label: string; href: string }[];
}

const stack: IStackLayer[] = [
  {
    num: '01',
    title: 'DX-Oriented Ecosystem',
    icon: 'lucide:terminal',
    tagline: 'Hooks, lint, scripts, release-please',
    body: 'Git hooks, ESLint and Prettier, Direnv and shell wrappers, release-please, and more. Maintainability and ease-of-use are paramount: DX is the foundation everything else sits on.',
    links: [
      { label: 'Lefthook', href: 'https://lefthook.dev/' },
      { label: 'release-please', href: 'https://github.com/googleapis/release-please' },
    ],
  },
  {
    num: '02',
    title: 'Tailwind-First',
    icon: 'lucide:palette',
    tagline: 'Custom tokens via @theme, no preset chrome',
    body: 'Tailwind v4 CSS-first configuration. Custom design tokens and themes integrate seamlessly with the Tailwind ecosystem and Material Design concepts. Low-dependency styling, high flexibility, fully customized.',
    links: [{ label: 'Tailwind v4', href: 'https://tailwindcss.com/' }],
  },
  {
    num: '03',
    title: 'Nuxt 4',
    icon: 'lucide:box',
    tagline: 'File-routing, SSR/SSG, the right shape of opinionated',
    body: 'My preferred fullstack framework as of late. File-based routing, auto-imports, simple SSR/SSG/hybrid setup, an excellent and growing community: these made the decision easy. No shade to React/Svelte folks; Nuxt has just been a comfortable groove for most of my web app work lately.',
    links: [{ label: 'Nuxt', href: 'https://nuxt.com/' }],
  },
  {
    num: '04',
    title: 'Vercel',
    icon: 'lucide:cloud',
    tagline: 'Hosting, preview deploys, custom domain',
    body: 'Vercel + GitHub Actions for hosting, preview deployments, and custom domain integration. A tangential approach from my historical AWS-oriented setup, but a seamless, first-class fit for a fullstack web app experience.',
    links: [{ label: 'Vercel', href: 'https://vercel.com/' }],
  },
  {
    num: '05',
    title: 'Agentic Integration',
    icon: 'lucide:sparkles',
    tagline: 'Claude + Codex woven into the day-to-day',
    body: "Skills, context, and memory across the development experience: visual design, testing, refactors, content. The goal is to identify which components of this architecture can be automated and improved without sacrificing the personal opinionation and patterns I've laid out for myself. Still evolving across this and other projects.",
  },
];

const expandedIdx = ref(0);
</script>

<template>
  <div class="not-prose my-12">
    <div class="stack-shell relative">
      <div
        v-for="(layer, i) in stack"
        :key="layer.num"
        class="stack-block group bg-surface relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-500"
        :class="[
          i === expandedIdx ? 'border-accent z-10 shadow-lg' : 'border-border hover:border-accent/60',
          i === expandedIdx ? '' : 'hover:-translate-y-1',
        ]"
        :style="{ marginTop: i === 0 ? '0' : '-12px' }"
        @click="expandedIdx = expandedIdx === i ? -1 : i"
      >
        <!-- Collapsed-state header -->
        <div class="flex items-center gap-4 p-5">
          <!-- Layer number -->
          <span
            class="text-caption flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono transition-colors"
            :class="
              i === expandedIdx
                ? 'bg-accent text-stone-50'
                : 'bg-bg text-ink-subtle group-hover:bg-accent/15 group-hover:text-accent'
            "
          >
            {{ layer.num }}
          </span>

          <!-- Icon -->
          <Icon
            :name="layer.icon"
            size="22"
            class="shrink-0 transition-colors"
            :class="i === expandedIdx ? 'text-accent' : 'text-ink-subtle group-hover:text-accent'"
          />

          <!-- Title + tagline -->
          <div class="min-w-0 flex-1">
            <h3 class="font-display text-h5 text-ink leading-tight font-bold">
              {{ layer.title }}
            </h3>
            <p class="font-body text-body-sm text-ink-muted truncate">
              {{ layer.tagline }}
            </p>
          </div>

          <!-- Chevron -->
          <Icon
            name="lucide:chevron-down"
            size="20"
            class="text-ink-subtle shrink-0 transition-transform duration-300"
            :class="i === expandedIdx ? 'text-accent rotate-180' : ''"
          />
        </div>

        <!-- Expanded body -->
        <div
          class="grid transition-[grid-template-rows] duration-500 ease-in-out"
          :style="{ gridTemplateRows: i === expandedIdx ? '1fr' : '0fr' }"
        >
          <div class="overflow-hidden">
            <div class="border-border border-t px-5 py-4">
              <p class="font-body text-body-sm text-ink-muted leading-relaxed">
                {{ layer.body }}
              </p>
              <div v-if="layer.links?.length" class="mt-3 flex flex-wrap gap-2">
                <a
                  v-for="link in layer.links"
                  :key="link.href"
                  :href="link.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-caption text-accent border-accent/30 hover:bg-accent/10 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono transition-colors"
                >
                  {{ link.label }}
                  <Icon name="lucide:arrow-up-right" size="11" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stack-shell {
  perspective: 1200px;
}

.stack-block {
  transform-origin: center top;
  will-change: transform;
}

/* The trick: each block sits slightly behind the next via negative margin + box-shadow, suggesting depth.
   The active block lifts and clears the overlap. */
</style>
