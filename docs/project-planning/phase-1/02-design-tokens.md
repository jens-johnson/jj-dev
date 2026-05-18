# Design Tokens

> The single source of truth for all visual decisions in jj-dev. Every value here maps directly to a CSS custom property and a Tailwind config key. No color, size, or font should ever appear in component code that isn't traceable back to this document.

---

## Architecture: How Theming Works

jj-dev has three visual themes — **Day**, **Sunset**, and **Night** — implemented via CSS custom properties scoped to a `data-theme` attribute on the `<html>` element. Tailwind's color keys reference these variables, so a single class like `bg-bg` or `text-accent` automatically reflects the active theme.

```
<html data-theme="day">   → warm cream, earth tones
<html data-theme="sunset"> → deep warm dark, terra rose
<html data-theme="night">  → near-black, sage + sky
```

No duplicate class names. No JS-swapped inline styles. Just a single attribute change.

---

## Semantic Color Tokens

These are the tokens used in components. They describe **purpose**, not appearance.

| Token | CSS Variable | Purpose |
|---|---|---|
| `bg` | `--color-bg` | Page/canvas background |
| `surface` | `--color-surface` | Cards, elevated surfaces, code blocks |
| `border` | `--color-border` | Dividers, outlines, subtle separators |
| `ink` | `--color-ink` | Primary text |
| `ink-muted` | `--color-ink-muted` | Secondary text, nav items |
| `ink-subtle` | `--color-ink-subtle` | Labels, captions, placeholders |
| `accent` | `--color-accent` | Primary brand accent — CTAs, emphasis, active states |
| `accent-secondary` | `--color-accent-secondary` | Supporting accent — tags, highlights, hover states |

### CSS Custom Properties

```css
/* ─── Day (default) ─────────────────────────────── */
:root,
[data-theme='day'] {
  --color-bg:               #F8F4EE;
  --color-surface:          #F0EBE3;
  --color-border:           #DDD0BF;
  --color-ink:              #1C140A;
  --color-ink-muted:        #6B5744;
  --color-ink-subtle:       #A8957E;
  --color-accent:           #8B6534;
  --color-accent-secondary: #5E8C65;
}

/* ─── Sunset ─────────────────────────────────────── */
[data-theme='sunset'] {
  --color-bg:               #140C08;
  --color-surface:          #201208;
  --color-border:           #2C1608;
  --color-ink:              #F0D8C0;
  --color-ink-muted:        #B08060;
  --color-ink-subtle:       #664030;
  --color-accent:           #A84835;
  --color-accent-secondary: #7AAA78;
}

/* ─── Night ──────────────────────────────────────── */
[data-theme='night'] {
  --color-bg:               #080C12;
  --color-surface:          #0E1820;
  --color-border:           #162030;
  --color-ink:              #D0E8F0;
  --color-ink-muted:        #4878A0;
  --color-ink-subtle:       #243850;
  --color-accent:           #60B870;
  --color-accent-secondary: #5080C0;
}
```

---

## Raw Palette (Reference Only)

These are the base color scales. **Do not use these directly in components** — always use semantic tokens above. These exist as a reference and for the raw Tailwind palette definition.

### Stone (Neutrals — warm-toned)
| Step | Hex | Usage |
|---|---|---|
| 50 | `#F8F4EE` | Day bg |
| 100 | `#F0E8DC` | Day surface |
| 200 | `#DDD0BF` | Day border |
| 400 | `#A8957E` | Day ink-subtle |
| 600 | `#6B5744` | Day ink-muted |
| 900 | `#1C140A` | Day ink |

### Earth
| Step | Hex |
|---|---|
| 100 | `#EDE0CC` |
| 300 | `#C8A46E` |
| 500 | `#8B6534` |
| 700 | `#5C3D1A` |
| 900 | `#2E1D0A` |

### Sage
| Step | Hex |
|---|---|
| 100 | `#D4E4D8` |
| 300 | `#9DB8A0` |
| 500 | `#5E8C65` |
| 700 | `#3A6040` |

