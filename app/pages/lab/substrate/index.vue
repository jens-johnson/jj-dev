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
 * ███████████████████████████████████████████ #pages/lab/substrate/index.vue ███████████████████████████████████████████
 *
 * Substrate; the homelab project. A tabbed view: an Overview design-brief (default), the interactive network
 * topology with an inspector panel, and a Services tab (coming soon). Tabs are query-param driven so they stay
 * linkable without colliding with the /lab/substrate/[slug] device routes.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

useSeoMeta({
  title: 'Substrate · Jens Johnson',
  description: 'The layer everything runs on; a living, documented map of my homelab hardware and how it is wired.',
});

/* ─── DATA ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The raw substrate device docs (drafts excluded) from the content collection
 * @internal
 * @constant
 */
const { data: devices } = await useAsyncData('substrate-devices', () =>
  queryCollection('substrate').where('draft', '=', false).all(),
);

/**
 * Clean, fully-populated devices for the topology + inspector
 * @internal
 * @constant
 */
const list = computed(() => normalizeDevices(devices.value ?? []));

/**
 * The raw service docs (drafts excluded) backing the Services tab
 * @internal
 * @constant
 */
const { data: serviceDocs } = await useAsyncData('substrate-services', () =>
  queryCollection('services').where('draft', '=', false).all(),
);

/**
 * Clean, fully-populated services running on the substrate, for the Services tab
 * @internal
 * @constant
 */
const services = computed(() => normalizeServices(serviceDocs.value ?? []));

/* ─── TABS ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The current route; carries the `?view=` tab query param
 * @internal
 * @constant
 */
const route = useRoute();

/**
 * The router; used to swap the `?view=` param without polluting the history stack
 * @internal
 * @constant
 */
const router = useRouter();

/**
 * The tab definitions for the query-param-driven view switcher
 * @internal
 * @constant
 */
const TABS: ReadonlyArray<{ key: string; label: string; soon?: boolean }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'topology', label: 'Topology' },
  { key: 'services', label: 'Services' },
];

/**
 * The active tab key, driven by the `?view=` query param
 * @internal
 * @constant
 */
const activeView: ComputedRef<string> = computed((): string => {
  // Fall back to the overview tab when the query param is missing or not a known tab key
  const viewQuery: unknown = route.query.view;
  const key: string = typeof viewQuery === 'string' ? viewQuery : 'overview';
  return TABS.some((tab) => tab.key === key) ? key : 'overview';
});

/**
 * Activates a tab by writing the `?view=` query param; drops `view` from the URL for the default tab so the
 * canonical link stays clean
 * @internal
 * @function
 * @param key - The tab key to activate
 */
function setView(key: string): void {
  // Replace (not push) the query param so tab switches do not pollute the history stack
  router.replace({ query: { ...route.query, view: key === 'overview' ? undefined : key } });
}

/* ─── SELECTION ──────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Defaults the topology inspector to the firewall/gateway; the heart of the topology, falling back to the first node
 * @internal
 * @function
 * @returns The initially selected node id, or null when there are no devices
 */
function pickInitial(): string | null {
  const deviceList = list.value;
  const gateway = deviceList.find((device) => device.kind === 'firewall' || device.kind === 'gateway');
  return gateway?.nodeId ?? deviceList[0]?.nodeId ?? null;
}

/**
 * The node id selected in the topology inspector
 * @internal
 * @constant
 */
const selectedId = ref<string | null>(pickInitial());

/**
 * Cleaned device for the inspector's structured fields
 * @internal
 * @constant
 */
const selectedDevice = computed(() => list.value.find((device) => device.nodeId === selectedId.value) ?? null);

/**
 * Original queried doc (carries the markdown body) for ContentRenderer
 * @internal
 * @constant
 */
const selectedRawDoc = computed(
  () => (devices.value ?? []).find((device) => device.nodeId === selectedId.value) ?? null,
);

/**
 * Only surface the Notes section when the selected doc actually has body content (some nodes are frontmatter-only)
 * @internal
 * @constant
 */
const hasNotes = computed(() => {
  const value = (selectedRawDoc.value?.body as unknown as { value?: unknown[] } | undefined)?.value;
  return Array.isArray(value) && value.length > 0;
});

/* ─── LEGENDS ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The device-status legend entries rendered under the topology
 * @internal
 * @constant
 */
const statusLegend = [
  { label: 'Online', dot: 'bg-accent-secondary' },
  { label: 'Maintenance', dot: 'bg-terra-400' },
  { label: 'Planned', dot: 'bg-ink-subtle' },
  { label: 'Offline', dot: 'bg-terra-600' },
];

/**
 * The link-kind legend entries rendered under the topology
 * @internal
 * @constant
 */
const linkLegend = [
  { label: 'Uplink', cls: 'bg-accent' },
  { label: 'Network', cls: 'bg-ink-subtle' },
  { label: 'Data', cls: 'bg-accent-secondary' },
  { label: 'Power', cls: 'bg-ink-subtle/50' },
];

/* ─── ENTRANCE ───────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Whether the entrance animations have been triggered; flips true shortly after mount
 * @internal
 * @constant
 */
