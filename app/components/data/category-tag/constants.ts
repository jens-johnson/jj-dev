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
 * ████████████████████████████████████ #components/data/category-tag/constants.ts █████████████████████████████████████
 *
 * Constants for the category tag component: the category-to-visual-treatment lookup.
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

import type { ICategoryTagVisual } from './types';

/**
 * The visual treatment (label + leading-dot color) for each known pick category; categories missing from this lookup
 * render as a neutral tag showing the capitalized raw value with a muted dot.
 * @public
 * @constant
 */
export const TAG_VISUAL_BY_CATEGORY: Record<string, ICategoryTagVisual> = {
  clothing: { label: 'Clothing', dot: 'bg-terra-600' },
  media: { label: 'Media', dot: 'bg-sky-500' },
  food: { label: 'Food', dot: 'bg-terra-400' },
  music: { label: 'Song', dot: 'bg-sky-500' },
  book: { label: 'Book', dot: 'bg-earth-500' },
  podcast: { label: 'Podcast', dot: 'bg-sage-500' },
  video: { label: 'Video', dot: 'bg-terra-600' },
  tech: { label: 'Tech', dot: 'bg-accent' },
  humor: { label: 'Joke', dot: 'bg-earth-300' },
  culture: { label: 'Culture', dot: 'bg-accent' },
  quotes: { label: 'Quote', dot: 'bg-sage-500' },
  art: { label: 'Art', dot: 'bg-terra-600' },
  code: { label: 'Code', dot: 'bg-sage-500' },
};
