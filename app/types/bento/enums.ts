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
 * ███████████████████████████████████████████████ #types/bento/enums.ts ███████████████████████████████████████████████
 *
 * Enumerations for the bento picks format: the card categories, card variants, and tile footprints.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * An enumeration of the picks/hyperfixation categories a bento card can belong to; drives the category tag's label,
 * icon, and color treatment. Provisional for iteration 1; the final set firms up once real editions are authored.
 * @public
 * @enum
 */
export enum BentoCategory {
  /* Clothing / apparel / gear */
  clothing = 'clothing',

  /* Photos / videos / general media */
  media = 'media',

  /* Restaurants / food / recipes */
  food = 'food',

  /* Songs / albums / artists on repeat */
  music = 'music',

  /* Books / reading */
  book = 'book',

  /* Podcasts / episodes */
  podcast = 'podcast',

  /* Videos / YouTube */
  video = 'video',

  /* Gadgets / tools / tech products + projects */
  tech = 'tech',

  /* Jokes / anything that made me laugh */
  humor = 'humor',

  /* Movies / books / songs / games */
  culture = 'culture',

  /* Quotes worth keeping */
  quotes = 'quotes',

  /* Art / design / visual inspiration */
  art = 'art',

  /* Coding / tools / things I'm building with */
  code = 'code',
}

/**
 * An enumeration of the card variants a bento edition can render; the discriminator on {@link TBentoCard}.
 * @public
 * @enum
 */
export enum BentoCardType {
  /* A picture tile; an image that fills the card, with an optional caption */
  image = 'image',

  /* A pull-quote tile; a short passage with optional attribution */
  quote = 'quote',

  /* An outbound link tile; a titled link with an optional preview image and note */
  link = 'link',

  /* A free-text tile; a short written note with an optional heading */
  text = 'text',

  /* A playable-media tile; an embedded Spotify or YouTube miniplayer with an optional heading and note */
  embed = 'embed',
}

/**
 * An enumeration of the providers an embed tile can render a miniplayer for; drives which iframe URL is built.
 * @public
 * @enum
 */
export enum BentoEmbedProvider {
  /* Spotify tracks, albums, playlists, shows, and podcast episodes */
  spotify = 'spotify',

  /* YouTube videos (rendered via the privacy-preserving nocookie host) */
  youtube = 'youtube',
}

/**
 * An enumeration of the tile footprints on the bento grid; maps to a column/row span at the `lg` breakpoint.
 * @public
 * @enum
 */
export enum BentoCardSize {
  /* 1×1; a single grid cell */
  sm = 'sm',

  /* 2×1; spans two columns */
  wide = 'wide',

  /* 1×2; spans two rows */
  tall = 'tall',

  /* 2×2; the hero tile */
  large = 'large',
}
