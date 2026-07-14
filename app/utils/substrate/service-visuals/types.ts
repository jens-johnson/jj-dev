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
 */
export interface IRawServiceDocLinkConfiguration {
  /* The live/production URL for the service */
  live?: string;

  /* The URL to the service's location on the Substrate topology map */
  map?: string;

  /* The service's source repository URL */
  github?: string;

  /* The service's documentation URL */
  docs?: string;
}

/**
 * An interface representing a plugin entry in a Substrate raw service document; every field optional, mirroring how
 * @nuxt/content widens schema columns to `T | undefined`
 * @public
 * @interface
 */
export interface IRawServicePlugin {
  /* The plugin name */
  name?: string;

  /* Which side the plugin runs on (`client` or `server`) */
  side?: string;

  /* The plugin category */
  category?: string;

  /* What the plugin does */
  purpose?: string;

  /* The plugin's homepage or source URL */
  url?: string;
}

/**
 * An interface representing a metric entry in a Substrate raw service document; every field optional, mirroring how
 * @nuxt/content widens schema columns to `T | undefined`
 * @public
 * @interface
 */
export interface IRawServiceMetric {
  /* The metric's stable key */
  key?: string;

  /* The metric's human-readable label */
  label?: string;

  /* An explicit Lucide icon name for the metric */
  icon?: string;

  /* The metric's unit suffix */
  unit?: string;

  /* A short explanatory hint */
  hint?: string;
}

/**
 * An interface representing the loose shape of a services doc straight from `queryCollection`; every field optional,
 * mirroring how @nuxt/content widens schema columns to `T | undefined`. Normalized into a concrete service by the
 * helpers in this module
 * @public
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
  links?: IRawServiceDocLinkConfiguration;

  /* The installed plugins / add-ons */
  plugins?: IRawServicePlugin[];

  /* The declared metric tiles */
  metrics?: IRawServiceMetric[];

  /* The free-form tags */
  tags?: string[];

  /* The sort weight */
  order?: number;

  /* The content route */
  path?: string;
}
