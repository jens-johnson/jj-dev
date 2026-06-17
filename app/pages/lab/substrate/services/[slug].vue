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
 * █████████████████████████████████████ #pages/lab/substrate/services/[slug].vue ██████████████████████████████████████
 *
 * Per-service detail page for the Substrate homelab. Renders one service's full doc — connect details, live-metrics
 * dashboard, server/client plugins, and the prose body (architecture, decisions). 404s on an unknown slug.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { ServicePlugin } from '~/types/services';

const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ''));

/* ─── Data ────────────────────────────────────────────────────────────────────────────────────────────────────────── */

const { data: services } = await useAsyncData('services-all', () => queryCollection('services').all());

/** Raw queried doc (carries the markdown body) for ContentRenderer. */
const rawDoc = computed(() => (services.value ?? []).find((s) => s.serviceId === slug.value) ?? null);

if (!rawDoc.value) {
  throw createError({ statusCode: 404, statusMessage: `No service “${slug.value}” in Substrate`, fatal: true });
}

const service = computed(() => normalizeServices(services.value ?? []).find((s) => s.serviceId === slug.value) ?? null);

/** Host device title, resolved from the substrate collection, so the host chip reads as a name not an id. */
const { data: devices } = await useAsyncData('services-host-devices', () => queryCollection('substrate').all());
const hostTitle = computed(() => {
  const id = service.value?.host;
  if (!id) return null;
  return (devices.value ?? []).find((d) => d.nodeId === id)?.title ?? id;
});

const isPlanned = computed(() => service.value?.status === 'planned');

/* ─── Links ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

const LINK_META: Record<string, { label: string; icon: string }> = {
  live: { label: 'Website', icon: 'lucide:external-link' },
  map: { label: 'BlueMap', icon: 'lucide:map' },
  github: { label: 'GitHub', icon: 'lucide:github' },
  docs: { label: 'Docs', icon: 'lucide:book-open' },
};

const linkItems = computed(() =>
  Object.entries(service.value?.links ?? {})
    .filter(([, url]) => !!url)
    .map(([key, url]) => ({ key, url: url as string, ...(LINK_META[key] ?? { label: key, icon: 'lucide:link' }) })),
);

/* ─── Plugins (split server / client) ─────────────────────────────────────────────────────────────────────────────── */

const serverPlugins = computed<ServicePlugin[]>(() =>
  (service.value?.plugins ?? []).filter((p) => p.side === 'server'),
);
const clientPlugins = computed<ServicePlugin[]>(() =>
  (service.value?.plugins ?? []).filter((p) => p.side === 'client'),
);

/* ─── Body ────────────────────────────────────────────────────────────────────────────────────────────────────────── */

const hasNotes = computed(() => {
  const value = (rawDoc.value?.body as unknown as { value?: unknown[] } | undefined)?.value;
  return Array.isArray(value) && value.length > 0;
});

useSeoMeta({
  title: () => `${service.value?.title ?? 'Service'} · Substrate`,
  description: () => service.value?.description ?? 'A service running on the Substrate homelab.',
});
</script>

