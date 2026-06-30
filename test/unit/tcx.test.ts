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
 * ███████████████████████████████████████████████ test/unit/tcx.test.ts ███████████████████████████████████████████████
 *
 * Unit tests for the TCX builder; asserts the linear altitude ramp, distance scaling/fallback, and per-trackpoint
 * heart-rate and cadence passthrough.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { describe, expect, it } from 'vitest';

import { buildTcx, type ITcxSourceActivity, type TTcxStreams } from '../../server/utils/tcx';

/* ─── Fixtures ────────────────────────────────────────────────────────────────────────────────────────────────────── */

const activity: ITcxSourceActivity = {
  start_date: '2026-03-10T02:11:09.000Z',
  elapsed_time: 100,
  distance: 1000,
};

/** Pulls the numeric contents of every `<Tag>…</Tag>` occurrence from a TCX string. */
function readTags(tcx: string, tag: string): number[] {
  return [...tcx.matchAll(new RegExp(`<${tag}>([\\d.]+)</${tag}>`, 'g'))].map((match) => Number(match[1]));
}

/* ─── Tests ───────────────────────────────────────────────────────────────────────────────────────────────────────── */

describe('buildTcx', () => {
  it('ramps altitude linearly from zero to the target gain in metres', () => {
    const streams: TTcxStreams = { time: { data: [0, 50, 100] }, distance: { data: [0, 500, 1000] } };

    // 100 ft → 30.48 m, distributed across time fractions 0, 0.5, 1.
    expect(readTags(buildTcx(activity, streams, 100), 'AltitudeMeters')).toEqual([0, 15.24, 30.48]);
  });

  it('preserves the source distance and elapsed time on the lap totals', () => {
    const tcx = buildTcx(activity, { time: { data: [0, 100] }, distance: { data: [0, 1000] } }, 50);

    expect(tcx).toContain('<TotalTimeSeconds>100</TotalTimeSeconds>');
    expect(tcx).toContain('<DistanceMeters>1000</DistanceMeters>');
  });

  it('carries heart-rate and cadence through when the streams are present', () => {
    const tcx = buildTcx(
      activity,
      { time: { data: [0, 100] }, heartrate: { data: [120, 140] }, cadence: { data: [80, 82] } },
      0,
    );

    expect(tcx).toContain('<HeartRateBpm><Value>120</Value></HeartRateBpm>');
    expect(tcx).toContain('<Cadence>80</Cadence>');
  });

  it('omits heart-rate and cadence when those streams are absent', () => {
    const tcx = buildTcx(activity, { time: { data: [0, 100] } }, 0);

    expect(tcx).not.toContain('HeartRateBpm');
    expect(tcx).not.toContain('<Cadence>');
  });

  it('scales the distance stream to the activity total', () => {
    // Raw stream ends at 2000 but the activity is 1000 m, so values are halved.
    const tcx = buildTcx(activity, { time: { data: [0, 50, 100] }, distance: { data: [0, 1000, 2000] } }, 0);

    expect(readTags(tcx, 'DistanceMeters')).toEqual([1000, 0, 500, 1000]);
  });

  it('falls back to interpolated distance when no distance stream is present', () => {
    const tcx = buildTcx(activity, { time: { data: [0, 50, 100] } }, 0);

    // Lap total (1000) first, then trackpoints interpolated from the time fractions.
    expect(readTags(tcx, 'DistanceMeters')).toEqual([1000, 0, 500, 1000]);
  });

  it('escapes XML metacharacters in the description', () => {
    const tcx = buildTcx({ ...activity, description: 'A & B <tag>' }, { time: { data: [0, 100] } }, 0);

    expect(tcx).toContain('<Notes>A &amp; B &lt;tag&gt;</Notes>');
  });

  it('emits a well-formed TCX root with the running sport type', () => {
    const tcx = buildTcx(activity, { time: { data: [0, 100] } }, 0);

    expect(tcx.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(tcx).toContain('<Activity Sport="Running">');
    expect(tcx.endsWith('</TrainingCenterDatabase>')).toBe(true);
  });

  // Strava only honours uploaded altitude when the device name signals a barometric altimeter.
  // Dropping "barometer" makes Strava recompute elevation to 0 for a no-GPS treadmill run.
  it('names the device with "barometer" so Strava honours the injected elevation', () => {
    const tcx = buildTcx(activity, { time: { data: [0, 100] } }, 500);

    expect(tcx).toMatch(/<Name>[^<]*barometer[^<]*<\/Name>/i);
  });
});
