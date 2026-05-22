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

import { useWindowScroll } from '@vueuse/core';

useSeoMeta({
  title: 'About — Jens Johnson',
  description: 'Full-stack software engineer based in San Diego, CA. I build data-rich applications, design systems, and tools that make a real difference.',
  ogTitle: 'About Jens Johnson',
  ogDescription: 'Full-stack software engineer based in San Diego, CA.',
});

/* ─── Typewriter ──────────────────────────────────────────────────────────────────────────────────────────────────── */

const TYPEWRITER_WORDS = [
  'Engineer',
  'Builder',
  'Tinkerer',
  'Innovationist',
  'Technologist',
  'Designer',
  'Runner',
  'Skier',
  'Sushi Enthusiast',
];

const typeText = ref('');
const typeWordIdx = ref(0);
const typeIsDeleting = ref(false);
const typeTimer = ref<ReturnType<typeof setTimeout> | null>(null);

function typeStep() {
  const word = TYPEWRITER_WORDS[typeWordIdx.value];
  if (typeIsDeleting.value) {
    typeText.value = word.slice(0, typeText.value.length - 1);
    if (typeText.value.length === 0) {
      typeIsDeleting.value = false;
      typeWordIdx.value = (typeWordIdx.value + 1) % TYPEWRITER_WORDS.length;
      typeTimer.value = setTimeout(typeStep, 350);
      return;
    }
    typeTimer.value = setTimeout(typeStep, 45);
  } else {
    typeText.value = word.slice(0, typeText.value.length + 1);
    if (typeText.value === word) {
      typeIsDeleting.value = true;
      typeTimer.value = setTimeout(typeStep, 2200);
      return;
    }
    typeTimer.value = setTimeout(typeStep, 95);
  }
}

/* ─── Parallax ────────────────────────────────────────────────────────────────────────────────────────────────────── */

const { y } = useWindowScroll();

const imageTransform = computed(() => {
  const clamped = Math.min(y.value, 600);
  return `translateY(${clamped * 0.07}px) rotate(${clamped * 0.007}deg)`;
});

