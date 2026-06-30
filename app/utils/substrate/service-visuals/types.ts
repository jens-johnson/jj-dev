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
 * █████████████████████████████████████ #utils/substrate/service-visuals/types.ts █████████████████████████████████████
 *
 * Type definitions for the Services-layer visual lookups.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An interface representing the Tailwind class bundle for a status: dot fill, text colour, and a faint tinted background
 * @interface
 */
export interface IServiceStatusVisual {
  /* The human-readable status label */
  label: string;

  /* The Tailwind background class for the status dot */
  dot: string;

  /* The Tailwind text-colour class */
  text: string;

  /* The Tailwind tinted-background class */
  tint: string;
}

/**
 * An interface representing one run of body text; "href" is set when it points at a Substrate device page (rendered
 * monospace by callers)
 * @interface
 */
export interface ITextSegment {
  /* The text run */
  text: string;

  /* The device-page href, set only when the run is a Substrate device mention */
  href?: string;
}

/**
 * An interface representing the loose shape of a services doc straight from `queryCollection`; every field optional,
 * mirroring how @nuxt/content widens schema columns to `T | undefined`. Normalised into a concrete service by the
 * helpers in this module
 * @interface
 */
export interface IRawServiceDoc {
  /* The stable service id */
  serviceId?: string;

  /* The service title */
  title?: string;

  /* The service description */
  description?: string;

  /* The service kind */
  kind?: string;

  /* The operational status */
  status?: string;

  /* An explicit Lucide icon name */
  icon?: string;

  /* A short tagline */
  summary?: string;

  /* The host device nodeId */
  host?: string;

  /* The connect address */
  address?: string;

  /* The technology stack */
  stack?: string[];

  /* The outbound links */
  links?: { live?: string; map?: string; github?: string; docs?: string };

  /* The installed plugins / add-ons */
  plugins?: Array<{ name?: string; side?: string; category?: string; purpose?: string; url?: string }>;

  /* The declared metric tiles */
  metrics?: Array<{ key?: string; label?: string; icon?: string; unit?: string; hint?: string }>;

  /* The free-form tags */
  tags?: string[];

  /* The sort weight */
  order?: number;

  /* The content route */
  path?: string;
}
