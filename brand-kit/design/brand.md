# Next Read — Brand Reference

## Identity

**Product name:** `next read` in the wordmark (always lowercase). "Next Read" in prose and documentation.

**Tagline:** Your cozy librarian

**Positioning:** A cozy personal librarian for your Goodreads TBR. Helps readers overcome decision paralysis through a short, mood-based recommendation flow.

---

## Logo

An open book with a leaf sprouting from the spine. The leaf = fresh starts and growth. The open book = possibility and choice.

| Asset | Usage |
|---|---|
| `assets/logo.svg` | Light backgrounds |
| `assets/logo-dark.svg` | Dark backgrounds (brightened greens + light wordmark) |

**Rules:**
- Minimum size: 32px icon height, 120px full lockup width
- Clear space: equal to the leaf height on all sides
- Never rotate, stretch, or recolor outside the palette
- Always scale the SVG assets — never redraw

---

## Colour

Green is the core brand colour. Warm neutrals keep it cozy, not clinical.

### Primary — Green

| Token | Hex | Usage |
|---|---|---|
| `--color-green-50` | `#f0fdf4` | Tinted backgrounds |
| `--color-green-100` | `#dcfce7` | Selected option background |
| `--color-green-200` | `#bbf7d0` | Light borders |
| `--color-green-300` | `#86efac` | Secondary accents |
| `--color-green-400` | `#4ade80` | Icons on dark backgrounds; primary action in dark mode |
| `--color-green-500` | `#2d8a56` | **Primary brand colour** — buttons, active states |
| `--color-green-600` | `#1a6b3c` | Hover state |
| `--color-green-700` | `#15803d` | Green text (meets WCAG AA on white) |
| `--color-green-800` | `#166534` | Dark accents |
| `--color-green-900` | `#14532d` | Darkest green |

### Neutrals

| Token | Hex | Usage |
|---|---|---|
| `--color-neutral-0` | `#ffffff` | Page background (light mode) |
| `--color-neutral-50` | `#fafafa` | Card surface |
| `--color-neutral-100` | `#f5f5f5` | Dividers |
| `--color-neutral-200` | `#e5e5e5` | Borders |
| `--color-neutral-300` | `#d4d4d4` | — |
| `--color-neutral-400` | `#a3a3a3` | Placeholder text |
| `--color-neutral-500` | `#737373` | Secondary text |
| `--color-neutral-600` | `#525252` | Body text |
| `--color-neutral-700` | `#404040` | Primary text |
| `--color-neutral-800` | `#262626` | Headings |
| `--color-neutral-900` | `#171717` | Page background (dark mode) |

### Warm accents

| Token | Hex | Usage |
|---|---|---|
| `--color-cream` | `#fefcf3` | Alternative light background |
| `--color-warm-gray` | `#f7f5f0` | Warm surface alternative |
| `--color-amber-400` | `#fbbf24` | Warm accent (rating stars, highlights) — use sparingly |
| `--color-amber-500` | `#f59e0b` | Warning + amber hover |

> Amber is the accent/"live" colour. Reserve it for a single narrow purpose (e.g. star ratings). Do not spread it through the UI.

### Semantic

| Token | Hex |
|---|---|
| `--color-success` | `#2d8a56` |
| `--color-warning` | `#f59e0b` |
| `--color-error` | `#ef4444` |
| `--color-info` | `#3b82f6` |

### Dark mode

Same green primary, inverted neutral scale. Primary action colour shifts to `green-400` (`#4ade80`) for contrast on dark surfaces. Never hardcode dark-mode hex values — use the inverted token scale and rely on `@media (prefers-color-scheme: dark)` in `tokens.css`.

---

## Typography

### Fonts

| Role | Family | Fallback | Google Fonts |
|---|---|---|---|
| Display / headings | DM Serif Display | Georgia, serif | `family=DM+Serif+Display` |
| UI / body | Inter | system-ui, sans-serif | `family=Inter:wght@400;500;600` |

No monospace font is used in the product UI (only in the brand guide itself).

### Type scale

