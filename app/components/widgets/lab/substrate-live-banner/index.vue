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
 * █████████████████████ #components/widgets/lab/substrate-live-banner/index.vue ████████████████████████████████████████
 *
 * Slim live-status strip for the Substrate page: status dot + a few headline metrics + "updated Ns ago". Fed by the
 * useSubstrateMetrics composable. Shows a quiet "offline" state without explaining why.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

const { data, state, updatedLabel } = useSubstrateMetrics();
const node = computed(() => data.value?.node ?? null);
const vis = computed(() => METRIC_STATE[state.value]);
</script>

<template>
  <div class="border-border bg-surface flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border px-4 py-2.5">
    <span class="inline-flex items-center gap-2">
      <span class="relative flex size-2">
        <span
          v-if="vis.pulse"
          class="absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden"
          :class="vis.dot"
        />
        <span class="relative inline-flex size-2 rounded-full" :class="vis.dot" />
      </span>
      <span class="text-caption font-mono font-semibold tracking-widest uppercase" :class="vis.text">
        {{ vis.label }}
      </span>
      <span class="text-caption text-ink-subtle font-mono">Proxmox node</span>
    </span>

    <template v-if="node && state !== 'offline'">
      <span class="text-caption text-ink-muted font-mono">
        CPU <span class="text-ink font-semibold">{{ node.cpuPct }}%</span>
      </span>
      <span class="text-caption text-ink-muted font-mono">
        RAM <span class="text-ink font-semibold">{{ node.mem.usedPct }}%</span>
      </span>
      <span class="text-caption text-ink-muted font-mono">
        up <span class="text-ink font-semibold">{{ formatUptime(node.uptimeSec) }}</span>
      </span>
    </template>

    <span v-if="updatedLabel" class="text-caption text-ink-subtle ml-auto font-mono">updated {{ updatedLabel }}</span>
  </div>
</template>
