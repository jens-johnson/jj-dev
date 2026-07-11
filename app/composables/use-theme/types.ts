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
 * ██████████████████████████████████████████ #composables/use-theme/types.ts ██████████████████████████████████████████
 *
 * Type definitions for the theme composable: the theme union and the typed return surface.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An enumeration of the available site themes
 * @public
 * @enum
 */
export enum Theme {
  /* The bright daytime palette */
  day = 'day',

  /* The warm dusk palette */
  sunset = 'sunset',

  /* The dark nighttime palette */
  night = 'night',
}

/**
 * A type representing the available site themes; one of {@link Theme}
 * @public
 */
export type TTheme = `${Theme}`;

/**
 * An interface representing the return value from the `useTheme` composable
 * @public
 * @interface
 */
export interface IUseThemeReturn {
  /* The shared reactive theme; keyed by useState so every caller sees one source */
  readonly theme: Ref<TTheme>;

  /* Applies a theme: sets the shared state, stamps `data-theme` on <html>, and persists the choice on the client */
  readonly setTheme: (next: TTheme) => void;

  /* Rotates to the next theme in order (day, sunset, night, and back to day) */
  readonly cycleTheme: () => void;

  /* Reads the persisted preference from localStorage on client mount, falling back to the default theme */
  readonly initTheme: () => void;

  /* The ordered theme rotation */
  readonly THEMES: TTheme[];
}
