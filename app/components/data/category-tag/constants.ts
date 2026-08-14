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
 * The visual treatment (label, icon, and Tailwind color classes) for each known pick category; categories missing
 * from this lookup render as a neutral tag showing the capitalized raw value.
 * @public
 * @constant
 */
export const TAG_VISUAL_BY_CATEGORY: Record<string, ICategoryTagVisual> = {
  clothing: {
    label: 'Clothing',
    icon: 'lucide:shirt',
    cls: 'bg-terra-400/12 text-terra-600',
  },
  media: {
    label: 'Media',
    icon: 'lucide:image',
    cls: 'bg-sky-300/15 text-sky-500',
  },
  food: {
    label: 'Food',
    icon: 'lucide:utensils',
    cls: 'bg-earth-300/20 text-earth-500',
  },
  music: {
    label: 'Music',
    icon: 'lucide:music',
    cls: 'bg-sky-300/15 text-sky-500',
  },
  book: {
    label: 'Book',
    icon: 'lucide:book-open',
    cls: 'bg-earth-300/20 text-earth-500',
  },
  podcast: {
    label: 'Podcast',
    icon: 'lucide:mic',
    cls: 'bg-sage-300/20 text-sage-500',
  },
  video: {
    label: 'Video',
    icon: 'lucide:play',
    cls: 'bg-terra-400/12 text-terra-600',
  },
  tech: {
    label: 'Tech',
    icon: 'lucide:cpu',
    cls: 'bg-accent/10 text-accent',
  },
  humor: {
    label: 'Joke',
    icon: 'lucide:laugh',
    cls: 'bg-terra-400/12 text-terra-600',
  },
  culture: {
    label: 'Culture',
    icon: 'lucide:clapperboard',
    cls: 'bg-accent/10 text-accent',
  },
  quotes: {
    label: 'Quote',
    icon: 'lucide:quote',
    cls: 'bg-sage-300/20 text-sage-500',
  },
  art: {
    label: 'Art',
    icon: 'lucide:palette',
    cls: 'bg-terra-400/12 text-terra-600',
  },
  code: {
    label: 'Code',
    icon: 'lucide:code-xml',
    cls: 'bg-sage-300/20 text-sage-500',
  },
};
