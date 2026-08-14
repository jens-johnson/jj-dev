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
 * ███████████████████████████████████████████████ #types/bento/types.ts ███████████████████████████████████████████████
 *
 * Shared TypeScript shapes for the bento picks format: the per-variant card interfaces, their discriminated union, and
 * the edition shape. A structural mirror of the bento content collection frontmatter.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { BentoCardSize, BentoCardType, BentoCategory, BentoEmbedProvider } from './enums';

/**
 * A type representing a pick/hyperfixation category; one of {@link BentoCategory}, or any raw string from content
 * (unknown values fall back to a neutral tag).
 * @public
 */
export type TBentoCategory = `${BentoCategory}`;

/**
 * A type representing a bento card variant; one of {@link BentoCardType}.
 * @public
 */
export type TBentoCardType = `${BentoCardType}`;

/**
 * A type representing a bento tile footprint; one of {@link BentoCardSize}.
 * @public
 */
export type TBentoCardSize = `${BentoCardSize}`;

/**
 * A type representing an embed miniplayer provider; one of {@link BentoEmbedProvider}.
 * @public
 */
export type TBentoEmbedProvider = `${BentoEmbedProvider}`;

/**
 * The fields shared by every bento card variant; the common frontmatter each tile carries regardless of `type`.
 * @public
 * @interface
 */
export interface IBentoCardBase {
  /* The category this pick belongs to; drives the tag. A known {@link TBentoCategory} or a raw content string */
  category: TBentoCategory | string;

  /* The tile footprint on the grid; defaults per variant when omitted in content */
  size?: TBentoCardSize | string;

  /* An optional free-form tag list for the tile */
  tags?: string[];
}

/**
 * A picture tile; an image that fills the card with an optional caption and outbound link.
 * @public
 * @interface
 */
export interface IBentoImageCard extends IBentoCardBase {
  /* The card variant discriminator */
  type: 'image';

  /* The image source (a `/public` path or absolute URL) */
  src: string;

  /* The image alt text */
  alt: string;

  /* An optional caption rendered over the image */
  caption?: string;

  /* An optional outbound link the whole tile points to */
  href?: string;
}

/**
 * A pull-quote tile; a short passage with optional attribution.
 * @public
 * @interface
 */
export interface IBentoQuoteCard extends IBentoCardBase {
  /* The card variant discriminator */
  type: 'quote';

  /* The quote body */
  text: string;

  /* An optional attribution line (author, source) */
  attribution?: string;

  /* An optional outbound link (e.g. to the source) */
  href?: string;
}

/**
 * An outbound link tile; a titled link with an optional preview image and note.
 * @public
 * @interface
 */
export interface IBentoLinkCard extends IBentoCardBase {
  /* The card variant discriminator */
  type: 'link';

  /* The link title */
  title: string;

  /* The outbound URL the tile points to */
  href: string;

  /* An optional one-line note on why it's here */
  note?: string;

  /* An optional preview image source */
  src?: string;

  /* The preview image alt text (required when `src` is set) */
  alt?: string;
}

/**
 * A free-text tile; a short written note with an optional heading and outbound link.
 * @public
 * @interface
 */
export interface IBentoTextCard extends IBentoCardBase {
  /* The card variant discriminator */
  type: 'text';

  /* An optional heading above the body */
  title?: string;

  /* The note body */
  body: string;

  /* An optional outbound link the whole tile points to */
  href?: string;
}

/**
 * A playable-media tile; an embedded Spotify or YouTube miniplayer with an optional heading and note.
 * @public
 * @interface
 */
export interface IBentoEmbedCard extends IBentoCardBase {
  /* The card variant discriminator */
  type: 'embed';

  /* The miniplayer provider; drives which iframe URL is built from `url` */
  provider: TBentoEmbedProvider | string;

  /* The original share URL (a Spotify or YouTube link); parsed into the provider's embed URL */
  url: string;

  /* An optional heading above the player */
  title?: string;

  /* An optional one-line note on why it's here */
  note?: string;
}

/**
 * A type representing a single bento tile; the discriminated union across every card variant, keyed on `type`.
 * @public
 */
export type TBentoCard = IBentoImageCard | IBentoQuoteCard | IBentoLinkCard | IBentoTextCard | IBentoEmbedCard;

/**
 * An interface representing one bento edition; a single "picks / hyperfixations" post and its grid of tiles. A
 * structural mirror of the `bento` content collection frontmatter, narrow enough that queried docs satisfy it.
 * @public
 * @interface
 */
export interface IBentoEdition {
  /* The edition title, e.g. "This Month's Hyperfixations" */
  title: string;

  /* An optional short blurb rendered under the title */
  description?: string;

  /* An optional human label for the edition, e.g. "August 2026" */
  edition?: string;

  /* The publish date (ISO `YYYY-MM-DD`) */
  publishedAt?: string;

  /* The tiles making up the grid */
  cards: TBentoCard[];

  /* The content route (e.g. /picks/2026-08-hyperfixations) when sourced from @nuxt/content */
  path?: string;
}
