# Next Read — Agent operating guide

## Project context

Next Read is a cozy personal librarian for Goodreads TBR lists. It guides readers through a mood-based recommendation flow to overcome decision paralysis.

**Core principles:** Inspect before changing. Make small, safe, incremental changes. Match existing style. No commented-out code, debug logs, or unexplained TODOs. Never weaken correctness to silence type/lint/test errors.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 22 (standalone components, `@angular/build:application`) + Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Backend | Supabase — Postgres, Auth, Storage, Edge Functions (Deno/TypeScript) |
| Testing | Angular unit tests + Jest/Puppeteer e2e (frontend); Deno test (edge functions) |
| Hosting | Cloudflare Pages (frontend static) + Supabase (backend) via GitHub Actions |

## TypeScript / JS rules

- Strict typing throughout. Avoid `any` and non-null `!`.
- Explicit return types on all exported functions.
- Use `type` for shapes; `interface` only when extension/merging is needed.
- No `as` casts to suppress real errors. Use `satisfies` for literal validation.

## Validation

Validate every external boundary before business logic runs: HTTP bodies, query/route params, webhooks, env vars, DB records of unknown shape, LLM/AI output, file uploads.

- `.parse()` at hard boundaries; `.safeParse()` where controlled recovery is needed.
- Validate env vars at startup.
- Treat AI output as untrusted — never pass it to SQL or shell.

## Services / separation of concerns

- One module = one responsibility. Group by feature/domain.
- One-directional dependencies, no cycles.
- Components/handlers orchestrate; services do the work.
- `ApiClient` owns transport only.

## API / backend rules

- One handler = one action.
- Consistent `{ data, error }` success/error shapes.
- Authenticate then authorise the **specific resource** — never trust client-supplied IDs without an ownership check.
- Defer slow work. Don't leak internals in error messages.

## Database & migrations

- Every schema change is a new timestamped migration: `YYYYMMDDHHMMSS_description.sql`.
- Never edit an applied migration.
- UUID PKs. `created_at` / `updated_at` on every table. `jsonb` over `json`.
- Index filter/join/lookup columns.
- **Enable RLS** and filter every query by owner/tenant for user-owned data.
- `seed.sql` is for seed data only — not test fixtures.

## Security

- Never log or return secrets, tokens, or PII.
- Never commit `.env`, keys, or service-account files.
- Parameterised queries only — no string interpolation in SQL.
- Treat LLM output as untrusted: never execute AI-generated SQL or shell commands.
- Sanitise user content against XSS. Least privilege everywhere.

## Testing

- Meaningful assertions — not just `200 OK`.
- Unit tests for logic, validators, and mappers.
- Integration tests for handlers, DB, and auth — **do not mock the DB** where permissions/migrations matter.
- Permission tests for owned data.
- Regression tests for fixed bugs.
- All tests must be deterministic.

## Frontend rules

- Components render + manage view state only. Data and business logic live in services.
- Validate route params. Handle loading / empty / error / success states explicitly.
- Share validation schemas with the backend where possible.
- Accessibility: semantic elements, labels, focus management, colour contrast.

## Error handling

- Fail loud in dev, safe in prod.
- User-safe API error messages.
- Typed errors. Never swallow errors silently.

## Branching & Git workflow

- **Never push directly to `main` or `development`.**
- Branch name: `<type>/<short-description>` — lowercase, hyphens, no random suffixes.
- Allowed types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `migration`, `update`.
- **No agent/tool prefixes** (`claude/`, `ai/`, etc.).
- All PRs target `development` (staging) first; promote `development → main` for production.

## Execution workflow

1. Read `TODO.md` — find the next task and move it to *In Progress*.
2. Pick the smallest safe path. Update tests and docs alongside code.
3. Run formatter / linter / typecheck / tests.
4. Move the task to *Done* in `TODO.md`.

## Design & brand

**Always** read `brand-kit/CLAUDE.md` and `brand-kit/design/brand.md` before any UI change.

- Use tokens from `brand-kit/design/tokens.css` exclusively. Never hardcode hex values.
- Scale official SVG assets from `brand-kit/assets/` — never redraw.
- Dark background: use `assets/logo-dark.svg`.
