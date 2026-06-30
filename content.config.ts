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
 * █████████████████████████████████████████████████ content.config.ts █████████████████████████████████████████████████
 *
 * @nuxt/content v3 collection definitions for jj-dev. Defines blog, projects, lab, and resume collections with typed
 * Zod schemas.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Collections are queried with `queryCollection('blog')` etc. in components and pages. Schema changes here flow
 * through to TypeScript types automatically.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://content.nuxt.com/docs/collections/define
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { defineCollection, defineContentConfig, z } from '@nuxt/content';

/* ─── Schemas ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A schema representing fields shared by every markdown-based collection (blog, projects, lab, substrate).
 * Extended per-collection via `.extend()`.
 * @internal
 * @constant
 */
const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  publishedAt: z.string().date(),
  updatedAt: z.string().date().optional(),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  cover: z
    .object({
      src: z.string(),
      alt: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
});

/**
 * A schema representing content for blog posts (long-form writing). Slug is derived from the filename.
 * Example path: `content/blog/2025-hello-world.md`
 * @internal
 * @constant
 */
const blogSchema = baseSchema.extend({
  /*
   * Optional subtitle; renders below the title on both the post detail page and listing cards.
   * Use when the title sets the topic and the subtitle hints at the angle / question.
   */
  subtitle: z.string().optional(),

  /* The reading time estimate in minutes; auto-generated if omitted. */
  readingTime: z.number().optional(),

  /* Series grouping. Articles in a series link to each other. i.e. `{ name: 'Building jj-dev', part: 1 }` */
  series: z
    .object({
      name: z.string(),
      part: z.number(),
    })
    .optional(),
});

/**
 * The schema representing content for portfolio case studies and open-source projects.
 * Example path: `content/projects/jj-dev.md`
 * @internal
 * @constant
 */
const projectsSchema = baseSchema.extend({
  /* A short label shown on cards (falls back to title if omitted) */
  shortTitle: z.string().optional(),

  /* A project status (drives the badge on project cards) */
  status: z.enum(['active', 'archived', 'wip']).default('active'),

  /* Year(s) worked on the project */
  year: z.union([
    z.number(),
    z.object({
      from: z.number(),
      to: z.number().optional(),
    }),
  ]),

  /* Links associated with the project */
  links: z
    .object({
      live: z.string().url().optional(),
      github: z.string().url().optional(),
      caseStudy: z.string().url().optional(),
    })
    .optional(),

  /* Primary technologies / stack used */
  stack: z.array(z.string()).default([]),

  /* Whether to feature this project on the homepage */
  featured: z.boolean().default(false),

  /* Sort weight; lower numbers appear first */
  order: z.number().default(100),
});

/**
 * The schema representing lab posts for small experiments, demos, creative coding things.
 * Example path: `content/lab/css-breathing-gradient.md`
 * @internal
 * @constant
 */
const labSchema = baseSchema.extend({
  /* Category for grouping lab entries */
  category: z.enum(['animation', 'generative', 'interaction', 'typography', 'tool', 'other']).default('other'),

  /* Live demo URL (iframe embed or external link) */
  demo: z.string().url().optional(),

  /* Whether the experiment is interactive (vs. just a write-up) */
  interactive: z.boolean().default(false),
});

/**
 * The schema representing a single piece of homelab hardware; one node in the Substrate topology.
 * Each device is its own markdown doc; the body holds free-form notes, learnings, and config snippets.
 * Example path: `content/substrate/pve-01.md`
 * @internal
 * @constant
 */
const substrateSchema = baseSchema.extend({
  /*
   * Stable node id, referenced by other devices' `connections[].to`. Named `nodeId` (not `id`) because
   * `id` is reserved by @nuxt/content as the document's internal primary key. e.g. `pve-01`.
   */
  nodeId: z.string(),

  /*
   * Device class; drives the node icon and reads as the device's "what it is". `internet` is the upstream
   * WAN/ISP cloud that everything ultimately uplinks to.
   */
  kind: z
    .enum([
      'internet',
      'gateway',
      'firewall',
      'router',
      'switch',
      'ap',
      'server',
      'hypervisor',
      'nas',
      'storage',
      'pi',
      'workstation',
      'ups',
      'iot',
      'other',
    ])
    .default('other'),

  /* Topology band; drives vertical placement, from `edge` (top, faces the internet) down to `power` (bottom). */
  layer: z.enum(['edge', 'network', 'compute', 'storage', 'service', 'client', 'power']).default('compute'),

  /* Operational status; drives the node's status dot and inspector badge colour. */
  status: z.enum(['online', 'offline', 'planned', 'maintenance']).default('online'),

  /* Manufacturer, e.g. `Protectli`, `Synology`, `Raspberry Pi`. */
  vendor: z.string().optional(),

  /* Specific model, e.g. `VP2420`, `DS923+`. */
  model: z.string().optional(),

  /* Key spec rows shown in the inspector panel, e.g. `{ label: 'CPU', value: 'i5-1235U' }`. */
  specs: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    )
    .default([]),

  /* Typical idle draw in watts; summed into the dashboard's total-power stat. */
  power: z.number().optional(),

  /*
   * Links to other devices, referenced by their `id`. `kind` styles the drawn edge: `uplink` (toward the
   * internet/gateway), `network` (LAN), `data` (storage / replication traffic), `power` (UPS feed).
   */
  connections: z
    .array(
      z.object({
        to: z.string(),
        kind: z.enum(['uplink', 'network', 'data', 'power']).default('network'),
        label: z.string().optional(),
      }),
    )
    .default([]),

  /* Sort weight within a layer; lower numbers sit further left in the topology row. */
  order: z.number().default(100),
});

