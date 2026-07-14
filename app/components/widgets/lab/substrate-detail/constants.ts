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
 * ███████████████████████████████ #components/widgets/lab/substrate-detail/constants.ts ███████████████████████████████
 *
 * Constants for the substrate inspector panel: connection-kind icon and label lookups with their fallbacks.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The icon rendered for each connection kind in the connections list
 * @public
 * @constant
 */
export const CONN_ICON_BY_KIND: Record<string, string> = {
  uplink: 'lucide:arrow-up-right',
  network: 'lucide:share-2',
  data: 'lucide:arrow-left-right',
  power: 'lucide:zap',
};

/**
 * The icon used when a connection kind has no dedicated entry
 * @public
 * @constant
 */
export const FALLBACK_CONN_ICON: string = 'lucide:share-2';

/**
 * The chip label rendered for each connection kind in the connections list
 * @public
 * @constant
 */
export const CONN_LABEL_BY_KIND: Record<string, string> = {
  uplink: 'Uplink',
  network: 'Network',
  data: 'Data',
  power: 'Power',
};

/**
 * The chip label used when a connection kind has no dedicated entry
 * @public
 * @constant
 */
export const FALLBACK_CONN_LABEL: string = 'Link';
