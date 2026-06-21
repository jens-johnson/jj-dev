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
 * ████████████████████████████████ #components/widgets/lab/services-overview/index.vue ████████████████████████████████
 *
 * The Services tab on the Substrate page: a responsive grid of service cards (icon, status, stack), each linking to
 * its detail page. Renders an empty-state when no services are documented yet.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { HomelabService } from '~/types/services';

const { services } = defineProps<{ services: HomelabService[] }>();
</script>

<template>
  <div>
    <!-- Empty state -->
    <div
      v-if="!services.length"
      class="border-border bg-surface/40 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center"
    >
      <span
        class="bg-bg text-ink-subtle border-border mb-5 flex size-12 items-center justify-center rounded-full border"
      >
        <Icon name="lucide:server-cog" size="22" />
      </span>
      <h3 class="font-display text-h5 text-ink font-bold">No services yet</h3>
      <p class="font-body text-body-sm text-ink-muted mt-2 max-w-md leading-relaxed">
        The first containers are going up now; this tab will map them with live status shortly.
      </p>
    </div>

    <!-- Service grid -->
    <ul v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2" role="list">
      <li v-for="svc in services" :key="svc.serviceId">
        <NuxtLink
          :to="`/lab/substrate/services/${svc.serviceId}`"
          class="group border-border bg-surface hover:border-accent/60 flex h-full flex-col rounded-2xl border p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <!-- Header: icon + status -->
          <div class="mb-4 flex items-start justify-between gap-3">
            <span
              class="flex size-11 shrink-0 items-center justify-center rounded-xl"
              :class="
                svc.status === 'planned'
                  ? 'border-border text-ink-subtle border border-dashed'
                  : 'bg-accent/10 text-accent'
              "
            >
              <Icon :name="svc.icon ?? serviceKindIcon(svc.kind)" size="22" />
            </span>

            <span
              class="text-caption inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-mono font-medium"
              :class="serviceStatusOf(svc.status).tint"
            >
              <span class="size-1.5 rounded-full" :class="serviceStatusOf(svc.status).dot" />
              <span :class="serviceStatusOf(svc.status).text">{{ serviceStatusOf(svc.status).label }}</span>
            </span>
          </div>

          <!-- Title + kind -->
          <p class="text-accent mb-1 font-mono text-[10px] tracking-widest uppercase">
            {{ serviceKindLabel(svc.kind) }}
          </p>
          <h3 class="font-display text-h5 text-ink font-bold tracking-tight">{{ svc.title }}</h3>
          <p class="font-body text-body-sm text-ink-muted mt-2 leading-relaxed">
            {{ svc.summary ?? svc.description }}
          </p>

          <!-- Stack chips -->
          <ul v-if="svc.stack?.length" class="mt-4 flex flex-wrap gap-1.5" role="list">
            <li
              v-for="tech in svc.stack.slice(0, 4)"
              :key="tech"
              class="border-border text-caption text-ink-subtle rounded-full border px-2 py-0.5 font-mono"
            >
              {{ tech }}
            </li>
            <li v-if="svc.stack.length > 4" class="text-caption text-ink-subtle px-1 py-0.5 font-mono">
              +{{ svc.stack.length - 4 }}
            </li>
          </ul>

          <!-- Footer -->
          <div class="mt-auto flex items-center justify-between pt-5">
            <span v-if="svc.host" class="text-caption text-ink-subtle inline-flex items-center gap-1.5 font-mono">
              <Icon name="lucide:cpu" size="12" /> {{ svc.host }}
            </span>
            <span v-else />
            <span
              class="text-body-sm text-ink group-hover:text-accent inline-flex items-center gap-1.5 font-semibold transition-colors"
            >
              View service
              <Icon name="lucide:arrow-right" size="14" class="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
