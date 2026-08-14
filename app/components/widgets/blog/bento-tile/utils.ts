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
 * ███████████████████████████████████ #components/widgets/blog/bento-tile/utils.ts ████████████████████████████████████
 *
 * Pure helpers for the bento tile: parse Spotify and YouTube share URLs into their iframe embed sources.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * The Spotify content types the embed player supports; extracted from a share URL to build the embed path.
 * @internal
 * @constant
 */
const SPOTIFY_TYPES = ['track', 'episode', 'album', 'playlist', 'show', 'artist'] as const;

/**
 * Matches a Spotify share URL, capturing the content type and id. Tolerates the optional `intl-xx/` locale segment
 * Spotify inserts (e.g. `open.spotify.com/intl-de/track/…`).
 * @internal
 * @constant
 */
const SPOTIFY_URL = new RegExp(`open\\.spotify\\.com/(?:intl-[a-z]+/)?(${SPOTIFY_TYPES.join('|')})/([A-Za-z0-9]+)`);

/**
 * The patterns a YouTube video id can appear in across watch, short-link, embed, and shorts URLs.
 * @internal
 * @constant
 */
const YOUTUBE_PATTERNS = [
  /[?&]v=([A-Za-z0-9_-]{11})/,
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
  /youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
];

/**
 * Builds the Spotify iframe embed URL for a share link. Returns null when the URL is not a recognizable Spotify link.
 * @public
 * @function
 * @param url - A Spotify share URL (track, episode, album, playlist, show, or artist)
 * @returns The `open.spotify.com/embed/...` URL, or null when unparseable
 */
export function spotifyEmbedSrc(url: string): string | null {
  const match = url.match(SPOTIFY_URL);
  if (!match) {
    return null;
  }
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
}

/**
 * Builds the YouTube (privacy-preserving nocookie host) iframe embed URL for a video link. Returns null when no
 * 11-character video id can be found.
 * @public
 * @function
 * @param url - A YouTube URL (watch, youtu.be, embed, or shorts)
 * @returns The `youtube-nocookie.com/embed/...` URL, or null when unparseable
 */
export function youtubeEmbedSrc(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}`;
    }
  }
  return null;
}

/**
 * Resolves an embed card's share URL to the provider's iframe src. Returns null when the provider is unknown or the
 * URL can't be parsed, letting the tile fall back to a plain outbound link.
 * @public
 * @function
 * @param provider - The embed provider (`spotify` | `youtube`), or any raw content value
 * @param url - The original share URL
 * @returns The iframe embed src, or null when it can't be built
 */
export function embedSrc(provider: string, url: string): string | null {
  if (provider === 'spotify') {
    return spotifyEmbedSrc(url);
  }
  if (provider === 'youtube') {
    return youtubeEmbedSrc(url);
  }
  return null;
}
