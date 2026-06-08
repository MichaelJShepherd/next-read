# Next Read — Brand Kit rules for agents

Read this file before any UI change. Full details are in `design/brand.md`.

## Non-negotiables

- **Never hardcode hex values.** Always reference a token from `design/tokens.css`.
- **Never redraw the logo.** Scale `assets/logo.svg` (light) or `assets/logo-dark.svg` (dark).
- **Never use font-weight 700+.** Maximum is 600 (semibold), headings only.
- **Never use a colour outside the token set** — including for dark mode (invert the neutral scale, don't invent new values).

## Token files

| File | Purpose |
|---|---|
| `design/tokens.css` | Authoritative CSS custom properties — import or copy into `styles.css` |
| `design/tokens.ts` | TypeScript mirror for JS logic and Tailwind `@theme` config |

When adding a Tailwind `@theme {}` block in `frontend/src/styles.css`, mirror every token from `tokens.ts` — do not invent Tailwind colour names that don't exist here.

## Colour rules

- Primary action: `--color-green-500` (`#2d8a56`). Hover: `--color-green-600`.
- Dark mode primary action: `--color-green-400` (`#4ade80`).
- Amber is the accent/"live" colour — reserve it for star ratings only. Don't spread it through the UI.
- For green text on white, use `green-700` to meet WCAG AA.

## Typography rules

- Display headings (hero, section headers, results): `DM Serif Display`, weight 400.
- Everything else: `Inter`, weights 400/500/600 only.
- Type scale tokens (size / weight / line-height) are defined in `design/brand.md`.

## Component quick-reference

- **Button heights:** 48px. **Chip/input heights:** 44–48px.
- **Button radius:** `radius-md` (12px). **Card radius:** `radius-lg` (16px).
- **Card resting shadow:** `shadow-sm`. **Card hover shadow:** `shadow-md`.
- **Input focus ring:** `green-500` border + `0 0 0 3px green-100` box-shadow.
- **Selected chip:** `green-50` bg / `green-500` border / `green-700` text.

## Motion rules

- Micro (button/toggle): 150ms ease-out
- Transition (screen/card): 250ms ease-in-out
- Entrance (page load): 300ms ease-out
- Always wrap animations in `@media (prefers-reduced-motion: no-preference)` OR rely on the `0ms` override already in `tokens.css`.

## Accessibility

- Tap targets ≥ 44×44px on mobile.
- Focus ring: `green-500` outline on all interactive elements.
- ARIA labels on every icon button, chip, and card action.
- Support 200% text zoom without breakage.
