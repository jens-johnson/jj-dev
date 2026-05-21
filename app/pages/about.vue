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
 * █████████████████████████████████████████████████ #pages/about.vue ██████████████████████████████████████████████████
 *
 * About page — background, philosophy, stack, and experience timeline.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

useSeoMeta({
  title: 'About — Jens Johnson',
  description: 'Full-stack software engineer based in San Diego, CA. I build data-rich applications, design systems, and tools that make a real difference.',
  ogTitle: 'About Jens Johnson',
  ogDescription: 'Full-stack software engineer based in San Diego, CA.',
});

/* ─── Stack ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

const stack = [
  {
    category: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Python', 'Swift'],
  },
  {
    category: 'Frontend',
    items: ['Vue / Nuxt', 'React', 'Tailwind CSS', 'Vitest / Nightwatch'],
  },
  {
    category: 'Backend',
    items: ['Node.js', 'Express', 'GraphQL', 'REST'],
  },
  {
    category: 'Cloud & Infra',
    items: ['AWS Lambda', 'EC2 / ECS', 'API Gateway', 'EventBridge', 'CloudWatch', 'Cognito'],
  },
  {
    category: 'Data',
    items: ['MongoDB', 'DynamoDB', 'S3', 'Snowflake', 'Elasticsearch'],
  },
  {
    category: 'DevOps',
    items: ['Docker', 'Kubernetes / EKS', 'Terraform', 'CloudFormation', 'GitHub Actions'],
  },
];

/* ─── Experience ──────────────────────────────────────────────────────────────────────────────────────────────────── */

const experience = [
  {
    title: 'Senior Software Engineer',
    org: 'Gemological Institute of America',
    orgShort: 'GIA',
    location: 'Carlsbad, CA',
    dates: 'Sep 2023 — Present',
    current: true,
    highlights: [
      'Lead engineer on the Product Engineering team, owning architecture to delivery for multiple simultaneous initiatives across GIA\'s external-facing services.',
      'Designed and shipped shared internal packages powering GIA\'s product suite — including the LatticeCraft component library and shared TypeScript type system.',
      'Currently building a first-of-kind near real-time diamond grading estimate platform for manufacturers, spanning a REST API, full-stack Nuxt application, and live eventing — poised to reduce manufacturer costs and cycle times industry-wide.',
    ],
  },
  {
    title: 'Software Engineer',
    org: 'Amazon Web Services',
    orgShort: 'AWS',
    location: 'Denver, CO',
    dates: 'Jul 2022 — Sep 2023',
    current: false,
    highlights: [
      'Worked within Amazon\'s Data Center Engineering Organization (DCEO) on the InfraMap team, building tools that give a consolidated, real-time view of global data center health.',
      'Led design and implementation of an on-premise alarm visualization tool that drastically reduced the impact and response time of high-severity data center events.',
      'Built data pipelines aggregating signals across AWS infrastructure to surface actionable insights and reduce operational overhead.',
    ],
  },
  {
    title: 'Software Engineer',
    org: 'Nike',
    orgShort: 'Nike',
    location: 'Beaverton, OR',
    dates: 'Aug 2019 — Jul 2022',
    current: false,
    highlights: [
      'Spent three years across Nike\'s Sport Science Platform (SSP) and Enterprise Data teams, building the data pipelines and research tooling behind Nike Innovation\'s sport science work.',
      'Led creation of a remote study management platform that enabled global participant recruitment and contactless research — critical during COVID and still used to match athletes with specialized studies.',
      'Also served briefly as Product Owner for Nike Music under Nike Store Technology, managing A/V strategy across Nike\'s global retail footprint.',
    ],
  },
];

/* ─── Entrance animation ──────────────────────────────────────────────────────────────────────────────────────────── */

const revealed = ref(false);
onMounted(() => { setTimeout(() => { revealed.value = true; }, 80); });
</script>

