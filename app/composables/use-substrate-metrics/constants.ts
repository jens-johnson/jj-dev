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
 * ██████████████████████████████████ #composables/use-substrate-metrics/constants.ts ██████████████████████████████████
 *
 * Per-state visual treatments (Tailwind class bundles) for the substrate metrics banner, card, and inspector.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { TSubstrateHealth, TSubstrateMetricsState } from '~/types/substrate-metrics';

import type { IStateVisual } from './types';

/**
 * The per-state visual treatment (Tailwind classes), shared by the banner, card, and inspector
 * @constant
 */
export const METRIC_STATE: Record<TSubstrateMetricsState, IStateVisual> = {
  live: { label: 'Live', dot: 'bg-accent-secondary', text: 'text-accent-secondary', pulse: true },
  stale: { label: 'Stale', dot: 'bg-terra-400', text: 'text-terra-400', pulse: false },
  offline: { label: 'Offline', dot: 'bg-ink-subtle', text: 'text-ink-subtle', pulse: false },
};

/**
 * The visual treatment for the rolled-up fleet health, used by the aggregate status bar
 * @constant
 */
export const METRIC_HEALTH: Record<TSubstrateHealth, IStateVisual> = {
  healthy: { label: 'Healthy', dot: 'bg-accent-secondary', text: 'text-accent-secondary', pulse: true },
  degraded: { label: 'Degraded', dot: 'bg-terra-400', text: 'text-terra-400', pulse: true },
  stale: { label: 'Stale', dot: 'bg-terra-400', text: 'text-terra-400', pulse: false },
  offline: { label: 'Offline', dot: 'bg-ink-subtle', text: 'text-ink-subtle', pulse: false },
};
