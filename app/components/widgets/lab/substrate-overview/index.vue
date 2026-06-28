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
 * ██████████████████████████ #components/widgets/lab/substrate-overview/index.vue ██████████████████████████████████████
 *
 * The Overview tab of Substrate; a design brief for the homelab project. A short narrative on what it is and why,
 * a current-focus callout, and a phased roadmap timeline. Static, hand-authored content (no live data yet).
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

interface Phase {
  title: string;
  desc: string;
  status: 'progress' | 'next' | 'planned' | 'future';
}

const phases: Phase[] = [
  {
    title: 'Network & edge',
    desc: 'Fiber handoff, gateway, firewall, switch, and VLAN segmentation.',
    status: 'progress',
  },
  {
    title: 'Compute',
    desc: 'Proxmox VE running headless on the OptiPlex; VMs and containers for everything that follows.',
    status: 'progress',
  },
  {
    title: 'Services',
    desc: 'Minecraft, Portainer, Pi-hole, and the containers that make the lab useful.',
    status: 'progress',
  },
  { title: 'Storage & backup', desc: 'Dedicated storage with ZFS and a 3-2-1 backup routine.', status: 'next' },
  {
    title: 'Failover & redundancy',
    desc: 'Clustering, redundant power and network, and graceful failover as the lab grows.',
    status: 'future',
  },
];

const STATUS: Record<Phase['status'], { label: string; dot: string; text: string; tint: string }> = {
  // In progress reads as the green/success state; Up next keeps the bronze accent so the two stay distinct.
  progress: {
    label: 'In progress',
    dot: 'bg-accent-secondary',
    text: 'text-accent-secondary',
    tint: 'bg-accent-secondary/10',
  },
  next: { label: 'Up next', dot: 'bg-accent', text: 'text-accent', tint: 'bg-accent/10' },
  planned: { label: 'Planned', dot: 'bg-ink-subtle', text: 'text-ink-subtle', tint: 'bg-ink-subtle/10' },
  future: { label: 'Future', dot: 'bg-ink-subtle', text: 'text-ink-subtle', tint: 'bg-ink-subtle/10' },
};
</script>

<template>
  <div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
    <!-- ─── Narrative + current focus ─────────────────────────────────────────── -->
    <div class="lg:col-span-7">
      <p class="text-accent mb-4 font-mono text-[11px] tracking-widest uppercase">The brief</p>

      <div class="font-body text-body-lg text-ink-muted space-y-5 leading-relaxed">
        <p>Welcome to Substrate, my hands-on project and classroom for self-hosting.</p>
        <p>
          After years building software on top of someone else's infrastructure, I wanted to understand the layers
          underneath; the network, the metal, the services, and the glue that ties everything together. This page acts
          as a live status dashboard for the project, tracks some of the services and features I'm working on, and shows
          the process of orchestrating my own little mini "JWS" (Jens Web Services).
        </p>
      </div>

      <!-- Current focus callout -->
      <div class="border-border bg-surface relative mt-8 overflow-hidden rounded-2xl border p-6">
        <div class="substrate-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div class="relative">
          <p class="text-caption text-accent mb-2 inline-flex items-center gap-1.5 font-mono tracking-widest uppercase">
            <span class="bg-accent inline-block size-1.5 animate-pulse rounded-full motion-reduce:animate-none" />
            Current focus
          </p>
          <p class="font-body text-body text-ink leading-relaxed">
            Substrate is running on live, headless
            <a
              href="https://www.proxmox.com/en/proxmox-virtual-environment/overview"
              target="_blank"
              rel="noopener noreferrer"
              class="text-accent underline decoration-dotted underline-offset-2 transition-colors hover:opacity-80"
            >
              Proxmox</a
            >, service layer is being implemented and updated.
          </p>
          <NuxtLink
            :to="{ query: { view: 'topology' } }"
            class="text-body-sm text-ink hover:text-accent mt-4 inline-flex items-center gap-1.5 font-semibold transition-colors"
          >
            See the live topology
            <Icon name="lucide:arrow-right" size="15" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- ─── Roadmap timeline ──────────────────────────────────────────────────── -->
    <div class="lg:col-span-5">
      <p class="text-ink-subtle mb-5 font-mono text-[11px] tracking-widest uppercase">Roadmap</p>

      <ol class="relative" role="list">
        <li v-for="(p, i) in phases" :key="p.title" class="relative flex gap-4 pb-6 last:pb-0">
          <!-- Rail + numbered node -->
          <div class="relative flex flex-col items-center">
            <span
              class="bg-bg z-10 flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-semibold"
              :class="
                p.status === 'progress'
                  ? 'border-accent-secondary text-accent-secondary'
                  : p.status === 'next'
                    ? 'border-accent text-accent'
                    : 'border-border text-ink-subtle'
              "
            >
              {{ i + 1 }}
            </span>
            <span v-if="i < phases.length - 1" class="bg-border absolute top-7 bottom-0 w-px" aria-hidden="true" />
          </div>

          <!-- Body -->
          <div class="flex-1 pt-0.5">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h4 class="font-display text-body text-ink font-bold">{{ p.title }}</h4>
              <span
                class="text-caption inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono font-medium"
                :class="STATUS[p.status].tint"
              >
                <span class="size-1.5 rounded-full" :class="STATUS[p.status].dot" />
                <span :class="STATUS[p.status].text">{{ STATUS[p.status].label }}</span>
              </span>
            </div>
            <p class="font-body text-body-sm text-ink-muted mt-1 leading-relaxed">{{ p.desc }}</p>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.substrate-grid {
  background-image: radial-gradient(circle, var(--color-border) 1px, transparent 1px);
  background-size: 22px 22px;
  opacity: 0.4;
  mask-image: linear-gradient(120deg, #000 0%, transparent 60%);
}
</style>
