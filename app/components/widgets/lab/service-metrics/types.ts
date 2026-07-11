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
 * █████████████████████████████████ #components/widgets/lab/service-metrics/types.ts ██████████████████████████████████
 *
 * Type definitions for the service metrics dashboard: the props contract.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { IServiceMetricTile } from '~/types/services';

/**
 * The props accepted by the service metrics dashboard: the declared tiles, the live values feeding them, and the
 * empty-state noun
 * @public
 * @interface
 */
export interface IServiceMetricsProps {
  /* The declared metric tiles from the service frontmatter */
  tiles: IServiceMetricTile[];

  /* Live values keyed by tile `key`; null until the metrics publisher reports in */
  live?: Record<string, string | number> | null;

  /* The short noun for the empty-state copy, e.g. "server" */
  label?: string;
}
