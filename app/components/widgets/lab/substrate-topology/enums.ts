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
 * ████████████████████████████████ #components/widgets/lab/substrate-topology/enums.ts ████████████████████████████████
 *
 * The topology-band enumeration for the substrate topology diagram.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An enumeration of the topology bands; the horizontal rows devices are placed into
 * @public
 * @enum
 */
export enum SubstrateLayer {
  /* End-user machines: laptops, phones, workstations */
  client = 'client',

  /* Hypervisors and bare-metal compute */
  compute = 'compute',

  /* The internet-facing edge: WAN handoff and gateway */
  edge = 'edge',

  /* LAN fabric: firewall, switches, access points */
  network = 'network',

  /* Power delivery: UPS and PDU feeds */
  power = 'power',

  /* Hosted services and containers */
  service = 'service',

  /* Disk shelves and NAS appliances */
  storage = 'storage',
}
