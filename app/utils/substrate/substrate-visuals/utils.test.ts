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
 * █████████████████████████████████ #utils/substrate/substrate-visuals/utils.test.ts ██████████████████████████████████
 *
 * Unit tests for the substrate-visuals pure core: status/kind lookups with fallbacks and the doc normalizer's schema
 * defaults, nested normalization, and edge filtering.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { describe, expect, it } from 'vitest';

import type { IRawSubstrateDoc } from './types';
import { kindIcon, kindLabel, normalizeDevice, normalizeDevices, statusOf } from './utils';

/* ─── Fixtures ────────────────────────────────────────────────────────────────────────────────────────────────────── */

/* The sparsest possible doc: every field falls back to a schema default */
const emptyDoc: IRawSubstrateDoc = {};

/* A doc exercising the normalizer's nested branches: partial specs/connections with a blank edge that must be dropped */
const richDoc: IRawSubstrateDoc = {
  nodeId: 'srv-01',
  title: 'Server 01',
  kind: 'server',
  layer: 'compute',
  status: 'online',
  specs: [{ label: 'CPU', value: 'i5-1235U' }, { label: 'RAM' }],
  connections: [{ to: 'sw-01', kind: 'network' }, { kind: 'power' }],
  order: 3,
};

/* ─── Tests ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

describe('statusOf', () => {
  it('resolves the visual treatment for a known status', () => {
    expect(statusOf('offline').label).toBe('Offline');
  });

  it('falls back to the online treatment for an unknown status', () => {
    expect(statusOf('mystery')).toEqual(statusOf('online'));
  });
});

describe('kindIcon', () => {
  it('falls back to the "other" icon for an unknown kind', () => {
    expect(kindIcon('mystery')).toBe(kindIcon('other'));
  });
});

describe('kindLabel', () => {
  it('echoes the kind itself when no label mapping exists', () => {
    expect(kindLabel('mystery-kind')).toBe('mystery-kind');
  });
});

describe('normalizeDevice', () => {
  it('applies every schema default to an empty doc so consumers never see undefined', () => {
    const device = normalizeDevice(emptyDoc);

    expect(device.title).toBe('Untitled');
    expect(device.kind).toBe('other');
    expect(device.layer).toBe('compute');
    expect(device.status).toBe('online');
    expect(device.tags).toEqual([]);
    expect(device.order).toBe(100);
  });

  it('derives a missing nodeId from the doc path', () => {
    expect(normalizeDevice({ path: '/lab/substrate/pve-01' }).nodeId).toBe('/lab/substrate/pve-01');
  });

  it('normalizes specs and drops edges without a target while defaulting optional fields', () => {
    const device = normalizeDevice(richDoc);

    // The blank-label spec keeps a defaulted value; the target-less connection is filtered out
    expect(device.specs).toEqual([
      { label: 'CPU', value: 'i5-1235U' },
      { label: 'RAM', value: '' },
    ]);
    expect(device.connections).toEqual([
      {
        to: 'sw-01',
        kind: 'network',
        label: undefined,
      },
    ]);
  });
});

describe('normalizeDevices', () => {
  it('normalizes every doc in the list, preserving input order', () => {
    const devices = normalizeDevices([richDoc, emptyDoc]);

    expect(devices.map((device) => device.nodeId)).toEqual(['srv-01', '']);
  });
});
