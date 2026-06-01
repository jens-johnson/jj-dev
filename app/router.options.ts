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
 * █████████████████████████████████████████████ #app/router.options.ts ████████████████████████████████████████████████
 *
 * Vue Router scroll behaviour override. Forces scroll-to-top on every new route navigation so links from deep within
 * the tall horizontal-journey home page don't leave the next page scrolled past its content. Preserves saved scroll
 * positions on back/forward navigation so the user returns to where they were.
 *
 * ─── SEE ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * • https://nuxt.com/docs/guide/recipes/custom-routing#router-options
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { RouterConfig } from '@nuxt/schema';

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    // Back/forward navigation — restore the previous scroll position.
    if (savedPosition) return savedPosition;

    // Anchor link — scroll to the target with a small offset for the sticky nav.
    if (to.hash) {
      return {
        el: to.hash,
        top: 80,
        behavior: 'smooth',
      };
    }

    // New route — scroll to top, but wait for the new page to finish mounting
    // so the scroll target isn't clamped against the previous page's height.
    // The horizontal-journey component on `/` creates a 400vh outer wrapper;
    // navigating away from deep within it would otherwise leave the new page
    // scrolled past its content.
    return new Promise((resolve) => {
      const nuxtApp = useNuxtApp();
      nuxtApp.hooks.hookOnce('page:finish', () => {
        requestAnimationFrame(() =>
          resolve({
            left: 0,
            top: 0,
          }),
        );
      });
    });
  },
};
