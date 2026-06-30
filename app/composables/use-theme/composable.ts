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
 * ███████████████████████████████████████ #composables/use-theme/composable.ts ████████████████████████████████████████
 *
 * Day/sunset/night theme state. The theme is persisted to localStorage and applied as a `data-theme` attribute on
 * <html>; useState keys the value so every caller shares one reactive source.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { TTheme } from './types';

// The ordered theme rotation, the localStorage key, and the default applied before any stored preference loads.
const THEMES: TTheme[] = ['day', 'sunset', 'night'];
const STORAGE_KEY = 'jj-theme';
const DEFAULT_THEME: TTheme = 'day';

/**
 * A composable exposing the active site theme plus helpers to set, cycle, and initialise it
 * @returns The reactive theme ref, the setter/cycler/initialiser functions, and the ordered theme list
 */
export function useTheme() {
  // useState is keyed by 'theme' so it is shared across all callers; it must live inside the function to have
  // access to the Nuxt instance.
  const theme = useState<TTheme>('theme', () => DEFAULT_THEME);

  // Apply a theme to <html> and persist it to localStorage.
  function setTheme(next: TTheme) {
    theme.value = next;
    if (import.meta.client) {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEY, next);
    }
  }

  // Rotate through day, sunset, night, and back to day.
  function cycleTheme() {
    const currentIndex = THEMES.indexOf(theme.value);
    const next = THEMES[(currentIndex + 1) % THEMES.length] as TTheme;
    setTheme(next);
  }

  // Read the persisted preference on client mount.
  function initTheme() {
    if (!import.meta.client) return;
    const stored = localStorage.getItem(STORAGE_KEY) as TTheme | null;
    const preferred = stored && THEMES.includes(stored) ? stored : DEFAULT_THEME;
    setTheme(preferred);
  }

  return {
    theme,
    setTheme,
    cycleTheme,
    initTheme,
    THEMES,
  };
}
