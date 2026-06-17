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
 * █████████████████████████████████████ #pages/lab/substrate/services/index.vue ███████████████████████████████████████
 *
 * Redirect shim. The Services listing lives on the Substrate page's `?view=services` tab; this exists only so the
 * bare /lab/substrate/services path resolves there instead of falling through to the device `[slug]` route.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

definePageMeta({ redirect: '/lab/substrate?view=services' });
</script>

<template>
  <div />
</template>
