<script setup lang="ts">
// ─── PrimitivesBaseHero ───────────────────────────────────────────────────────
// Base hero section layout primitive. Provides a full-viewport section shell
// with named slots for composing layered parallax heroes.
//
// Slots:
//   #backdrop — behind content: logo mark, gradient orbs, grain overlay
//   #default  — foreground content: headlines, CTAs, body copy
//   #hint     — bottom decoration: scroll indicator
//
// Attributes (class, @mousemove, ref, etc.) fall through to the root <section>
// automatically via inheritAttrs. Widgets apply their own mouse-tracking ref
// and handler directly on <PrimitivesBaseHero>.
</script>

<template>
  <section class="relative flex min-h-[92vh] items-center overflow-hidden">
    <slot name="backdrop" />
    <slot />
    <slot name="hint" />
  </section>
</template>
