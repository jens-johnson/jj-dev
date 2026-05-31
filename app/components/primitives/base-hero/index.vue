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
 * ████████████████████████████████████ #components/primitives/base-hero/index.vue █████████████████████████████████████
 *
 * Base hero section layout primitive. Full-viewport section shell with named slots for composing layered parallax heroes.
 *
 * ─── USAGE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * <PrimitivesBaseHero>
 *   <template #backdrop>...logo, orbs, grain...</template>
 *   <template #default>...headline, CTAs...</template>
 *   <template #hint>...scroll indicator...</template>
 * </PrimitivesBaseHero>
 *
 * Slots:
 *   #backdrop — behind content: logo mark, gradient orbs, grain overlay.
 *   #default  — foreground content: headlines, CTAs, body copy.
 *   #hint     — bottom decoration: scroll indicator.
 *
 * Attributes (class, @mousemove, ref, etc.) fall through to the root <section>
 * automatically via inheritAttrs.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */
</script>

<template>
  <section class="relative flex min-h-[92vh] items-center overflow-hidden">
    <slot name="backdrop" />
    <slot />
    <slot name="hint" />
  </section>
</template>
