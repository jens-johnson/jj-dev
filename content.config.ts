// ─── content.config.ts ───────────────────────────────────────────────────────
// @nuxt/content v3 collection definitions for jj-dev.
//
// Collections:
//   blog     — long-form writing, essays, tutorials
//   projects — portfolio case studies and open-source work
//   lab      — experiments, demos, small creative things
//   resume   — single structured YAML document
//
// All markdown collections share a common set of base fields (title, description,
// publishedAt, draft) plus collection-specific fields defined below.
//
// See: https://content.nuxt.com/docs/collections/define

import { defineCollection, defineContentConfig, z } from '@nuxt/content'

// ─── Shared field subsets ─────────────────────────────────────────────────────

/** Fields common to every markdown-based collection. */
const baseFields = {
  title: z.string(),
  description: z.string(),
  publishedAt: z.string().date(),
  updatedAt: z.string().date().optional(),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  cover: z.object({
    src: z.string(),
    alt: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
}

// ─── Collections ──────────────────────────────────────────────────────────────

export default defineContentConfig({
  collections: {

    // ── Blog ─────────────────────────────────────────────────────────────────
    // Long-form writing. Slug is derived from the filename.
    // Example path: content/blog/2025-hello-world.md
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
        ...baseFields,

        /** Reading time estimate in minutes — auto-generated if omitted. */
        readingTime: z.number().optional(),

        /**
         * Series grouping. Articles in a series link to each other.
         * e.g. { name: 'Building jj-dev', part: 1 }
         */
        series: z.object({
          name: z.string(),
          part: z.number(),
        }).optional(),
      }),
    }),

    // ── Projects ─────────────────────────────────────────────────────────────
    // Portfolio case studies and open-source projects.
    // Example path: content/projects/jj-dev.md
    projects: defineCollection({
      type: 'page',
      source: 'projects/**/*.md',
      schema: z.object({
        ...baseFields,

        /** Short label shown on cards (falls back to title if omitted). */
        shortTitle: z.string().optional(),

        /** Project status — drives the badge on project cards. */
        status: z.enum(['active', 'archived', 'wip']).default('active'),

        /** Year(s) worked on the project. */
        year: z.union([
          z.number(),
          z.object({ from: z.number(), to: z.number().optional() }),
        ]),

        /** Links associated with the project. */
        links: z.object({
          live: z.string().url().optional(),
          github: z.string().url().optional(),
          caseStudy: z.string().url().optional(),
        }).optional(),

        /** Primary technologies / stack used. */
        stack: z.array(z.string()).default([]),

        /** Whether to feature this project on the homepage. */
        featured: z.boolean().default(false),

        /** Sort weight — lower numbers appear first. */
        order: z.number().default(100),
      }),
    }),

    // ── Lab ──────────────────────────────────────────────────────────────────
    // Small experiments, demos, creative coding things.
    // Example path: content/lab/css-breathing-gradient.md
    lab: defineCollection({
      type: 'page',
      source: 'lab/**/*.md',
      schema: z.object({
        ...baseFields,

        /** Category for grouping lab entries. */
        category: z.enum([
          'animation',
          'generative',
          'interaction',
          'typography',
          'tool',
          'other',
        ]).default('other'),

        /** Live demo URL (iframe embed or external link). */
        demo: z.string().url().optional(),

        /** Whether the experiment is interactive (vs. just a write-up). */
        interactive: z.boolean().default(false),
      }),
    }),

    // ── Resume ───────────────────────────────────────────────────────────────
    // Single structured YAML document, queried as data (not rendered as page).
    // Path: content/resume.yml
    resume: defineCollection({
      type: 'data',
      source: 'resume.yml',
      schema: z.object({
        name: z.string(),
        title: z.string(),
        location: z.string(),
        email: z.string().email(),
        website: z.string().url(),
        summary: z.string(),

        experience: z.array(z.object({
          company: z.string(),
          role: z.string(),
          location: z.string().optional(),
          from: z.string(),
          to: z.string().optional(),
          current: z.boolean().default(false),
          highlights: z.array(z.string()).default([]),
          stack: z.array(z.string()).default([]),
        })),

        education: z.array(z.object({
          institution: z.string(),
          degree: z.string(),
          field: z.string(),
          year: z.number(),
        })),

        skills: z.object({
          languages: z.array(z.string()).default([]),
          frameworks: z.array(z.string()).default([]),
          tools: z.array(z.string()).default([]),
          design: z.array(z.string()).default([]),
        }),
      }),
    }),
  },
})