const revealed = ref(false);

onMounted(() => {
  setTimeout(() => {
    revealed.value = true;
  }, 80);
});
</script>

<template>
  <div class="bg-bg min-h-screen">
    <div class="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28">
      <!-- ─── Hero ──────────────────────────────────────────────────────────────── -->
      <header class="mb-10">
        <NuxtLink
          to="/lab"
          class="text-caption text-ink-subtle hover:text-accent mb-5 inline-flex items-center gap-1.5 font-mono tracking-widest uppercase transition-colors"
        >
          <Icon
            name="lucide:arrow-left"
            size="13"
          />
          Lab
        </NuxtLink>

        <h1
          class="font-display text-ink font-bold tracking-tight transition-all duration-700"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'"
          style="font-size: clamp(2.75rem, 7vw, 5rem)"
        >
          Substrate
        </h1>

        <p
          class="font-body text-body-lg text-ink-muted mt-5 max-w-2xl leading-relaxed transition-all delay-100 duration-700"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'"
        >
          Welcome to Substrate, an evolving space where I'm dipping my toes into the self-hosted ecosystem, learning
          more about hardware, networking, service provisioning, and more, maybe breaking some CPU pins along the way.
          If you're interested in the home lab space, let's connect! I'd love to learn more about this expensive but
          exciting hobby.
        </p>
      </header>

      <!-- ─── Aggregate live status bar ─────────────────────────────────────────── -->
      <WidgetsLabSubstrateStatusBar
        class="mb-6 transition-all delay-75 duration-700"
        :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'"
      />

      <!-- ─── Fleet (counts + expandable per-device telemetry) ──────────────────── -->
      <WidgetsLabSubstrateFleet
        :devices="list"
        class="transition-all duration-700"
        :class="revealed ? 'opacity-100' : 'opacity-0'"
      />

      <!-- ─── Tabs + panels ─────────────────────────────────────────────────────── -->
      <div
        class="mt-8 transition-all delay-150 duration-700"
        :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'"
      >
        <!-- Tab bar -->
        <div
          class="border-border mb-8 flex gap-1 overflow-x-auto border-b"
          role="tablist"
          aria-label="Substrate views"
        >
          <button
            v-for="t in TABS"
            :key="t.key"
            type="button"
            role="tab"
            :aria-selected="activeView === t.key"
            class="text-body-sm relative -mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 font-semibold transition-colors"
            :class="
              activeView === t.key ? 'border-accent text-ink' : 'text-ink-subtle hover:text-ink border-transparent'
            "
            @click="setView(t.key)"
          >
            {{ t.label }}
            <span
              v-if="t.soon"
              class="text-ink-subtle font-mono text-[9px] tracking-wider uppercase"
              >soon</span
            >
          </button>
        </div>

        <!-- Overview panel -->
        <section
          v-show="activeView === 'overview'"
          role="tabpanel"
          aria-label="Overview"
        >
          <WidgetsLabSubstrateOverview />
        </section>

        <!-- Topology panel -->
        <section
          v-show="activeView === 'topology'"
          role="tabpanel"
          aria-label="Topology"
        >
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <!-- Topology canvas -->
            <div
              class="border-border bg-surface/50 relative overflow-hidden rounded-2xl border p-4 sm:p-6 lg:col-span-8"
            >
              <WidgetsLabSubstrateTopology
                v-model:selected-id="selectedId"
                :devices="list"
              />

              <!-- Legend -->
              <div class="border-border mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-4">
                <div class="flex flex-wrap items-center gap-3">
                  <span class="text-caption text-ink-subtle font-mono tracking-widest uppercase">Status</span>

                  <span
                    v-for="s in statusLegend"
                    :key="s.label"
                    class="text-caption text-ink-muted flex items-center gap-1.5"
                  >
                    <span
                      class="size-2 rounded-full"
                      :class="s.dot"
                    />
                    {{ s.label }}
                  </span>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  <span class="text-caption text-ink-subtle font-mono tracking-widest uppercase">Link</span>

                  <span
                    v-for="l in linkLegend"
                    :key="l.label"
                    class="text-caption text-ink-muted flex items-center gap-1.5"
                  >
                    <span
                      class="h-0.5 w-4 rounded-full"
                      :class="l.cls"
                    />
                    {{ l.label }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Inspector -->
            <div class="lg:col-span-4">
              <div class="lg:sticky lg:top-24">
                <WidgetsLabSubstrateDetail
                  :device="selectedDevice"
                  :devices="list"
                  :has-notes="hasNotes"
                >
                  <template #notes>
                    <ContentRenderer
                      v-if="selectedRawDoc"
                      :key="selectedRawDoc.nodeId"
                      :value="selectedRawDoc"
                    />
                  </template>
                </WidgetsLabSubstrateDetail>
              </div>
            </div>
          </div>
        </section>

        <!-- Services panel -->
        <section
          v-show="activeView === 'services'"
          role="tabpanel"
          aria-label="Services"
        >
          <WidgetsLabServicesOverview :services="services" />
        </section>
      </div>
    </div>
  </div>
</template>
