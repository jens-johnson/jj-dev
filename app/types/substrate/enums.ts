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
 * █████████████████████████████████████████████ #types/substrate/enums.ts █████████████████████████████████████████████
 *
 * The operational-state enumeration for the Substrate homelab topology.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An enumeration of the operational states of a device; drives status dots and badge color
 * @public
 * @enum
 */
export enum SubstrateStatus {
  /* The device is up and reporting */
  online = 'online',

  /* The device is down */
  offline = 'offline',

  /* The device is planned but not yet deployed */
  planned = 'planned',

  /* The device is temporarily down for maintenance */
  maintenance = 'maintenance',
}
