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
 * █████████████████████████████████ #composables/use-jenscraft-metrics/utils.test.ts ██████████████████████████████████
 *
 * Unit tests for the jenscraft-metrics pure core: tile-key mapping, human formatting, and the offline/empty null
 * contract.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { getTestFileName } from '@jens-johnson/style-guide/test-utils';
import { describe, expect, it } from 'vitest';

import { symbolName } from '#shared/utils/symbol';
import type { IJenscraftMetricsView } from '~/types/jenscraft-metrics';

import { buildJenscraftLiveMetrics } from './utils';

/* ─── Fixtures ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * A fully-reporting live feed; every tile key should be populated
 * @internal
 * @constant
 */
const liveView: IJenscraftMetricsView = {
  state: 'live',
  ageSec: 12,
  ts: '2026-07-10T02:00:00.000Z',
  players: {
    online: 3,
    max: 20,
    java: 2,
    bedrock: 1,
  },
  tps: 19.98,
  mspt: 4.2,
  uptimeSec: 90_000,
  world: { exploredPct: 42.5 },
  mobs: { defeated: 1234 },
};

/**
 * A stale feed with nothing reported yet; every metric is null
 * @internal
 * @constant
 */
const emptyView: IJenscraftMetricsView = {
  state: 'stale',
  ageSec: null,
  ts: null,
  players: null,
  tps: null,
  mspt: null,
  uptimeSec: null,
  world: null,
  mobs: null,
};

/* ─── Tests ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

describe(getTestFileName(import.meta.url), (): void => {
  describe(symbolName(buildJenscraftLiveMetrics), (): void => {
    it('maps every reported metric onto its tile key with human formatting', (): void => {
      // 90,000 seconds = 1 day 1 hour; mobs render with locale grouping
      expect(buildJenscraftLiveMetrics(liveView)).toEqual({
        players: '3 / 20',
        tps: 19.98,
        mspt: 4.2,
        uptime: '1d 1h',
        explored: 42.5,
        mobs: (1234).toLocaleString(),
      });
    });

    it('returns null before the first fetch resolves', (): void => {
      expect(buildJenscraftLiveMetrics(undefined)).toBeNull();
      expect(buildJenscraftLiveMetrics(null)).toBeNull();
    });

    it('returns null for an offline feed even when stale values are present', (): void => {
      expect(buildJenscraftLiveMetrics({ ...liveView, state: 'offline' })).toBeNull();
    });

    it('returns null for a reporting feed with no recognized metrics', (): void => {
      expect(buildJenscraftLiveMetrics(emptyView)).toBeNull();
    });

    it('omits unreported metrics while keeping the reported ones', (): void => {
      // Only tps is present; zero is a real value and must survive the null checks
      expect(buildJenscraftLiveMetrics({ ...emptyView, tps: 0 })).toEqual({ tps: 0 });
    });
  });
});