<template>
  <div v-if="service" class="bg-bg min-h-screen">
    <div class="mx-auto max-w-3xl px-6 pt-20 pb-24 md:pt-28">
      <!-- Back -->
      <NuxtLink
        to="/lab/substrate?view=services"
        class="text-caption text-ink-subtle hover:text-accent mb-7 inline-flex items-center gap-1.5 font-mono tracking-widest uppercase transition-colors"
      >
        <Icon name="lucide:arrow-left" size="13" /> Services
      </NuxtLink>

      <!-- Header -->
      <header class="flex items-start gap-4">
        <span
          class="flex size-14 shrink-0 items-center justify-center rounded-2xl"
          :class="isPlanned ? 'border-border text-ink-subtle border border-dashed' : 'bg-accent/10 text-accent'"
        >
          <Icon :name="service.icon ?? serviceKindIcon(service.kind)" size="28" />
        </span>

        <div class="min-w-0 flex-1">
          <p class="text-accent mb-1 font-mono text-[11px] tracking-widest uppercase">
            {{ serviceKindLabel(service.kind) }}
          </p>
          <h1 class="font-display text-ink font-bold tracking-tight" style="font-size: clamp(2rem, 5vw, 3rem)">
            {{ service.title }}
          </h1>
          <p v-if="service.address" class="text-body-sm text-ink-subtle mt-1 font-mono">{{ service.address }}</p>
        </div>

        <span
          class="text-caption inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-mono font-medium"
          :class="serviceStatusOf(service.status).tint"
        >
          <span class="size-2 rounded-full" :class="serviceStatusOf(service.status).dot" />
          <span :class="serviceStatusOf(service.status).text">{{ serviceStatusOf(service.status).label }}</span>
        </span>
      </header>

      <p v-if="service.description" class="font-body text-body-lg text-ink-muted mt-6 leading-relaxed">
        {{ service.description }}
      </p>

      <!-- Links -->
      <div v-if="linkItems.length" class="mt-6 flex flex-wrap gap-2">
        <template v-for="link in linkItems" :key="link.key">
          <!-- Planned: non-clickable pill (the destination isn't live yet). -->
          <span
            v-if="isPlanned"
            class="border-border text-caption text-ink-subtle inline-flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1.5 font-mono"
          >
            <Icon :name="link.icon" size="13" /> {{ link.label }}
            <span class="text-ink-subtle/60">· planned</span>
          </span>
          <!-- Live: real anchor. -->
          <a
            v-else
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="border-border bg-surface text-body-sm text-ink hover:border-accent/60 hover:text-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium transition-colors"
          >
            <Icon :name="link.icon" size="14" /> {{ link.label }}
          </a>
        </template>
      </div>

      <!-- Summary: stack + host -->
      <div class="mt-8 grid gap-4 sm:grid-cols-2">
        <div v-if="service.stack?.length" class="border-border bg-surface rounded-2xl border p-5">
          <p class="text-ink-subtle mb-3 font-mono text-[10px] tracking-widest uppercase">Stack</p>
          <ul class="flex flex-wrap gap-1.5" role="list">
            <li
              v-for="tech in service.stack"
              :key="tech"
              class="border-border bg-bg/40 text-caption text-ink-muted rounded-full border px-2.5 py-1 font-mono"
            >
              {{ tech }}
            </li>
          </ul>
        </div>

        <div v-if="service.host" class="border-border bg-surface rounded-2xl border p-5">
          <p class="text-ink-subtle mb-3 font-mono text-[10px] tracking-widest uppercase">Runs on</p>
          <NuxtLink
            :to="`/lab/substrate/${service.host}`"
            class="group border-border bg-bg/40 hover:border-accent/60 flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors"
          >
            <Icon name="lucide:cpu" size="14" class="text-ink-subtle shrink-0" />
            <span class="text-body-sm text-ink group-hover:text-accent flex-1 truncate font-medium transition-colors">
              {{ hostTitle }}
            </span>
            <Icon name="lucide:arrow-up-right" size="14" class="text-ink-subtle shrink-0" />
          </NuxtLink>
        </div>
      </div>

      <!-- Live metrics dashboard -->
      <WidgetsLabServiceMetrics
        v-if="service.metrics?.length"
        :tiles="service.metrics"
        :label="serviceKindLabel(service.kind).toLowerCase()"
        class="mt-8"
      />

      <!-- Plugins -->
      <section v-if="serverPlugins.length || clientPlugins.length" class="mt-8">
        <h2 class="font-display text-h5 text-ink mb-4 font-bold tracking-tight">Plugins &amp; add-ons</h2>

        <div v-if="serverPlugins.length">
          <p class="text-ink-subtle mb-2 font-mono text-[10px] tracking-widest uppercase">Server-side</p>
          <ul class="grid grid-cols-1 gap-2 sm:grid-cols-2" role="list">
            <li v-for="p in serverPlugins" :key="p.name" class="border-border bg-surface rounded-xl border p-4">
              <div class="flex items-center justify-between gap-2">
                <component
                  :is="p.url ? 'a' : 'span'"
                  v-bind="p.url ? { href: p.url, target: '_blank', rel: 'noopener noreferrer' } : {}"
                  class="text-body-sm text-ink font-semibold"
                  :class="p.url ? 'hover:text-accent transition-colors' : ''"
                >
                  {{ p.name }}
                </component>
                <span class="border-border text-caption text-ink-subtle rounded-full border px-2 py-0.5 font-mono">
                  {{ p.category }}
                </span>
              </div>
              <p class="text-caption text-ink-muted mt-1.5 leading-relaxed">{{ p.purpose }}</p>
            </li>
          </ul>
        </div>

        <div v-if="clientPlugins.length" class="mt-5">
          <p class="text-ink-subtle mb-2 font-mono text-[10px] tracking-widest uppercase">Client-side (recommended)</p>
          <ul class="grid grid-cols-1 gap-2 sm:grid-cols-2" role="list">
            <li v-for="p in clientPlugins" :key="p.name" class="border-border bg-surface rounded-xl border p-4">
              <div class="flex items-center justify-between gap-2">
                <component
                  :is="p.url ? 'a' : 'span'"
                  v-bind="p.url ? { href: p.url, target: '_blank', rel: 'noopener noreferrer' } : {}"
                  class="text-body-sm text-ink font-semibold"
                  :class="p.url ? 'hover:text-accent transition-colors' : ''"
                >
                  {{ p.name }}
                </component>
                <span class="border-border text-caption text-ink-subtle rounded-full border px-2 py-0.5 font-mono">
                  {{ p.category }}
                </span>
              </div>
              <p class="text-caption text-ink-muted mt-1.5 leading-relaxed">{{ p.purpose }}</p>
            </li>
          </ul>
        </div>
      </section>

      <!-- Body / write-up -->
      <article v-if="hasNotes" class="service-doc border-border mt-10 border-t pt-8">
        <ContentRenderer v-if="rawDoc" :value="rawDoc" />
      </article>
    </div>
  </div>
</template>

<style scoped>
/* Prose treatment for the service's rendered markdown body — mirrors the device-doc styling. */
.service-doc :deep(h2) {
  font-family: var(--font-display);
  font-size: var(--text-h5);
  font-weight: 700;
  color: var(--color-ink);
  margin: 1.75rem 0 0.5rem;
}

.service-doc :deep(h3) {
  font-family: var(--font-display);
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--color-ink);
  margin: 1.25rem 0 0.4rem;
}

.service-doc :deep(p) {
  font-size: var(--text-body);
  line-height: 1.7;
  color: var(--color-ink-muted);
  margin: 0.6rem 0;
}

.service-doc :deep(ul),
.service-doc :deep(ol) {
  margin: 0.6rem 0;
  padding-left: 1.25rem;
}

.service-doc :deep(ul) {
  list-style: disc;
}

.service-doc :deep(ol) {
  list-style: decimal;
}

.service-doc :deep(li) {
  font-size: var(--text-body);
  line-height: 1.6;
  color: var(--color-ink-muted);
  margin: 0.3rem 0;
}

.service-doc :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
}

.service-doc :deep(strong) {
  color: var(--color-ink);
  font-weight: 700;
}

.service-doc :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.1rem 0.35rem;
}

.service-doc :deep(pre) {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
  overflow-x: auto;
  margin: 0.9rem 0;
}

.service-doc :deep(pre code) {
  background: transparent;
  border: 0;
  padding: 0;
  font-size: 0.8rem;
}

.service-doc :deep(blockquote) {
  border-left: 3px solid var(--color-border);
  padding-left: 1rem;
  color: var(--color-ink-subtle);
  margin: 0.8rem 0;
}
</style>
