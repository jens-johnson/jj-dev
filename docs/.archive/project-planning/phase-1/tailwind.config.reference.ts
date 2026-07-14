// ─── tailwind.config.ts ──────────────────────────────────────────────────────
// Design token system for jj-dev. Semantic color tokens reference CSS custom
// properties defined per-theme in assets/css/main.css. Raw palette values are
// provided as reference only; never use them directly in components.
//
// Themes: Day (default) | Sunset | Night
// Usage:  <html data-theme="day|sunset|night">
//
// See: docs/project-planning/phase-1/02-design-tokens.md

import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{vue,ts,tsx}', './components/**/*.{vue,ts,tsx}', './content/**/*.md'],

  theme: {
    extend: {
      // ─── Semantic color tokens (theme-aware via CSS vars) ─────────────────
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        ink: {
          DEFAULT: 'var(--color-ink)',
          muted: 'var(--color-ink-muted)',
          subtle: 'var(--color-ink-subtle)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          secondary: 'var(--color-accent-secondary)',
        },

        // ─── Raw palette (reference only; do not use in components) ────────
        stone: {
          50: '#F8F4EE',
          100: '#F0E8DC',
          200: '#DDD0BF',
          400: '#A8957E',
          600: '#6B5744',
          900: '#1C140A',
        },
        earth: {
          100: '#EDE0CC',
          300: '#C8A46E',
          500: '#8B6534',
          700: '#5C3D1A',
          900: '#2E1D0A',
        },
        sage: {
          100: '#D4E4D8',
          300: '#9DB8A0',
          500: '#5E8C65',
          700: '#3A6040',
        },
        sky: {
          100: '#D6E8F0',
          300: '#8ABDD4',
          500: '#4A8FAD',
        },
        terra: {
          400: '#D4763B',
          600: '#A84835',
        },
      },

      // ─── Font families ────────────────────────────────────────────────────
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        heading: ['Fraunces', 'Georgia', 'serif'],
        body: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'Menlo', 'Courier New', 'monospace'],
      },

      // ─── Type scale ───────────────────────────────────────────────────────
      fontSize: {
        display: [
          '6rem',
          {
            lineHeight: '1.05',
            letterSpacing: '-0.02em',
          },
        ],
        h1: [
          '4.5rem',
          {
            lineHeight: '1.1',
            letterSpacing: '-0.01em',
          },
        ],
        h2: [
          '3rem',
          {
            lineHeight: '1.15',
            letterSpacing: '0',
          },
        ],
        h3: [
          '2rem',
          {
            lineHeight: '1.2',
            letterSpacing: '0',
          },
        ],
        h4: [
          '1.5rem',
          {
            lineHeight: '1.3',
            letterSpacing: '0',
          },
        ],
        h5: [
          '1.125rem',
          {
            lineHeight: '1.4',
            letterSpacing: '0',
          },
        ],
        'body-lg': [
          '1.25rem',
          {
            lineHeight: '1.65',
            letterSpacing: '0',
          },
        ],
        body: [
          '1rem',
          {
            lineHeight: '1.65',
            letterSpacing: '0',
          },
        ],
        'body-sm': [
          '0.875rem',
          {
            lineHeight: '1.6',
            letterSpacing: '0',
          },
        ],
        caption: [
          '0.75rem',
          {
            lineHeight: '1.5',
            letterSpacing: '0.02em',
          },
        ],
      },

      // ─── Spacing additions ────────────────────────────────────────────────
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
      },

      // ─── Border radius ────────────────────────────────────────────────────
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },

      // ─── Transitions ──────────────────────────────────────────────────────
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '250ms',
        slow: '400ms',
        theme: '600ms',
      },

      // ─── Max widths ───────────────────────────────────────────────────────
      maxWidth: {
        prose: '720px',
        content: '1280px',
      },
    },
  },

  plugins: [],
} satisfies Config;
