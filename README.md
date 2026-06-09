# next read

> Your cozy librarian — a mood-based book recommender for your Goodreads TBR.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 22 (standalone) + Tailwind CSS v4 |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions) |
| Hosting | Cloudflare Pages (frontend) + Supabase (backend) |
| CI/CD | GitHub Actions |

## How it works

The core loop is **import → quiz → results → select**:

1. **Import** — the user pastes a Goodreads profile URL. The `import-goodreads` edge function reads their public "Want to Read" shelf via the Goodreads **RSS feed** (the authenticated HTML shelf is not used) and returns the books, with a 24h scrape cache. The imported list is stored in the browser's **`localStorage`**, not the database.
2. **Quiz** — a short 3-step mood/commitment/avoidance quiz.
3. **Scoring** — a rules-based engine runs **client-side** (`quiz.service.ts`) and ranks the TBR; the top 3–5 are shown as cards.
4. **Details** — tapping a card fetches its synopsis and genres on demand from **Open Library** (cached in memory + `localStorage`).
5. **Select** — the user confirms a book.

**Anonymous tracking:** every visitor gets a persisted **anonymous Supabase session**. Each recommendation (quiz answers + the books shown) and the final selection are written to the `recommendations` table under RLS. This requires **anonymous sign-ins to be enabled** on the Supabase project (`enable_anonymous_sign_ins` — set locally in `config.toml`; enable it per environment on the hosted projects).

> Note: the `recommend` edge function is currently a stub — scoring lives in the frontend. See `TODO.md` task 17.

## Local development

### Prerequisites

- Node 22+, npm 11+
- Deno 2.x
- Supabase CLI (`npm i -g supabase`)

### Frontend

```bash
cd frontend
npm install
npm start          # serves on http://localhost:4200
```

### Backend

```bash
# Start the local Supabase stack (Postgres, Auth, Studio, Edge Runtime)
supabase start

# Apply migrations
supabase db reset

# Run edge functions locally
supabase functions serve
```

## Environment variables

The frontend reads its Supabase connection details from `src/environments/`:

| Variable | File | Description |
|---|---|---|
| `supabaseUrl` | `environment.ts` / `environment.production.ts` | Supabase project REST URL |
| `supabaseAnonKey` | `environment.ts` / `environment.production.ts` | Supabase anon (public) key |

Fill in the values for staging and production. **Never commit service-role keys — anon key only in the frontend.**

Edge function secrets are set per-environment in GitHub → Settings → Environments → Secrets, and pushed via `supabase secrets set` in `deploy-backend.yml`.

## Running tests

```bash
# Frontend unit tests
cd frontend && npm test

# Frontend e2e (headless Chromium, dev server)
cd frontend && npm run test:e2e

# Frontend production smoke test (requires a prod build first)
cd frontend && npm run build && npm run smoke:prod

# Edge function tests
deno test --allow-env --allow-net --config supabase/functions/deno.json supabase/functions/
```

## Migrations & deployments

### Migrations

Every schema change lives in `supabase/migrations/YYYYMMDDHHMMSS_description.sql`. Never edit an applied migration — create a new one.

```bash
# Generate a new migration from local schema diff
supabase db diff -f my_change

# Apply locally
supabase db reset
```

### Deploying

CI handles all deployments automatically on push:

| Branch | Backend target | Frontend target |
|---|---|---|
| `main` | Production Supabase project | Cloudflare Pages (production) |
| `development` | Staging Supabase project | Cloudflare Pages (preview) |

## Branching model

- `main` — production. Protected; no direct pushes.
- `development` — staging. Protected; no direct pushes.
- Feature work: `<type>/<short-description>` → PR into `development` → promote `development → main`.

Allowed types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `migration`, `update`.

## Brand kit

Visual identity, design tokens, and component rules live in [`brand-kit/`](brand-kit/).
Always read [`brand-kit/CLAUDE.md`](brand-kit/CLAUDE.md) before making UI changes.