### Sky
| Step | Hex |
|---|---|
| 100 | `#D6E8F0` |
| 300 | `#8ABDD4` |
| 500 | `#4A8FAD` |

### Terra (Accent)
| Step | Hex |
|---|---|
| 400 | `#D4763B` |
| 600 | `#A84835` |

---

## Typography Tokens

### Font Families

| Token | Family | Fallback | Role |
|---|---|---|---|
| `font-display` | Syne | sans-serif | Display headings, H1, nav logo |
| `font-heading` | Fraunces | Georgia, serif | H2, H3, subheadings |
| `font-body` | Plus Jakarta Sans | system-ui, sans-serif | Body copy, UI labels |
| `font-mono` | Geist Mono | Menlo, monospace | Code blocks, inline code |

### Type Scale

| Token | Size | Line Height | Letter Spacing | Font | Usage |
|---|---|---|---|---|---|
| `text-display` | 6rem (96px) | 1.05 | -0.02em | Syne | Hero headings |
| `text-h1` | 4.5rem (72px) | 1.1 | -0.01em | Syne | Page titles |
| `text-h2` | 3rem (48px) | 1.15 | 0 | Fraunces | Section headings |
| `text-h3` | 2rem (32px) | 1.2 | 0 | Fraunces | Sub-section headings |
| `text-h4` | 1.5rem (24px) | 1.3 | 0 | Syne | Card titles |
| `text-h5` | 1.125rem (18px) | 1.4 | 0 | Plus Jakarta Sans | Small headings |
| `text-body-lg` | 1.25rem (20px) | 1.65 | 0 | Plus Jakarta Sans | Lead paragraphs |
| `text-body` | 1rem (16px) | 1.65 | 0 | Plus Jakarta Sans | Default body |
| `text-body-sm` | 0.875rem (14px) | 1.6 | 0 | Plus Jakarta Sans | Secondary body |
| `text-caption` | 0.75rem (12px) | 1.5 | 0.02em | Plus Jakarta Sans | Labels, captions |

### Font Weights

| Name | Value | Usage |
|---|---|---|
| `font-normal` | 400 | Body copy |
| `font-medium` | 500 | Subheadings, nav items |
| `font-semibold` | 600 | UI labels, buttons |
| `font-bold` | 700 | H2, H3 |
| `font-extrabold` | 800 | Display, H1 (Syne) |

---

## Spacing Scale

Extends Tailwind's default 4px-base spacing. No overrides — purely additive.

| Token | Value | rem |
|---|---|---|
| `spacing-18` | 72px | 4.5rem |
| `spacing-22` | 88px | 5.5rem |
| `spacing-26` | 104px | 6.5rem |
| `spacing-30` | 120px | 7.5rem |

Layout constants:
- **Page max-width**: `1280px` (`max-w-screen-xl`)
- **Content max-width**: `720px` (prose/reading width)
- **Section vertical padding**: `py-20` (80px) desktop, `py-12` (48px) mobile
- **Container horizontal padding**: `px-6` (24px) mobile, `px-10` (40px) tablet, `px-16` (64px) desktop

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-sm` | 4px | Tags, chips, small elements |
| `rounded` | 8px | Buttons, inputs |
| `rounded-md` | 12px | Cards, panels |
| `rounded-lg` | 16px | Large cards |
| `rounded-xl` | 24px | Featured blocks |
| `rounded-2xl` | 32px | Hero sections, large containers |
| `rounded-full` | 9999px | Avatars, pills |

---

## Shadows

Theme-aware — shadows use ink color at low opacity.

| Token | Value | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 3px rgba(28,20,10,0.08)` | Subtle lift (Day), buttons |
| `shadow-md` | `0 4px 12px rgba(28,20,10,0.10)` | Cards, dropdowns |
| `shadow-lg` | `0 12px 32px rgba(28,20,10,0.12)` | Modals, overlays |

