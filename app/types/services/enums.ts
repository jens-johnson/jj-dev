/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                 ██        ██                     ▄▄
 *                                 ▀▀        ▀▀                     ██
 *                               ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                 ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                 ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                 ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                 ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                              ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * █████████████████████████████████████████████ #types/services/enums.ts ██████████████████████████████████████████████
 *
 * The operational-state enumeration for the Substrate services layer.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An enumeration of the operational states of a service; drives status dots and badge color
 * @public
 * @enum
 */
export enum ServiceStatus {
  /* The service is up and reachable */
  online = 'online',

  /* The service is down */
  offline = 'offline',

  /* The service is planned but not yet stood up */
  planned = 'planned',

  /* The service is temporarily down for maintenance */
  maintenance = 'maintenance',

  /* The service is up but a health check is failing */
  degraded = 'degraded',
}