<template>
  <div class="min-h-screen bg-bg">

    <!-- ─── Hero ──────────────────────────────────────────────────────────────── -->
    <section class="mx-auto max-w-6xl px-6 pb-16 pt-20 md:pt-28">
      <div class="grid gap-12 md:grid-cols-[1fr_auto] md:items-start md:gap-20">

        <!-- Left: intro copy -->
        <div>
          <p
            class="mb-4 font-mono text-caption uppercase tracking-widest text-accent"
            :class="revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
            style="transition: opacity 0.5s ease, transform 0.5s ease; transition-delay: 0ms"
          >
            About me
          </p>
          <h1
            class="font-display text-h1 font-bold leading-tight tracking-tight text-ink"
            :class="revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
            style="transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1); transition-delay: 80ms"
          >
            Engineer.<br>
            <span class="text-accent">Builder.</span><br>
            Tinkerer.
          </h1>
          <p
            class="mt-6 max-w-xl font-body text-body-lg leading-relaxed text-ink-muted"
            :class="revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
            style="transition: opacity 0.7s ease, transform 0.7s ease; transition-delay: 200ms"
          >
            I'm a full-stack software engineer based in San Diego, CA —
            currently Senior SE at the Gemological Institute of America.
            I've spent my career building data-rich applications and microservice systems
            at companies like Nike and AWS, with a focus on products that actually matter.
          </p>
        </div>

        <!-- Right: photo -->
        <div
          class="relative shrink-0"
          :class="revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
          style="transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1); transition-delay: 120ms"
        >
          <!-- Photo placeholder — replace src with real image -->
          <div class="relative h-72 w-56 overflow-hidden rounded-2xl bg-surface md:h-80 md:w-64">
            <!-- TODO: replace with <NuxtImg> once photo is added to public/images/about/ -->
            <div class="flex h-full w-full items-center justify-center">
              <BrandLogoMark class="w-20 text-border" />
            </div>
            <!-- Accent border overlay -->
            <div class="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-border" />
          </div>
          <!-- Decorative offset block -->
          <div class="absolute -bottom-3 -right-3 -z-10 h-full w-full rounded-2xl bg-surface" />
        </div>

      </div>
    </section>

    <!-- ─── Bio ───────────────────────────────────────────────────────────────── -->
    <section class="border-t border-border">
      <div class="mx-auto max-w-6xl px-6 py-20">
        <div class="grid gap-12 md:grid-cols-[200px_1fr]">

          <p class="font-mono text-caption uppercase tracking-widest text-ink-subtle">Background</p>

          <div class="space-y-5 font-body text-body leading-relaxed text-ink-muted">
            <p>
              I'm an engineer in the classical sense — I love understanding how things work and
              building systems that hold up under real load. But I care just as much about the product
              experience: the interface, the feedback loop, the moment a user gets exactly what they needed.
              That intersection of engineering rigor and design thinking is where I do my best work.
            </p>
            <p>
              Most of what I build lives at the intersection of data and experience: pipelines that ingest
              and transform complex signals, APIs that make that data usable, and front-ends that present it
              clearly. TypeScript runs through all of it — from Lambda functions and Express services to
              Nuxt applications and shared component libraries.
            </p>
            <p>
              Outside of work I'm drawn to nature and sport in all forms — trail running, paragliding,
              anything that requires reading terrain and making decisions in real time. I think the same
              instincts apply to engineering. I believe technology works best when it's in service of
              people, and I try to build accordingly.
            </p>
          </div>

        </div>
      </div>
    </section>

    <!-- ─── Stack ─────────────────────────────────────────────────────────────── -->
    <section class="border-t border-border bg-surface">
      <div class="mx-auto max-w-6xl px-6 py-20">
        <div class="mb-12 grid gap-4 md:grid-cols-[200px_1fr]">
          <p class="font-mono text-caption uppercase tracking-widest text-ink-subtle">Stack</p>
          <p class="font-body text-body text-ink-muted">
            Primarily a full-stack TypeScript engineer. Fluent in the AWS ecosystem from my time there.
          </p>
        </div>

        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="group in stack"
            :key="group.category"
            class="rounded-xl border border-border bg-bg p-5"
          >
            <p class="mb-3 font-mono text-caption uppercase tracking-widest text-accent">
              {{ group.category }}
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="item in group.items"
                :key="item"
                class="rounded-full bg-surface px-3 py-1 font-body text-body-sm text-ink-muted"
              >
                {{ item }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Experience ────────────────────────────────────────────────────────── -->
    <section class="border-t border-border">
      <div class="mx-auto max-w-6xl px-6 py-20">
        <div class="mb-12 grid gap-4 md:grid-cols-[200px_1fr]">
          <p class="font-mono text-caption uppercase tracking-widest text-ink-subtle">Experience</p>
          <p class="font-body text-body text-ink-muted">
            Five years across sport tech, cloud infrastructure, and gemological science.
          </p>
        </div>

        <div class="space-y-0">
          <div
            v-for="(role, i) in experience"
            :key="role.org + role.dates"
            class="grid gap-6 border-t border-border py-10 md:grid-cols-[200px_1fr]"
            :class="i === experience.length - 1 ? 'border-b' : ''"
          >

            <!-- Left: meta -->
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-mono text-caption font-medium uppercase tracking-widest text-accent">
                  {{ role.orgShort }}
                </span>
                <span
                  v-if="role.current"
                  class="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-caption text-accent"
                >
                  Now
                </span>
              </div>
              <p class="font-body text-body-sm text-ink-subtle">{{ role.dates }}</p>
              <p class="font-body text-body-sm text-ink-subtle">{{ role.location }}</p>
            </div>

            <!-- Right: content -->
            <div>
              <h3 class="mb-1 font-display text-h5 font-bold text-ink">{{ role.title }}</h3>
              <p class="mb-4 font-body text-body-sm text-ink-muted">{{ role.org }}</p>
              <ul class="space-y-2.5">
                <li
                  v-for="highlight in role.highlights"
                  :key="highlight"
                  class="flex gap-3 font-body text-body text-ink-muted"
                >
                  <span class="mt-2 size-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {{ highlight }}
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </section>

    <!-- ─── Connect ───────────────────────────────────────────────────────────── -->
    <section class="border-t border-border bg-surface">
      <div class="mx-auto max-w-6xl px-6 py-20">
        <div class="grid gap-8 md:grid-cols-[200px_1fr] md:items-center">

          <p class="font-mono text-caption uppercase tracking-widest text-ink-subtle">Connect</p>

          <div class="flex flex-wrap items-center gap-4">
            <a
              href="https://github.com/jens-johnson"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 font-body text-body-sm font-medium text-ink-muted transition-colors hover:border-ink hover:text-ink"
            >
              <Icon name="lucide:github" size="15" />
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/jens-johnson"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 font-body text-body-sm font-medium text-ink-muted transition-colors hover:border-ink hover:text-ink"
            >
              <Icon name="lucide:linkedin" size="15" />
              LinkedIn
            </a>
            <a
              href="mailto:hello@jens-johnson.com"
              class="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-body text-body-sm font-semibold text-stone-50 transition-opacity hover:opacity-90"
            >
              <Icon name="lucide:mail" size="15" />
              Say hello
            </a>
          </div>

        </div>
      </div>
    </section>

  </div>
</template>