> Note: In Sunset/Night themes, shadow opacity should be reduced (elements are already on dark bg). Consider CSS variable shadows: `--shadow-color` per theme.

---

## Transition Tokens

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `duration-fast` | 150ms | `ease-out` | Micro-interactions, hover states |
| `duration-base` | 250ms | `ease-in-out` | Default transitions |
| `duration-slow` | 400ms | `ease-in-out` | Theme toggle, panel open |
| `duration-theme` | 600ms | `cubic-bezier(0.4,0,0.2,1)` | Day/Sunset/Night theme transition |

---

## `tailwind.config.ts` — Full Reference

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,ts,tsx}',
    './components/**/*.{vue,ts,tsx}',
    './content/**/*.md',
  ],
  theme: {
    extend: {
      // ─── Semantic color tokens (theme-aware via CSS vars) ───
      colors: {
        bg:      'var(--color-bg)',
        surface: 'var(--color-surface)',
        border:  'var(--color-border)',
        ink: {
          DEFAULT: 'var(--color-ink)',
          muted:   'var(--color-ink-muted)',
          subtle:  'var(--color-ink-subtle)',
        },
        accent: {
          DEFAULT:   'var(--color-accent)',
          secondary: 'var(--color-accent-secondary)',
        },
        // ─── Raw palette (reference only) ───
        stone: {
          50:  '#F8F4EE',
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

      // ─── Font families ─────────────────────────────────────
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        heading: ['Fraunces', 'Georgia', 'serif'],
        body:    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono:    ['Geist Mono', 'Menlo', 'Courier New', 'monospace'],
      },

      // ─── Type scale ────────────────────────────────────────
      fontSize: {
        'display':  ['6rem',    { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'h1':       ['4.5rem',  { lineHeight: '1.1',  letterSpacing: '-0.01em' }],
        'h2':       ['3rem',    { lineHeight: '1.15', letterSpacing: '0' }],
        'h3':       ['2rem',    { lineHeight: '1.2',  letterSpacing: '0' }],
        'h4':       ['1.5rem',  { lineHeight: '1.3',  letterSpacing: '0' }],
        'h5':       ['1.125rem',{ lineHeight: '1.4',  letterSpacing: '0' }],
        'body-lg':  ['1.25rem', { lineHeight: '1.65', letterSpacing: '0' }],
        'body':     ['1rem',    { lineHeight: '1.65', letterSpacing: '0' }],
        'body-sm':  ['0.875rem',{ lineHeight: '1.6',  letterSpacing: '0' }],
        'caption':  ['0.75rem', { lineHeight: '1.5',  letterSpacing: '0.02em' }],
      },

      // ─── Spacing additions ─────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },

      // ─── Border radius ──────────────────────────────────────
      borderRadius: {
        'sm':  '4px',
        DEFAULT:'8px',
        'md':  '12px',
        'lg':  '16px',
        'xl':  '24px',
        '2xl': '32px',
      },

      // ─── Transitions ────────────────────────────────────────
      transitionDuration: {
        'fast':  '150ms',
        DEFAULT: '250ms',
        'slow':  '400ms',
        'theme': '600ms',
      },

      // ─── Max widths ─────────────────────────────────────────
      maxWidth: {
        'prose': '720px',
        'content': '1280px',
      },
    },
  },
  plugins: [],
} satisfies Config
```

---

## Usage in Components

```vue
<!-- ✅ Correct — uses semantic tokens, theme-aware -->
<div class="bg-bg text-ink border border-border rounded-md">
  <h1 class="font-display text-h1 text-ink">Hello</h1>
  <p class="font-body text-body text-ink-muted">Body copy</p>
  <button class="bg-accent text-bg font-semibold rounded px-6 py-3">
    CTA
  </button>
</div>

<!-- ❌ Incorrect — hardcoded color, breaks on theme change -->
<div class="bg-[#F8F4EE] text-[#1C140A]">...</div>
```

---

_Last updated: 2026-05-16 — Phase 1 design token finalization_