/* ─── Stack ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

const stack = [
  {
    category: 'Languages',
    items: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'Java', 'Swift'],
  },
  {
    category: 'Frontend',
    items: [
      'Vue.js', 'Nuxt', 'Next.js', 'React', 'Tailwind CSS',
      'Pinia / Redux', 'SSR / SSG / ISR / Hybrid Rendering',
      'TanStack', 'Vite / Webpack', 'Vitest / Jest / Cypress / Nightwatch',
    ],
  },
  {
    category: 'Backend',
    items: ['Node.js', 'Serverless / Cloud-Native', 'REST APIs', 'GraphQL', 'Authentication / OIDC', 'Express', 'H3'],
  },
  {
    category: 'AWS',
    items: [
      'Lambda', 'API Gateway', 'IAM', 'EC2', 'Cognito',
      'VPC / PrivateLink / Transit Gateway', 'EventBridge', 'Secrets Manager', 'Systems Manager',
    ],
  },
  {
    category: 'Data & Search',
    items: ['MongoDB', 'Snowflake', 'Elasticsearch', 'DynamoDB', 'RDS', 'S3'],
  },
  {
    category: 'DevOps',
    items: ['Docker', 'CloudFormation / CDK', 'Terraform', 'GitHub Actions', 'Jenkins'],
  },
  {
    category: 'Tooling',
    items: ['Git', 'Nx', 'Postman', 'ESLint', 'Prettier', 'Linear', 'Jira'],
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
      'Currently a lead engineer on the Product Engineering team, responsible for the design and implementation of software and technology products for both GIA\'s external-facing services and internal teams.',
      'Led the design and creation of, and currently maintain, several shared internal packages which power GIA\'s product suite and technology ecosystem, including a custom UI component library, a TypeScript library for the extensive domain of diamond industry-specific typings and enumerations, and other utility packages that help our teams build faster and more accurately.',
      'Currently leading a project which will provide a first-of-kind platform that allows diamond manufacturers to obtain real-time cut estimates and feedback, powered by an internal large language model (LLM) with diamond cut proportion and industry insights that are unattainable for regular consumers in the current landscape.',
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
      'Software engineer with Amazon\'s Data Center Engineering Organization (DCEO) on the InfraMap team, creating platform services that provide a consolidated, real-time view of the health and activities across AWS\' 900+ data centers in 123 global availability zones.',
      'Led the design and implementation of a global alarming and visualization tool for AWS data centers that allows data center engineers to rapidly respond to real-time aggregated and transformed data from an expansive source of input signals and pipelines, from electrical metering to network throughput, allowing our data center teams to rapidly mitigate high-impact events and reduce costs for downstream consumers.',
    ],
  },
  {
    title: 'Software Engineer — Sport Science Platform',
    org: 'Nike',
    orgShort: 'Nike',
    location: 'Beaverton, OR',
    dates: 'Jun 2021 — Jul 2022',
    current: false,
    highlights: [
      'Software engineer with Nike\'s Sport Science Platform (SSP), the technology organization powering the Nike Sport Research Lab (NSRL), responsible for innovations like Nike FlyKnit fabric, Vaporfly carbon-plated running technology, Nike Adapt self-lacing shoes, and more.',
      'Developed and created data pipelines, research platforms, and user experiences to enable world-class sport research through the Nike NSRL.',
      'Led the design and creation of a platform for remote study management, providing Nike researchers with the capability to create and conduct studies with external participants across the world, rapidly expanding the pace and reach of Nike\'s research capabilities, expanding the opportunity for Nike research participation for athletes across the world, and overcoming physical barriers imposed by the ongoing COVID-19 pandemic.',
    ],
  },
  {
    title: 'Product Owner — Nike Music',
    org: 'Nike',
    orgShort: 'Nike',
    location: 'Beaverton, OR',
    dates: 'Aug 2020 — Jun 2021',
    current: false,
    highlights: [
      'Product owner for Nike Music under the Nike Store Technology (NST) team, responsible for product management, evaluation, and growth strategies to support music and audiovisual (A/V) activations throughout the entire Nike brand experience, including promotions and marketing, corporate events, and Nike retail stores and infrastructure across the globe.',
      'Facilitated vendor relationships to develop and design integrations in the store technology landscape and A/V strategies for Nike retail footprints at scale.',
      'Helped implement an omni-channel marketing campaign which used targeted music strategies and A/V designs for local markets in Nike retail footprints, helping the company scale its specialty store expansions to experiences like Nike House of Innovation and Nike By You.',
    ],
  },
  {
    title: 'Software Engineer — Product Data Hub',
    org: 'Nike',
    orgShort: 'Nike',
    location: 'Beaverton, OR',
    dates: 'Aug 2019 — Aug 2020',
    current: false,
    highlights: [
      'Software engineer on the Product Data Hub (PDH)/API 360 team within Nike\'s Enterprise Data and Analytics (EDA) organization, responsible for the development and maintenance of applications in the Nike Data Foundation (NDF) platform to deliver dimensional and transactional data products to Nike consumers, supporting functions across the company including e-commerce, marketing, and product design and development.',
      'Designed a data provenance solution to automatically validate SQL scripts and transactions as part of our pipelines\' CI/CD, allowing developers and researchers to safely deploy updates to tools like Snowflake and RDS at scale.',
    ],
  },
];

/* ─── Hero background carousel ───────────────────────────────────────────────────────────────────────────────────── */

const heroBgImages = [
  { src: '/images/jens-images/paragliding.jpg', alt: 'Paragliding in the Swiss Alps' },
  { src: '/images/jens-images/maroon-bells.jpg', alt: 'Hiking at Maroon Bells, Colorado' },
  { src: '/images/jens-images/skiing.jpg', alt: 'Skiing with friends' },
  { src: '/images/jens-images/festival.jpg', alt: 'Catching a set at Outside Lands' },
];

const heroBgIdx = ref(0);
const heroBgFading = ref(false);
let heroBgTimer: ReturnType<typeof setInterval> | null = null;

function advanceHeroBg() {
  heroBgFading.value = true;
  setTimeout(() => {
    heroBgIdx.value = (heroBgIdx.value + 1) % heroBgImages.length;
    heroBgFading.value = false;
  }, 1000);
}

