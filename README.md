# next read

> Your cozy librarian — a mood-based book recommender for your Goodreads TBR.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 22 (standalone) + Tailwind CSS v4 |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions) |
| Hosting | Cloudflare Pages (frontend) + Supabase (backend) |
| CI/CD | GitHub Actions |

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
