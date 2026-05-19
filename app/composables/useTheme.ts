// ─── composables/useTheme.ts ──────────────────────────────────────────────────
// Manages the active site theme (day / sunset / night).
//
// Theme is persisted to localStorage and applied as a `data-theme` attribute on
// <html>. SSR-safe: attribute is only written on the client.
//
// Usage:
//   const { theme, setTheme, cycleTheme } = useTheme()

export type Theme = 'day' | 'sunset' | 'night';

const THEMES: Theme[] = ['day', 'sunset', 'night'];
const STORAGE_KEY = 'jj-theme';
const DEFAULT_THEME: Theme = 'day';

export function useTheme() {
  // useState is keyed by 'theme' so it's shared across all callers —
  // must live inside the function to have access to the Nuxt instance.
  const theme = useState<Theme>('theme', () => DEFAULT_THEME);

  /** Apply a theme to <html> and persist to localStorage. */
  function setTheme(next: Theme) {
    theme.value = next;
    if (import.meta.client) {
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEY, next);
    }
  }

  /** Rotate through day → sunset → night → day. */
  function cycleTheme() {
    const currentIndex = THEMES.indexOf(theme.value);
    const next = THEMES[(currentIndex + 1) % THEMES.length] as Theme;
    setTheme(next);
  }

  /** Read persisted preference on client mount. */
  function initTheme() {
    if (!import.meta.client) return;
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
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