/**
 * The schema representing a deployed homelab service; one entry in the Substrate "Services" layer. Where the
 * `substrate` collection documents the hardware, this documents what *runs* on it. The body holds the long-form
 * write-up (architecture, setup, decisions); frontmatter drives the card, the detail header, and the metrics tiles.
 * Example path: `content/services/jenscraft.md`
 * @internal
 * @constant
 */
const servicesSchema = baseSchema.extend({
  /*
   * Stable service id, used in routes and as the live-metrics key. Named `serviceId` (not `id`) because `id` is
   * reserved by @nuxt/content as the document's internal primary key. e.g. `jenscraft`.
   */
  serviceId: z.string(),

  /* Service class; drives the card icon and reads as the service's "what it is". */
  kind: z
    .enum(['game-server', 'media', 'monitoring', 'network', 'automation', 'storage', 'web', 'other'])
    .default('other'),

  /*
   * Operational status; drives the status dot and badge colour. `planned` covers a service that is documented but
   * not yet stood up (Jenscraft today).
   */
  status: z.enum(['online', 'offline', 'planned', 'maintenance', 'degraded']).default('planned'),

  /* Optional explicit Lucide icon name, overriding the per-kind default. */
  icon: z.string().optional(),

  /* Short tagline shown on the service card (falls back to `description`). */
  summary: z.string().optional(),

  /* `nodeId` of the substrate device this service runs on (e.g. `srv-01`), linking a service back to its hardware. */
  host: z.string().optional(),

  /* Player/visitor-facing connect address, e.g. `jenscraft.world`. */
  address: z.string().optional(),

  /* Primary technologies / stack powering the service. */
  stack: z.array(z.string()).default([]),

  /* Outbound links shown on the detail page. `map` is the public BlueMap (or similar) web view. */
  links: z
    .object({
      live: z.string().url().optional(),
      map: z.string().url().optional(),
      github: z.string().url().optional(),
      docs: z.string().url().optional(),
    })
    .optional(),

  /*
   * Installed plugins / add-ons. `side` marks whether it runs on the server or is a client-side recommendation;
   * `category` groups the list in the UI.
   */
  plugins: z
    .array(
      z.object({
        name: z.string(),
        side: z.enum(['server', 'client']).default('server'),
        category: z
          .enum(['crossplay', 'map', 'performance', 'quality-of-life', 'moderation', 'other'])
          .default('other'),
        purpose: z.string(),
        url: z.string().url().optional(),
      }),
    )
    .default([]),

  /*
   * Declared dashboard tiles; the metrics this service plans to surface. The live feed fills the values once the
   * service's metrics publisher reports in; until then the dashboard renders each tile as "awaiting feed".
   */
  metrics: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        icon: z.string().optional(),
        unit: z.string().optional(),
        hint: z.string().optional(),
      }),
    )
    .default([]),

  /* Sort weight on the Services grid; lower numbers appear first. */
  order: z.number().default(100),
});

/**
 * The schema representing resume content; a single structured YAML document, queried as data (not rendered as a page).
 * Path: `content/resume.yml`
 * @internal
 * @constant
 */
const resumeSchema = z.object({
  name: z.string(),
  title: z.string(),
  location: z.string(),
  email: z.string().email(),
  website: z.string().url(),
  summary: z.string(),

  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      location: z.string().optional(),
      from: z.string(),
      to: z.string().optional(),
      current: z.boolean().default(false),
      highlights: z.array(z.string()).default([]),
      stack: z.array(z.string()).default([]),
    }),
  ),

  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      year: z.number(),
    }),
  ),

  skills: z.object({
    languages: z.array(z.string()).default([]),
    frameworks: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
    design: z.array(z.string()).default([]),
  }),
});

/* ─── Collections ────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The content configuration for the project
 * @public
 * @default
 * @constant
 */
export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: blogSchema,
    }),

    projects: defineCollection({
      type: 'page',
      source: 'projects/**/*.md',
      schema: projectsSchema,
    }),

    lab: defineCollection({
      type: 'page',
      source: 'lab/**/*.md',
      schema: labSchema,
    }),

    substrate: defineCollection({
      type: 'page',
      source: 'substrate/**/*.md',
      schema: substrateSchema,
    }),

    services: defineCollection({
      type: 'page',
      source: 'services/**/*.md',
      schema: servicesSchema,
    }),

    resume: defineCollection({
      type: 'data',
      source: 'resume.yml',
      schema: resumeSchema,
    }),
  },
});
