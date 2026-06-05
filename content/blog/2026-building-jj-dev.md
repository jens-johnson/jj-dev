---
title: Building jj-dev
subtitle: A portfolio, a passion project, or something else?
description: >
  The introductory meta-post: how I built this site, why I'm here and (maybe) why you're reading this.
publishedAt: '2026-05-25'
tags: [Design, Process, Web Development, Nuxt, Tailwind]
series:
  name: Building jj-dev
  part: 1
---

Welcome to `jj-dev`, the self-coined moniker for a project of mine that has been several years in the making: my personal website. I wanted to dedicate the introductory post for this site to the what, why, and how of this project: what this site is _(and is eventually (hopefully) going to be)_, how I created it, and perhaps, most importantly, why I built it.

This post represents the first in a series of explanatory deep dives I want to create to illustrate the process of creating this project. I hope that in documenting my process, showing how the foundational components of an application/technology come together from ideation to implementation, and explaining the design rationale, engineering patterns, and workflows that I have put into place not only serve to make `jj-dev` a self-documenting artifact, but also something that **you**, the reader can take in as inspiration and a resource should you choose to create your own website.

Building software doesn't have to be an arid, leaden process, and I hope if the reader can take anything away from this project or this post, it's that it should be fun! I want this to be a platform for me to express myself, more akin to a metaphorical digital canvas and paintbrush than an exercise in drudgery and monotony. So, if you, the reader, have made it this far, first of all, congratulations, for bearing through my yapping. But more importantly, I look forward to dispelling the myth that technology and software development is some mythical, complex endeavor for introverts sitting behind a glowing screen in a dark room; it's a beautiful, manifold space where we can express ourselves, embrace creativity, and solve problems in a unique and fun way.

## A Passion Project, a Headache, and Many Iterations

Before we get into the current state of things, let's rewind a bit. As a software engineer by trade, a designer and creator by passion, and an easily distracted, project-starter-and-dropper by habit, `jj-dev` has been an effort of multiple iterations.

I've always wanted a personal website, and when I saw the `jens-johnson.com` domain for sale back in 2020, the nascent, naive engineer in me thought _"What the hell, let's buy it and start building."_

This decision resulted in the 6+ year cyclical saga of building, tearing down, designing, and re-building this project. Over the course of resculpting and reimplementing `jj-dev`, it's gone through a spectrum of different stacks, tools, and technologies, including:

