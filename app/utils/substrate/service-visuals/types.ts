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
 * An interface representing the Tailwind class bundle for a status indicator on a service visual, including dot fill,
 * text color, and a faint tinted background
 * @public
 * @interface
 */
export interface IServiceStatusVisual {
  /* The human-readable status label */
  label: string;

  /* The Tailwind background class for the status dot */
  dot: string;

  /* The Tailwind text-color class */
  text: string;

  /* The Tailwind tinted-background class */
  tint: string;
}

/**
 * An interface representing one run of body text; "href" is set when it points at a Substrate device page (rendered
 * monospace by callers)
 * @public
 * @interface
 */
export interface ITextSegment {
  /* The text run */
  text: string;

  /* The device-page href, set only when the run is a Substrate device mention */
  href?: string;
}

/**
 * An interface representing the configuration for a link in a Substrate raw service document
 * @public
 * @interface
 * @todo - Document these attributes
 */
export interface IRawServiceDocLinkConfiguration {
  live?: string;
  map?: string;
  github?: string;
  docs?: string;
}

/**
 * An interface representing the loose shape of a services doc straight from `queryCollection`; every field optional,
 * mirroring how @nuxt/content widens schema columns to `T | undefined`. Normalized into a concrete service by the
 * helpers in this module
 * @public
 * @interface
 * @todo Move the plugins/metrics nested types to standalone types
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
  links?: IRawServiceDocLinkConfiguration;

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
