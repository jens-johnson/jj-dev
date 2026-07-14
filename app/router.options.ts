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
 * Vue Router scroll behavior override. Forces scroll-to-top on every new route navigation so links from deep within
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

/**
 * The scroll-behavior signature as declared by Nuxt's RouterConfig; the single source for the parameter and return
 * types of the handler below
 * @internal
 */
type TScrollBehavior = NonNullable<RouterConfig['scrollBehavior']>;

/**
 * Resolves the scroll position for a navigation: restores the saved position on back/forward, eases to an anchor
 * target with a sticky-nav offset, and otherwise scrolls to the top once the incoming page has finished mounting (so
 * the target is not clamped against the previous page's height; the home page's horizontal-journey component creates a
 * 400vh wrapper, and navigating away from deep within it would otherwise leave the next page scrolled past its content)
 * @internal
 * @function
 * @param to - The target route being navigated to
 * @param from - The route being navigated away from
 * @param savedPosition - The scroll position the browser saved on back/forward, or null on a fresh navigation
 * @returns The resolved scroll position; a promise for the new-route case, which waits for the page to mount
 */
const scrollBehavior: TScrollBehavior = (to, from, savedPosition) => {
  // Back/forward navigation; restore the previous scroll position.
  if (savedPosition) {
    return savedPosition;
  }

  // Anchor link; scroll to the target with a small offset for the sticky nav.
  if (to.hash) {
    return {
      el: to.hash,
      top: 80,
      behavior: 'smooth',
    };
  }

  // New route; scroll to top, but wait for the new page to finish mounting.
  return new Promise((resolve): void => {
    const nuxtApp = useNuxtApp();
    nuxtApp.hooks.hookOnce('page:finish', (): void => {
      requestAnimationFrame((): void => resolve({ left: 0, top: 0 }));
    });
  });
};

/**
 * The Vue Router options override for the app; supplies the custom scroll behavior
 * @public
 * @default
 * @constant
 */
export default <RouterConfig>{
  scrollBehavior,
};