/* ─── Entrance animation ──────────────────────────────────────────────────────────────────────────────────────────── */

const revealed = ref(false);
onMounted(() => {
  setTimeout(() => { revealed.value = true; }, 80);
  typeTimer.value = setTimeout(typeStep, 900);
  heroBgTimer = setInterval(advanceHeroBg, 5500);
});

onUnmounted(() => {
  if (typeTimer.value) clearTimeout(typeTimer.value);
  if (heroBgTimer) clearInterval(heroBgTimer);
});
</script>

<template>
  <div class="min-h-screen bg-bg">

    <!-- ─── Hero ──────────────────────────────────────────────────────────────── -->
    <section class="relative overflow-hidden pb-24 pt-20 md:pt-32">

      <!-- Blended background carousel -->
      <div class="absolute inset-0">
        <NuxtImg
          :src="heroBgImages[heroBgIdx].src"
          :alt="heroBgImages[heroBgIdx].alt"
          class="h-full w-full object-cover transition-opacity duration-[1200ms] ease-in-out"
          :class="heroBgFading ? 'opacity-0' : 'opacity-[0.18]'"
          loading="eager"
        />
        <!-- Fade edges into bg so it blends seamlessly -->
        <div class="absolute inset-0 bg-gradient-to-r from-bg via-transparent to-bg" />
        <div class="absolute inset-0 bg-gradient-to-b from-bg/60 via-transparent to-bg" />
      </div>

      <!-- Content -->
      <div class="relative mx-auto max-w-6xl px-6">
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
          <span class="text-accent">{{ typeText }}</span><span
            class="text-accent"
            style="animation: blink 1s step-end infinite"
          >|</span>
        </h1>
        <p
          class="mt-6 max-w-2xl font-body text-body-lg leading-relaxed text-ink-muted"
          :class="revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
          style="transition: opacity 0.7s ease, transform 0.7s ease; transition-delay: 200ms"
        >
          Hello! My name is Jens Johnson. I am a full-stack software engineer based in San Diego, California,
          currently working with the Product Management team at the Gemological Institute of America, where I help
          build tools and software solutions to empower and serve consumers and manufacturers across the global
          gemological and diamond industries. I am deeply passionate about the intersection of technology and
          human-driven design, and I believe that the most impactful products are created when technical excellence
          meets empathy, creativity, and a genuine understanding of the people they serve.
        </p>
      </div>
    </section>

    <!-- ─── Background ───────────────────────────────────────────────────────── -->
    <section class="border-t border-border">
      <div class="mx-auto max-w-6xl px-6 py-20">

        <!-- Section label -->
        <p class="mb-10 font-mono text-caption uppercase tracking-widest text-ink-subtle">Background</p>

        <!-- Bento grid — 12 col, 4 row -->
        <div class="grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">

          <!-- A: Location — cols 1–2 -->
          <ContainmentBentoCard class="relative flex flex-col items-start justify-between rounded-2xl border border-border bg-surface p-6 lg:col-span-2">
            <Icon name="lucide:map-pin" size="20" class="text-accent" />
            <div>
              <p class="font-display text-h5 font-bold text-ink">San Diego</p>
              <p class="font-mono text-caption text-ink-subtle">California</p>
            </div>
          </ContainmentBentoCard>

          <!-- B: The Engineer — cols 3–10 -->
          <ContainmentBentoCard class="relative flex flex-col justify-start rounded-2xl border border-border bg-surface p-8 lg:col-span-8">
            <p class="mb-4 font-mono text-caption uppercase tracking-widest text-accent">The Engineer</p>
            <p class="font-body text-body leading-relaxed text-ink-muted">
              I'm an engineer in the classical sense. I love understanding how things work, and designing, building,
              and (sometimes) breaking systems to solve problems creatively. But I also consider myself a
              product-focused, design-oriented solutionist: I love understanding how I can employ technological
              solutions to address users' needs — from interface design to feedback integration. My passion in
              technology lies at the intersection of engineering rigor and design focus, and I believe this is where
              the best products and solutions are created.
            </p>
          </ContainmentBentoCard>

          <!-- C: Years — cols 11–12 -->
          <ContainmentBentoCard class="relative flex flex-col items-start justify-between rounded-2xl border border-border bg-bg p-6 lg:col-span-2">
            <Icon name="lucide:briefcase" size="20" class="text-accent" />
            <div>
              <p class="font-display text-h5 font-bold text-ink">5+ Years</p>
              <p class="font-mono text-caption text-ink-subtle">Industry experience</p>
            </div>
          </ContainmentBentoCard>

          <!-- D: Quote — cols 1–4 -->
          <ContainmentBentoCard
            :intensity="8"
            :shine-opacity="0.08"
            class="relative flex flex-col justify-center rounded-2xl bg-accent/10 p-8 lg:col-span-4"
          >
            <span class="mb-3 block font-display text-4xl leading-none text-accent opacity-50">"</span>
            <p class="font-body text-body-lg font-medium leading-relaxed text-ink">
              Technology is best when grounded in natural principles and designed in service of the people that use it.
            </p>
          </ContainmentBentoCard>

          <!-- E: The Builder — cols 5–12 -->
          <ContainmentBentoCard class="relative rounded-2xl border border-border bg-surface p-8 lg:col-span-8">
            <p class="mb-4 font-mono text-caption uppercase tracking-widest text-accent">The Builder</p>
            <p class="font-body text-body leading-relaxed text-ink-muted">
              My professional career has provided me with the ability to develop and create solutions for a variety of
              organizations and end-users — from designing sport research platforms at Nike to developing data center
              observability, reliability, and sustainability tools for Amazon Web Services. I enjoy the entropy and
              complexity of full-stack development: orchestrating microservices, building omni-source data pipelines,
              and working closely with end-users to define seamless, accessible, and elegant interfaces.
            </p>
          </ContainmentBentoCard>

          <!-- F: The Human — cols 1–8 -->
          <ContainmentBentoCard class="relative rounded-2xl border border-border bg-surface p-8 lg:col-span-8">
            <p class="mb-4 font-mono text-caption uppercase tracking-widest text-accent">The Human</p>
            <p class="font-body text-body leading-relaxed text-ink-muted">
              When I'm not behind a keyboard, my passions lie outdoors — hiking, trail running, going to the beach to
              catch a sunset on the southern California coast. You'll inevitably see some "non-tech" subject matter on
              this site, and I hope it gives you a chance to see all sides of me. Whether navigating terrain on a trail
              run or designing a new product, I believe nature and technology have a surprising amount of crossover.
            </p>
          </ContainmentBentoCard>

          <!-- G: GitHub + Strava metrics card (cols 9–12) -->
          <ContainmentBentoCard class="relative rounded-2xl border border-border bg-surface p-6 lg:col-span-4">
            <WidgetsMetricsCard />
          </ContainmentBentoCard>

        </div>
      </div>
    </section>

    <!-- ─── Experience ────────────────────────────────────────────────────────── -->
    <section class="border-t border-border bg-surface">
      <div class="mx-auto max-w-6xl px-6 py-20">
        <div class="mb-12 grid gap-4 md:grid-cols-[200px_1fr]">
          <p class="font-mono text-caption uppercase tracking-widest text-ink-subtle">Experience</p>
          <p class="font-body text-body text-ink-muted">
            5+ years across sports technology, cloud infrastructure, and gemological science.
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

    <!-- ─── Stack ─────────────────────────────────────────────────────────────── -->
    <section class="border-t border-border">
      <div class="mx-auto max-w-6xl px-6 py-20">
        <div class="mb-12 grid gap-4 md:grid-cols-[200px_1fr]">
          <p class="font-mono text-caption uppercase tracking-widest text-ink-subtle">Stack</p>
        </div>

        <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="group in stack"
            :key="group.category"
            class="rounded-xl border border-border bg-surface p-5"
          >
            <p class="mb-3 font-mono text-caption uppercase tracking-widest text-accent">
              {{ group.category }}
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="item in group.items"
                :key="item"
                class="rounded-full bg-bg px-3 py-1 font-body text-body-sm text-ink-muted"
              >
                {{ item }}
              </span>
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

<style scoped>
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
