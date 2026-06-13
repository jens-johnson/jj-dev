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
 * ███████████████████████████████████████████ #pages/lab/substrate/[slug].vue ██████████████████████████████████████████
 *
 * Per-device detail page for the Substrate homelab. Renders one device's full markdown doc as a documented runbook —
 * specs, wiring (linked to neighbours), and the prose body (config, decisions, learnings). 404s on an unknown slug.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ''));

/* ─── Data ────────────────────────────────────────────────────────────────────────────────────────────────────────── */

const { data: devices } = await useAsyncData('substrate-devices-all', () => queryCollection('substrate').all());

/** Raw queried doc (carries the markdown body) for ContentRenderer. */
const rawDoc = computed(() => (devices.value ?? []).find((d) => d.nodeId === slug.value) ?? null);

if (!rawDoc.value) {
  throw createError({ statusCode: 404, statusMessage: `No device “${slug.value}” in Substrate`, fatal: true });
}

const list = computed(() => normalizeDevices(devices.value ?? []));
const device = computed(() => list.value.find((d) => d.nodeId === slug.value) ?? null);

const vendorModel = computed(() =>
  device.value ? [device.value.vendor, device.value.model].filter(Boolean).join(' · ') : '',
);
const titleOf = (id: string) => list.value.find((d) => d.nodeId === id)?.title ?? id;

const hasNotes = computed(() => {
  const value = (rawDoc.value?.body as unknown as { value?: unknown[] } | undefined)?.value;
  return Array.isArray(value) && value.length > 0;
});

const CONN_LABEL: Record<string, string> = { uplink: 'Uplink', network: 'Network', data: 'Data', power: 'Power' };
const connLabel = (kind?: string) => CONN_LABEL[kind ?? 'network'] ?? 'Link';

/* ─── Live internet (WAN node only) ───────────────────────────────────────────────────────────────────────────────── */

const { data: liveData, state: liveState, updatedLabel: liveUpdated } = useSubstrateMetrics();
const liveInternet = computed(() =>
  device.value?.kind === 'internet' && liveState.value !== 'offline' ? (liveData.value?.internet ?? null) : null,
);

useSeoMeta({
  title: () => `${device.value?.title ?? 'Device'} · Substrate`,
  description: () => device.value?.description ?? 'A device in the Substrate homelab.',
  // Work-in-progress section — flip to index once it has settled.
  robots: 'noindex',
});
</script>