| Token | Size | Weight | Line-height | Letter-spacing | Font | Usage |
|---|---|---|---|---|---|---|
| `display-lg` | 32px | 400 | 1.2 | — | DM Serif Display | Landing hero |
| `display-md` | 24px | 400 | 1.3 | — | DM Serif Display | Section headings, results |
| `heading-lg` | 20px | 600 | 1.3 | — | Inter | Card group headers |
| `heading-md` | 18px | 600 | 1.4 | — | Inter | Book title in card |
| `body-lg` | 16px | 400 | 1.6 | — | Inter | Default body |
| `body-md` | 14px | 400 | 1.5 | — | Inter | Secondary info, labels |
| `body-sm` | 12px | 400 | 1.5 | — | Inter | Metadata, timestamps |
| `overline` | 12px | 500 | — | 0.05em | Inter | Uppercase labels (`green-600`) |

### Font weights

Only three weights. **Never use 700 / bold** — the app should feel light.

- `400` Regular — body text, descriptions
- `500` Medium — labels, buttons, navigation
- `600` Semibold — headings only

---

## Spacing

4px base unit, 8px grid. No magic numbers outside this scale.

| Token | Value |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |

---

## Shape

### Border radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 6px | Tags, badges, small chips |
| `--radius-md` | 12px | Buttons, inputs, cards |
| `--radius-lg` | 16px | Large cards, modals |
| `--radius-xl` | 24px | Bottom sheets, large surfaces |
| `--radius-full` | 9999px | Pills, avatars |

### Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Default card resting state |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Card hover, elevated surface |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals, bottom sheets |

---

## Layout

- **Mobile-first.** Primary design target is 0–639px.
- **Max content width: 480px** — keeps reading flow comfortable on all phones.
- Breakpoints: tablet 640px+, desktop 1024px+.

---

## Components

### Buttons

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| `primary` | `green-500` | `#ffffff` | none | `green-600` bg |
| `secondary` | transparent | `green-600` | 1.5px `green-500` | `green-50` bg |
| `ghost` | transparent | `neutral-600` | none | `neutral-100` bg |

Height: 48px. Padding: 0 24px. Radius: `radius-md`. Font: 14px / 500.

### Quiz option chips

Height: 44px. Padding: 0 20px. Radius: `radius-md`. Font: 14px / 400.

- Default: `neutral-50` bg, `neutral-200` border, `neutral-700` text
- Hover: `green-50` bg, `green-200` border
- Selected: `green-50` bg, `green-500` border, `green-700` text / 500

### Inputs

Height: 48px. Padding: 0 16px. Radius: `radius-md`. Border: 1.5px `neutral-200`.

- Focus: `green-500` border, `0 0 0 3px green-100` box-shadow
- Placeholder: `neutral-400`

### Book card

Cover: 72×108px, `radius-md`. Resting: `shadow-sm`. Hover: `shadow-md` (250ms).

- Title: 16px / 600 / `neutral-800`
- Author: 13px / 400 / `neutral-500`
- Meta (pages, rating, genre): 12px / 400 / `neutral-400`

---

## Motion

Subtle and purposeful. The app should feel calm, not bouncy.

| Pattern | Duration | Easing | Usage |
|---|---|---|---|
| Micro-interaction | 150ms | ease-out | Button press, toggle |
| Transition | 250ms | ease-in-out | Screen transitions, card expand |
| Entrance | 300ms | ease-out | Page load, results appear |
| Spinner | 2–4s | decelerate | Roulette spin animation |

**Always respect `prefers-reduced-motion`.** Replace all animations with instant state changes (`tokens.css` sets durations to `0ms` automatically).

---

## Voice & Tone

A cozy, knowledgeable librarian — friendly, warm, and gently decisive.

**Do:**
- Use conversational, warm language
- Be encouraging ("Great choice!")
- Keep it brief — one thought per screen
- Use sentence case throughout

**Don't:**
- Sound robotic or clinical
- Use jargon or technical language
- Be overly enthusiastic or exclamatory
- Use passive voice

---

## Accessibility

| Rule | Requirement |
|---|---|
| Colour contrast | WCAG AA minimum. Use `green-700` for small green text on white |
| Tap targets | Minimum 44×44px on mobile |
| Focus indicators | Visible ring using `green-500` outline |
| Screen readers | All interactive elements labeled with ARIA |
| Reduced motion | `prefers-reduced-motion` respected |
| Font scaling | Support 200% text zoom without layout breakage |
