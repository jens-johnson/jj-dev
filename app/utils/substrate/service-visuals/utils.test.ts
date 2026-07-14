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
 * ██████████████████████████████████ #utils/substrate/service-visuals/utils.test.ts ███████████████████████████████████
 *
 * Unit tests for the service-visuals pure core: status/kind lookups with fallbacks, the doc normalizer's schema
 * defaults and filtering, ordering, and device-mention link splitting.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { getTestFileName } from '@jens-johnson/style-guide/test-utils';
import { describe, expect, it } from 'vitest';

import { symbolName } from '#shared/utils/symbol';

import type { IRawServiceDoc } from './types';
import {
  normalizeService,
  normalizeServices,
  serviceKindIcon,
  serviceKindLabel,
  serviceStatusOf,
  splitDeviceMentions,
} from './utils';

/* ─── Fixtures ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/**
 * The sparsest possible doc: everything falls back to a schema default
 * @internal
 * @constant
 */
const emptyDoc: IRawServiceDoc = {};

/**
 * A doc exercising every normalizer branch: partial plugins/metrics with blank entries that must be dropped
 * @internal
 * @constant
 */
const richDoc: IRawServiceDoc = {
  serviceId: 'jenscraft',
  title: 'Jenscraft',
  description: 'A minecraft server.',
  kind: 'game-server',
  status: 'online',
  stack: ['paper', 'lxc'],
  plugins: [{ name: 'metrics-publisher', side: 'server' }, { purpose: 'nameless plugin is dropped' }],
  metrics: [{ key: 'players', label: 'Players online' }, { label: 'keyless metric is dropped' }],
  order: 2,
};

/* ─── Tests ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

describe(getTestFileName(import.meta.url), (): void => {
  describe(symbolName(serviceStatusOf), (): void => {
    it('resolves the visual treatment for a known status', (): void => {
      expect(serviceStatusOf('online').label).toBe('Online');
    });

    it('falls back to the planned treatment for an unknown status', (): void => {
      expect(serviceStatusOf('mystery')).toEqual(serviceStatusOf('planned'));
    });
  });

  describe(symbolName(serviceKindIcon), (): void => {
    it('falls back to the shared "other" icon for an unknown kind', (): void => {
      expect(serviceKindIcon('mystery')).toBe(serviceKindIcon('other'));
    });
  });

  describe(symbolName(serviceKindLabel), (): void => {
    it('echoes the kind itself when no label mapping exists', (): void => {
      expect(serviceKindLabel('mystery-kind')).toBe('mystery-kind');
    });
  });

  describe(symbolName(normalizeService), (): void => {
    it('applies every schema default to an empty doc so consumers never see undefined', (): void => {
      const service = normalizeService(emptyDoc);

      expect(service.title).toBe('Untitled');
      expect(service.kind).toBe('other');
      expect(service.status).toBe('planned');
      expect(service.stack).toEqual([]);
      expect(service.plugins).toEqual([]);
      expect(service.metrics).toEqual([]);
      expect(service.tags).toEqual([]);
      expect(service.order).toBe(100);
    });

    it('derives a missing serviceId from the doc path', (): void => {
      expect(normalizeService({ path: '/lab/substrate/services/vertifix' }).serviceId).toBe('vertifix');
    });

    it('drops nameless plugins and keyless metrics while defaulting their optional fields', (): void => {
      const service = normalizeService(richDoc);

      // The nameless plugin and keyless metric are filtered out; the survivors get their defaults
      expect(service.plugins).toEqual([
        {
          name: 'metrics-publisher',
          side: 'server',
          category: 'other',
          purpose: '',
          url: undefined,
        },
      ]);
      expect(service.metrics).toEqual([
        {
          key: 'players',
          label: 'Players online',
          icon: undefined,
          unit: undefined,
          hint: undefined,
        },
      ]);
    });

    it('coerces an unrecognized plugin side to server', (): void => {
      const service = normalizeService({ plugins: [{ name: 'p', side: 'sideways' as 'server' }] });

      expect(service.plugins?.[0]?.side).toBe('server');
    });
  });

  describe(symbolName(normalizeServices), (): void => {
    it('sorts the normalized services by ascending order', (): void => {
      const services = normalizeServices([richDoc, emptyDoc, { title: 'First', order: 1 }]);

      // richDoc (order 2) sits between the explicit order 1 and the defaulted order 100
      expect(services.map((service) => service.order)).toEqual([1, 2, 100]);
    });
  });

  describe(symbolName(splitDeviceMentions), (): void => {
    it('turns a device id into a linked segment surrounded by plain segments', (): void => {
      expect(splitDeviceMentions('runs on srv-01 in the rack')).toEqual([
        { text: 'runs on ' },
        { text: 'srv-01', href: '/lab/substrate/srv-01' },
        { text: ' in the rack' },
      ]);
    });

    it('links multiple mentions and lowercases the href for uppercase ids', (): void => {
      expect(splitDeviceMentions('SRV-01 uplinks to sw-02')).toEqual([
        { text: 'SRV-01', href: '/lab/substrate/srv-01' },
        { text: ' uplinks to ' },
        { text: 'sw-02', href: '/lab/substrate/sw-02' },
      ]);
    });

    it('returns the whole text as one plain segment when nothing matches', (): void => {
      expect(splitDeviceMentions('no devices here')).toEqual([{ text: 'no devices here' }]);
    });
  });
});