<template>
  <div v-if="device" class="bg-bg min-h-screen">
    <div class="mx-auto max-w-3xl px-6 pt-20 pb-24 md:pt-28">
      <!-- Back -->
      <NuxtLink
        to="/lab/substrate"
        class="text-caption text-ink-subtle hover:text-accent mb-7 inline-flex items-center gap-1.5 font-mono tracking-widest uppercase transition-colors"
      >
        <Icon name="lucide:arrow-left" size="13" /> Substrate
      </NuxtLink>

      <!-- Header -->
      <header class="flex items-start gap-4">
        <span
          class="flex size-14 shrink-0 items-center justify-center rounded-2xl"
          :class="
            device.status === 'planned'
              ? 'border-border text-ink-subtle border border-dashed'
              : 'bg-accent/10 text-accent'
          "
        >
          <Icon :name="kindIcon(device.kind)" size="28" />
        </span>

        <div class="min-w-0 flex-1">
          <p class="text-accent mb-1 font-mono text-[11px] tracking-widest uppercase">{{ kindLabel(device.kind) }}</p>
          <h1 class="font-display text-ink font-bold tracking-tight" style="font-size: clamp(2rem, 5vw, 3rem)">
            {{ device.title }}
          </h1>
          <p v-if="vendorModel" class="text-body-sm text-ink-subtle mt-1 font-mono">{{ vendorModel }}</p>
        </div>

        <span
          class="text-caption inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-mono font-medium"
          :class="statusOf(device.status).tint"
        >
          <span class="size-2 rounded-full" :class="statusOf(device.status).dot" />
          <span :class="statusOf(device.status).text">{{ statusOf(device.status).label }}</span>
        </span>
      </header>

      <p v-if="device.description" class="font-body text-body-lg text-ink-muted mt-6 leading-relaxed">
        {{ device.description }}
      </p>

      <!-- Summary: specs + connections -->
      <div class="mt-8 grid gap-4 sm:grid-cols-2">
        <div v-if="device.specs?.length" class="border-border bg-surface rounded-2xl border p-5">
          <p class="text-ink-subtle mb-3 font-mono text-[10px] tracking-widest uppercase">Specs</p>
          <dl class="flex flex-col gap-2">
            <div v-for="s in device.specs" :key="s.label" class="flex items-baseline justify-between gap-4">
              <dt class="text-caption text-ink-subtle shrink-0 font-mono uppercase">{{ s.label }}</dt>
              <dd class="text-body-sm text-ink text-right font-medium">{{ s.value }}</dd>
            </div>
          </dl>
        </div>

        <div v-if="device.connections?.length" class="border-border bg-surface rounded-2xl border p-5">
          <p class="text-ink-subtle mb-3 font-mono text-[10px] tracking-widest uppercase">Connections</p>
          <ul class="flex flex-col gap-1.5" role="list">
            <li v-for="c in device.connections" :key="`${c.to}-${c.kind}`">
              <NuxtLink
                :to="`/lab/substrate/${c.to}`"
                class="group border-border bg-bg/40 hover:border-accent/60 flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors"
              >
                <Icon name="lucide:arrow-up-right" size="14" class="text-ink-subtle shrink-0" />
                <span
                  class="text-body-sm text-ink group-hover:text-accent flex-1 truncate font-medium transition-colors"
                >
                  {{ titleOf(c.to) }}
                </span>
                <span class="text-caption text-ink-subtle bg-surface rounded-full px-2 py-0.5 font-mono">
                  {{ c.label ?? connLabel(c.kind) }}
                </span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Live metrics (host only) -->
      <WidgetsLabSubstrateLiveCard v-if="device.kind === 'hypervisor'" class="mt-8" />

      <!-- Live internet (WAN only) -->
      <div v-if="liveInternet" class="border-border bg-surface mt-8 rounded-2xl border p-5">
        <div class="mb-3 flex items-center justify-between gap-3">
          <span class="inline-flex items-center gap-2">
            <span class="relative flex size-2">
              <span
                class="bg-accent-secondary absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden"
              />
              <span class="bg-accent-secondary relative inline-flex size-2 rounded-full" />
            </span>
            <span class="text-caption text-accent-secondary font-mono tracking-widest uppercase">Live</span>
            <span class="text-caption text-ink-subtle font-mono">internet edge</span>
          </span>
          <span v-if="liveUpdated" class="text-caption text-ink-subtle shrink-0 font-mono">
            updated {{ liveUpdated }}
          </span>
        </div>
        <dl class="grid grid-cols-2 gap-3">
          <div class="border-border bg-bg/40 rounded-xl border px-3 py-2.5">
            <dt class="text-caption text-ink-subtle font-mono tracking-widest uppercase">Reachable</dt>
            <dd
              class="font-display text-h5 mt-0.5 leading-none font-bold"
              :class="liveInternet.reachable ? 'text-accent-secondary' : 'text-terra-600'"
            >
              {{ liveInternet.reachable ? 'Yes' : 'No' }}
            </dd>
          </div>
          <div v-if="liveInternet.latencyMs !== undefined" class="border-border bg-bg/40 rounded-xl border px-3 py-2.5">
            <dt class="text-caption text-ink-subtle font-mono tracking-widest uppercase">Ping</dt>
            <dd class="font-display text-h5 text-ink mt-0.5 leading-none font-bold">{{ liveInternet.latencyMs }} ms</dd>
          </div>
        </dl>
      </div>

      <!-- Body / runbook -->
      <article v-if="hasNotes" class="substrate-doc border-border mt-10 border-t pt-8">
        <ContentRenderer v-if="rawDoc" :value="rawDoc" />
      </article>
      <p v-else class="text-body-sm text-ink-subtle mt-10 font-mono italic">No notes documented yet.</p>
    </div>
  </div>
</template>

<style scoped>
/* Prose treatment for the device's rendered markdown body. */
.substrate-doc :deep(h2) {
  font-family: var(--font-display);
  font-size: var(--text-h5);
  font-weight: 700;
  color: var(--color-ink);
  margin: 1.75rem 0 0.5rem;
}

.substrate-doc :deep(h3) {
  font-family: var(--font-display);
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--color-ink);
  margin: 1.25rem 0 0.4rem;
}

.substrate-doc :deep(p) {
  font-size: var(--text-body);
  line-height: 1.7;
  color: var(--color-ink-muted);
  margin: 0.6rem 0;
}

.substrate-doc :deep(ul),
.substrate-doc :deep(ol) {
  margin: 0.6rem 0;
  padding-left: 1.25rem;
}

.substrate-doc :deep(ul) {
  list-style: disc;
}

.substrate-doc :deep(ol) {
  list-style: decimal;
}

.substrate-doc :deep(li) {
  font-size: var(--text-body);
  line-height: 1.6;
  color: var(--color-ink-muted);
  margin: 0.3rem 0;
}

.substrate-doc :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
}

.substrate-doc :deep(strong) {
  color: var(--color-ink);
  font-weight: 700;
}

.substrate-doc :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.1rem 0.35rem;
}

.substrate-doc :deep(pre) {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
  overflow-x: auto;
  margin: 0.9rem 0;
}

.substrate-doc :deep(pre code) {
  background: transparent;
  border: 0;
  padding: 0;
  font-size: 0.8rem;
}

.substrate-doc :deep(blockquote) {
  border-left: 3px solid var(--color-border);
  padding-left: 1rem;
  color: var(--color-ink-subtle);
  margin: 0.8rem 0;
}
</style>
