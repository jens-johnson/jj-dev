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
 * A schema representing fields shared by every markdown-based collection (blog, projects, lab). Extended
 * per-collection via `.extend()`.
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
  /**
   * The reading time estimate in minutes — auto-generated if omitted.
   */
  readingTime: z.number().optional(),

  /**
   * Series grouping. Articles in a series link to each other.
   * i.e. `{ name: 'Building jj-dev', part: 1 }`
   */
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
  /**
   * A short label shown on cards (falls back to title if omitted)
   */
  shortTitle: z.string().optional(),

  /**
   * A project status (drives the badge on project cards)
   */
  status: z.enum(['active', 'archived', 'wip']).default('active'),

  /**
   * Year(s) worked on the project
   */
  year: z.union([
    z.number(),
    z.object({
      from: z.number(),
      to: z.number().optional(),
    }),
  ]),

  /**
   * Links associated with the project
   */
  links: z
    .object({
      live: z.string().url().optional(),
      github: z.string().url().optional(),
      caseStudy: z.string().url().optional(),
    })
    .optional(),

  /**
   * Primary technologies / stack used
   */
  stack: z.array(z.string()).default([]),

  /**
   * Whether to feature this project on the homepage
   */
  featured: z.boolean().default(false),

  /**
   * Sort weight — lower numbers appear first
   */
  order: z.number().default(100),
});

/**
 * The schema representing lab posts for small experiments, demos, creative coding things.
 * Example path: `content/lab/css-breathing-gradient.md`
 * @internal
 * @constant
 */
const labSchema = baseSchema.extend({
  /**
   * Category for grouping lab entries
   */
  category: z.enum(['animation', 'generative', 'interaction', 'typography', 'tool', 'other']).default('other'),

  /**
   * Live demo URL (iframe embed or external link)
   */
  demo: z.string().url().optional(),

  /**
   * Whether the experiment is interactive (vs. just a write-up)
   */
  interactive: z.boolean().default(false),
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

    resume: defineCollection({
      type: 'data',
      source: 'resume.yml',
      schema: resumeSchema,
    }),
  },
});