- A GitHub Sites native-approach using [Jekyll](https://jekyllrb.com/) templates and flavored markdown
- An [AWS Lightsail](https://aws.amazon.com/lightsail/) deployment with an [Express.js](https://expressjs.com/) backend and React-flavored UI
- A [Django](https://www.djangoproject.com/) / [Flask](https://flask.palletsprojects.com/) Python build _(oof, that one was painful)_
- A pure [Vue](https://vuejs.org/) / [Vuetify](https://vuetifyjs.com/) / [TypeScript](https://www.typescriptlang.org/) stack
- ... and countless others

Each of these approaches has had roughly the same pattern:

::iteration-cycle
::

I suppose `jj-dev` has been the perfect microcosm of my ADHD / obsessive personality: I get hyperfocused on something, build momentum, but then it tapers off. This time I wanted to do things differently, and hopefully this inaugural post highlights just that.

## Creating It Right This Time

My previous efforts on `jj-dev` taught me a few things:

1. **Maintainability** is a key feature for this project: it should be lightweight enough to maintain / support after it has been scaffolded and created. I want my portfolio / personal site to be self-sustaining: once the bones are in place, upkeep and overhead should be minimal.
2. **Don't reinvent the (digital) wheel**: The web application development space is one of the most wonderfully supported and maintained software engineering areas. There is a vast wealth of resources for projects like this, for all facets, from testing to accessibility. Learn to leverage and build upon the primitives rather than recreating them.
3. **Personal touch is a key feature, not an afterthought.** I want `jj-dev` to be a representation of me, Jens Johnson, not a soul-less, corporate-y resume wrapper that reads like a LinkedIn page. Sure, I want to highlight my professional skills and accomplishments; those are important. But they are no less important than showing the other facets of me: my passion for environmental stewardship and nature, my musings and ramblings on technology and culture, my not-so-precise-and-technical baking skills (of which I am still honing). I hope this can serve to be a window into all things _me_, and that needed to be a foundational consideration when beginning this undertaking.

In addition to these, a fourth, more novel finding:

4. **Embrace and harness agentic development.** Don't run from the _"AI boogeyman"_; learn how to leverage agents to automate the monotonous, tedious parts of the process: making stylistic tweaks, improving CI/CD, bolstering monitoring and observability, and so much more. This piece has been crucial for me in accelerating the development of this project as a solo developer, and it is, in general, one of the facets of development in which I see some of the most untapped sources of engineering capabilities. Agentic development and design represents the modern frontier of software engineering, and I would be remiss if I didn't focus on its incorporation into this project.

## Putting the Foundation in Place: Project Goals

Alright, moving forward. I knew I needed to create something maintainable, that was future-proofed and iteration-optimized, something that was integratable with the vast web application resource ecosystem, something with my personal touch and ethos baked into the very foundation, and something that could support agentic development workflows. These were the "guardrails" of `jj-dev` that helped me shape the goals for this project.

::goals-carousel
::

## The Stack

::stack-blocks
::

As you can see here, the stack is a representation in and of itself of the project's goals: lightweight but robust, customizable but maintainable, and personal but extensible.

## Rooted in Nature: The Design

I wanted `jj-dev` to be something that imbued naturistic concepts and principles, not a tech-heavy digitally-washed splash of pixels. As such, an integral part of the design process was looking out(side) to nature to derive tokens and a design framework that reflected that:

::design-inspiration
::

## Component Architecture: Atomic, But Loosely

One of the biggest design pain-points for me for a UI application like this is defining the component organization pattern for the project. I settled on an atomic design-esque approach which helps me organize primitives for extensibility and reusability, as well as partition dedicated, feature-tied widgets that build on those primitives:

```
components/
├── brand/          ← global, branding (i.e. logos, wordmarks, etc.)
├── containment/    ← containers and content organization (i.e. cards, surfaces)
├── data/           ← dedicated data display (i.e. status badge, tables, etc.)
├── feedback/       ← interactivity and responsiveness (i.e. scroll progress, alerts)
├── layout/         ← layout assistance and organization (i.e. navigation, footer)
├── primitives/     ← atomic primitive foundationals (i.e. heroes, parallax)
└── widgets/        ← custom-tailored page sections that build on all of the above
```

## Intuitive CI/CD Orchestration

Full disclosure here: I do not claim to be a DevOps veteran or expert. However, I know that the best projects and software are supported by robust build tooling and pipelines. Part of this process was integrating a three-fold branch and deploy model:

::branch-table
::

This segregation allows me to cleanly distinguish feature deploys on a dedicated `feat/*` branch, stage them on the long-lived `staging` branch for live QA, and when ready, open a `staging → main` promotion PR automatically through GitHub Actions to push them to production.

Some other facets of my CI/CD process:

- Git hooks supported by [Lefthook](https://lefthook.dev/) and [Commitlint](https://commitlint.js.org/) automate the necessary linting, testing, validation, and artifact generation steps of the pipeline.
- Automated version control steps ensure changelog validation, release tagging, and versioning to mitigate version conflicts and ensure parity, consistency, and transparency.
- [GitHub Actions](https://docs.github.com/en/actions) acts as a source of truth for CI/CD: seamless integration with code changes to the repo ensures that actions provide clean workflows for maintaining the project.

## What's Next?

To the reader: I thank you for your patience in sifting through my verbosity in explaining this project, and I hope this post can be of some value to you if you're thinking of starting your own, or looking at ways to improve. As I continue to expand `jj-dev`, I look forward on taking you along for the journey: the fun parts, the painful debugging, and everything in between.

Have something you want me to dig into further on the next post? Let me know: [jens@jens-johnson.com](mailto:jens@jens-johnson.com?subject=jj-dev%20blog%20feedback).

Til next time,

J
