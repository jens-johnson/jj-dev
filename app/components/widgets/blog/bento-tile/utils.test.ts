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
 * █████████████████████████████████ #components/widgets/blog/bento-tile/utils.test.ts █████████████████████████████████
 *
 * Unit tests for the bento tile embed-URL helpers.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import { describe, expect, it } from 'vitest';

import { embedSrc, spotifyEmbedSrc, youtubeEmbedSrc } from './utils';

/** The expected Spotify track embed URL, reused across the dispatch cases. */
const SPOTIFY_TRACK_EMBED = 'https://open.spotify.com/embed/track/4t7S2wX7D5SonTHLE5OfIZ';

/** The expected YouTube (nocookie) embed URL for the shared sample video id, reused across the id-extraction cases. */
const YOUTUBE_EMBED = 'https://www.youtube-nocookie.com/embed/tL9Lw250spc';

describe('spotifyEmbedSrc', () => {
  it('builds the embed URL for a track share link, dropping the query string', () => {
    expect(spotifyEmbedSrc('https://open.spotify.com/track/4t7S2wX7D5SonTHLE5OfIZ?si=def5af424c2347a5')).toBe(
      SPOTIFY_TRACK_EMBED,
    );
  });

  it('builds the embed URL for a podcast episode share link', () => {
    expect(spotifyEmbedSrc('https://open.spotify.com/episode/2CxY7DI1ChqKn8MHDZ5cpD?si=4a4a256769ec4f52')).toBe(
      'https://open.spotify.com/embed/episode/2CxY7DI1ChqKn8MHDZ5cpD',
    );
  });

  it('tolerates the intl locale segment', () => {
    expect(spotifyEmbedSrc('https://open.spotify.com/intl-de/album/1abcDEF234ghiJKL567mno')).toBe(
      'https://open.spotify.com/embed/album/1abcDEF234ghiJKL567mno',
    );
  });

  it('returns null for a non-Spotify URL', () => {
    expect(spotifyEmbedSrc('https://example.com/track/nope')).toBeNull();
  });
});

describe('youtubeEmbedSrc', () => {
  it('extracts the id from a watch URL and uses the nocookie host', () => {
    expect(youtubeEmbedSrc('https://www.youtube.com/watch?v=tL9Lw250spc')).toBe(YOUTUBE_EMBED);
  });

  it('extracts the id from a youtu.be short link', () => {
    expect(youtubeEmbedSrc('https://youtu.be/tL9Lw250spc?t=42')).toBe(YOUTUBE_EMBED);
  });

  it('extracts the id from a shorts URL', () => {
    expect(youtubeEmbedSrc('https://youtube.com/shorts/tL9Lw250spc')).toBe(YOUTUBE_EMBED);
  });

  it('returns null when no video id is present', () => {
    expect(youtubeEmbedSrc('https://www.youtube.com/results?search_query=cats')).toBeNull();
  });
});

describe('embedSrc', () => {
  it('dispatches to the Spotify builder', () => {
    expect(embedSrc('spotify', 'https://open.spotify.com/track/4t7S2wX7D5SonTHLE5OfIZ')).toBe(SPOTIFY_TRACK_EMBED);
  });

  it('dispatches to the YouTube builder', () => {
    expect(embedSrc('youtube', 'https://www.youtube.com/watch?v=tL9Lw250spc')).toBe(YOUTUBE_EMBED);
  });

  it('returns null for an unknown provider', () => {
    expect(embedSrc('vimeo', 'https://vimeo.com/12345')).toBeNull();
  });
});
