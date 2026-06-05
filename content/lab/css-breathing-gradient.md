---
title: CSS breathing gradient
description: >
  A pure-CSS gradient that slowly pulses between the three jj-dev theme palettes,
  using only @keyframes and custom properties. No JavaScript.
publishedAt: '2025-10-20'
tags: [css, animation, gradients]
category: animation
interactive: true
draft: true
---

An experiment in using CSS custom properties as animation targets, before browsers widely supported `@property`, and before Tailwind v4 made the token layer a first-class concept.

## The trick

Animating `--color-*` properties directly doesn't work without `@property` registration. The workaround: animate opacity on stacked gradient layers instead.

```css
@keyframes breathe {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
```

> _Demo coming once the lab page is built._
