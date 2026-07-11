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

import type { IUseThemeReturn, TTheme } from './types';

// The ordered theme rotation, the localStorage key, and the default applied before any stored preference loads.
const THEMES: TTheme[] = ['day', 'sunset', 'night'];
const STORAGE_KEY: string = 'jj-theme';
const DEFAULT_THEME: TTheme = 'day';

/**
 * A composable exposing the active site theme plus helpers to set, cycle, and initialize it
 * @public
 * @function
 * @returns The reactive theme ref, the setter/cycler/initializer functions, and the ordered theme list
 */
export function useTheme(): IUseThemeReturn {
  /* ─── State ────────────────────────────────────────────────────────────────────────────────────────────────────── */

  /**
   * The shared reactive theme; useState keys it by 'theme' so every caller shares one source, and it must live inside
   * the composable function to have access to the Nuxt instance
   * @internal
   * @constant
   */
  const theme: Ref<TTheme> = useState<TTheme>('theme', (): TTheme => DEFAULT_THEME);

  /* ─── Methods ──────────────────────────────────────────────────────────────────────────────────────────────────── */

  /**
   * A utility method to apply a theme; sets the shared state, stamps `data-theme` on <html>, and persists the choice
   * to localStorage on the client
   * @internal
   * @function
   * @param next - The theme to apply
   */
  function setTheme(next: TTheme): void {
    // Set the shared state so every caller sees the new theme
    theme.value = next;

    // Stamp the attribute and persist the preference; both are client-only concerns
    if (import.meta.client) {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEY, next);
    }
  }

  /**
   * A utility method to rotate to the next theme in order (day, sunset, night, and back to day)
   * @internal
   * @function
   */
  function cycleTheme(): void {
    // Find the active theme's position in the rotation
    const currentIndex: number = THEMES.indexOf(theme.value);

    // Advance one step, wrapping back to the start of the rotation
    const next: TTheme = THEMES[(currentIndex + 1) % THEMES.length] as TTheme;
    setTheme(next);
  }

  /**
   * A utility method to read the persisted preference from localStorage on client mount, falling back to the default
   * theme when nothing valid is stored
   * @internal
   * @function
   */
  function initTheme(): void {
    // Server renders have no persisted preference to read
    if (!import.meta.client) {
      return;
    }

    // Apply the stored preference when it names a known theme; otherwise fall back to the default
    const stored: TTheme | null = localStorage.getItem(STORAGE_KEY) as TTheme | null;
    const preferred: TTheme = stored && THEMES.includes(stored) ? stored : DEFAULT_THEME;
    setTheme(preferred);
  }

  /* ─── Return ───────────────────────────────────────────────────────────────────────────────────────────────────── */

  return {
    theme,
    setTheme,
    cycleTheme,
    initTheme,
    THEMES,
  };
}
