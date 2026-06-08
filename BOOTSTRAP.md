# BOOTSTRAP.md — New Project One-Shot

> Drop this file into the root of an **empty repository** and hand it to an agent.
> It first tells the human what to set up **by hand** before the agent starts, then
> tells the agent exactly what to build, then tells the human what to wire up
> **after** the agent finishes.
>
> This template mirrors the proven stack: **Angular 22 + Tailwind v4** frontend,
> **Supabase** backend (Postgres + Auth + Storage + Edge Functions), **GitHub Actions**
> for test + deploy, and **Cloudflare** for static frontend hosting.
> `main` is **production**, `development` is **dev/staging**.

---

## 0. How to use this file

1. A human completes **Part A — Manual prerequisites**. The agent **cannot** start until these exist.
2. The human tells the agent: *"Read BOOTSTRAP.md and execute Part B."*
3. The agent executes **Part B — Agent bootstrap tasks** end to end, tracking progress in `TODO.md`.
4. The human completes **Part C — Manual finish-up** (secrets, branch protection, first deploy).

The agent **must stop and report** if any Part A prerequisite is missing rather than guessing or scaffolding a placeholder.

---

## Part A — Manual prerequisites (human, before the agent starts)

These two directories are **hard prerequisites**. The agent must verify both exist and refuse to proceed if either is missing.

### A1. Brand directory (required)

Create a brand/design kit directory at the repo root named `brand-kit/` (or reuse an existing `*-claude-kit/`). It **must** contain:

```
brand-kit/
  CLAUDE.md            # concise component + token rules the agent reads first
  design/
    brand.md           # full brand reference: colour, type, motion, voice, components
    tokens.css         # CSS custom properties — the single source of colour/spacing truth
    tokens.ts          # TypeScript mirror of tokens for JS/Tailwind integration
  assets/
    *.svg              # official logo / icon / favicon assets (scale these, never redraw)
```

Rules the kit should encode (adjust to your brand):

- Define a **default theme** (e.g. dark-first) and a **primary action colour**.
- Reserve any **accent/"live" colour** for a single narrow purpose and use it sparingly.
- Name your typefaces (display, UI/body, mono for codes/timecodes/durations).
- State motion principles and standard transition durations.
- **Never hardcode hex values** anywhere in the app — always reference the tokens.

> If `brand-kit/` (or an agreed equivalent) is absent, the agent stops here.

### A2. Initialised fresh Supabase directory (required)

From the repo root, with the Supabase CLI installed:

```bash
supabase init
```

This must produce a clean `supabase/` directory containing at least:

```
supabase/
  config.toml          # local project config (set project_id)
  migrations/          # empty or with an initial schema migration
  functions/           # edge functions live here
  seed.sql             # optional seed data (keep separate from test fixtures)
  .gitignore
```

Also create the **remote** Supabase projects in the dashboard:

- One **production** project (linked from `main`).
- One **staging/dev** project (linked from `development`).

Record each project's **project ref** — you'll add them as GitHub environment variables in Part C. Do **not** commit any access tokens or service-role keys.

> If `supabase/config.toml` does not exist, the agent stops here.

### A3. Repository + branches (required)

- A Git remote on GitHub (private unless you intend otherwise).
- Two long-lived branches: **`main`** (production) and **`development`** (dev/staging).
- The agent works only on short-lived branches (see branching rules in the generated `CLAUDE.md`) and opens PRs — it never pushes to `main` or `development` directly.

### A4. Accounts / tooling (required for Part C, good to have now)

- GitHub repo admin access (to set secrets, variables, branch protection).
- Cloudflare account with **Pages** enabled, plus a Cloudflare **API token** and **account ID**.
- Supabase **personal access token** (for CI deploys).
- Local tooling: Node 22+, npm 11+, Deno 2.x, the Supabase CLI.

---

## Part B — Agent bootstrap tasks (the agent executes this)

> Execute these in order. Before starting, **read `brand-kit/CLAUDE.md` and `brand-kit/design/brand.md`** and confirm `supabase/config.toml` exists. Track every step in `TODO.md` (kanban). Make small, focused commits on a `chore/bootstrap-*` branch and open a PR into `development`.

### B0. Preflight (must pass before anything else)

1. Confirm `brand-kit/` exists with `CLAUDE.md`, `design/tokens.css`, `design/tokens.ts`, `design/brand.md`, and `assets/`. If not → **stop and report**.
2. Confirm `supabase/config.toml` exists. If not → **stop and report**.
3. Confirm `main` and `development` branches exist on the remote. If not → **stop and report**.
4. Confirm Node 22+, npm, Deno 2.x and the Supabase CLI are available.

### B1. Create `CLAUDE.md` at the repo root

Generate a root `CLAUDE.md` that is the default operating guide for any agent in this repo. It **must** cover:

- **Project context & core principles**: inspect before changing; small safe incremental changes; match existing style; no commented-out code, debug logs, or unexplained TODOs; never weaken correctness to silence type/lint/test errors.
- **Stack section** (fill in the real values):
  - Frontend: **Angular 22** (standalone components) + **Tailwind CSS v4** (via `@tailwindcss/postcss`).
  - Backend: **Supabase** (Postgres, Auth, Storage, Edge Functions in Deno/TypeScript).
  - Testing: **Jest/Vitest + Angular unit tests** (frontend), **Deno test** (edge functions), Puppeteer smoke/e2e.
  - Hosting: **Cloudflare Pages** (frontend static), **Supabase** (backend) via GitHub Actions.
- **TypeScript/JS rules**: strict typing; avoid `any` and non-null `!`; explicit return types on exports; `type` for shapes, `interface` only for extension/merging; no `as` casts to suppress real errors; use `satisfies` for literal validation.
- **Validation**: validate every external boundary (HTTP bodies, query/route params, webhooks, env vars, DB records of unknown shape, **LLM/AI output**, file uploads) with the project's schema library before business logic runs. `.parse()` at hard boundaries, `.safeParse()` where controlled recovery is needed. Validate env vars at startup. Treat AI output as untrusted.
- **Services / separation of concerns**: one module = one responsibility; group by feature/domain; one-directional deps, no cycles; components/handlers orchestrate, services do the work; `ApiClient` owns transport only.
- **API/backend rules**: one handler = one action; consistent success/error shapes; authenticate then authorise the **specific resource**; never trust client-supplied IDs without an ownership check; defer slow work; don't leak internals in errors.
- **Database & migrations**: every schema change is a new timestamped migration `YYYYMMDDHHMMSS_description.sql`; never edit an applied migration; UUID PKs; `created_at`/`updated_at`; `jsonb` over `json` when queried; index filter/join/lookup columns; **enable RLS** and filter every query by owner/tenant for user-owned data; seed data separate from test fixtures.
- **Security**: never log or return secrets/tokens/PII; never commit `.env`, keys, or service-account files; parameterised queries only; treat LLM output as untrusted (no executing AI-generated SQL/shell); sanitise user content against XSS; least privilege everywhere.
- **Testing**: meaningful assertions (not just `200`); unit tests for logic/validators/mappers; integration tests for handlers/DB/auth (don't mock the DB where permissions/migrations matter); permission tests for owned data; regression tests for fixed bugs; deterministic tests.
- **Frontend rules**: components render + view state only; data/business logic in services; validate route params; handle loading/empty/error/success states; share validation schemas with backend where possible; accessibility (semantic elements, labels, focus, contrast).
- **Error handling**: fail loud in dev, safe in prod; user-safe API errors; typed errors; never swallow errors.
- **Branching & Git workflow** (enforced by CI — see B6):
  - Never push directly to `main` or `development`.
  - Branch name: `<type>/<short-description>`, lowercase + hyphens, no random suffixes.
  - Allowed `<type>`: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `migration`, `update`. **No agent/tool prefixes** (`claude/`, `ai/`, etc.).
- **Execution workflow**: treat `TODO.md` as project memory — read the task, move it to *In Progress*, pick the smallest safe path, update tests + docs alongside code, then run formatter/linter/typecheck/tests and move the task to *Done*.
- **Design & brand**: **always** read `brand-kit/CLAUDE.md` and `brand-kit/design/brand.md` before any UI change; use tokens exclusively; never hardcode hex; scale official SVG assets, never redraw.

### B2. Create `TODO.md` — kanban board

Generate a `TODO.md` the agent uses as durable project memory, structured as a kanban board:

```markdown
# <Project> — Kanban

> Track delivery status here. The product spec is the source of truth for behaviour;
> when they disagree, the spec wins.

---

## Backlog
> Known future work, not yet planned.

## To Do
> Scoped and ready to pick up.

## In Progress
> Actively being worked (keep this short — ideally one item).

## In Review
> PR open / awaiting review.

## Done
> Merged and verified.

---

### Task template
### <n>. <Short title>
Depends on: <task numbers, if any>

#### Tasks
- <subtask>
- <subtask>

#### Done when
- <clear, testable acceptance criteria>
```

Seed it with the bootstrap tasks themselves (B1–B8) so the very first board reflects real work, and add a first feature epic placeholder.

### B3. Scaffold the Angular 22 + Tailwind v4 frontend

Create `frontend/` as an Angular 22 application using **standalone components** (no NgModules) and the modern `@angular/build:application` builder.

1. Scaffold:
   ```bash
   npx @angular/cli@22 new frontend --directory frontend --style=css --routing --ssr=false --standalone
   ```
2. Add **Tailwind v4** via PostCSS:
   ```bash
   cd frontend && npm install -D tailwindcss @tailwindcss/postcss postcss
   ```
   Create `frontend/.postcssrc.json`:
   ```json
   { "plugins": { "@tailwindcss/postcss": {} } }
   ```
   In `frontend/src/styles.css`, start with `@import "tailwindcss";` and define brand tokens in a `@theme { ... }` block that **mirrors `brand-kit/design/tokens.css`** (do not invent new colours).
3. Add the Supabase client:
   ```bash
   npm install @supabase/supabase-js
   ```
4. Environments: create `src/environments/environment.ts` (dev/staging) and `src/environments/environment.production.ts` (prod), each holding the **public** Supabase URL + anon key for the matching project. Wire `fileReplacements` in `angular.json` so the production configuration swaps in the production environment. **Never** put service-role keys in the frontend.
5. `angular.json` production config: keep `outputHashing: "all"`, sensible bundle budgets, and license extraction on.
6. `package.json` scripts (model on a working setup):
   ```json
   {
     "scripts": {
       "start": "ng serve --configuration development",
       "build": "ng build --configuration production",
       "build:dev": "ng build --configuration development",
       "test": "ng test",
       "test:e2e": "jest --config jest.e2e.config.js",
       "smoke:prod": "node scripts/smoke-prod.cjs"
     }
   }
   ```
   (Rename the `smoke:*` script for your app's critical first-paint surface; the point is a **prod-bundle smoke test**, see B5.)
7. Pin Node engine expectations to 22 and commit `package-lock.json`.
8. Set up a `src/app/core/` for services (e.g. a Supabase client provider, an `ApiClient`) and `src/app/features/` for feature areas — keep components thin per the CLAUDE.md rules.

### B4. Confirm the Supabase backend layout

The `supabase/` directory already exists (Part A). The agent should:

- Add an **initial schema migration** under `supabase/migrations/` (`YYYYMMDDHHMMSS_initial_app_schema.sql`) with: UUID PKs, `created_at`/`updated_at` (auto-updated), **RLS enabled** on every user-owned table, and owner/tenant filters. If auth profiles are needed, add a `handle_new_user`-style trigger that creates a profile row on signup.
- Establish `supabase/functions/` with a `_shared/` folder for reusable helpers (e.g. validation, rate-limiting) and a `deno.json` config. Each function is a folder with `index.ts` and a co-located `index_test.ts`.
- Keep `seed.sql` for seed data only (not test fixtures).
- Document required edge-function secrets as a list in the README (do not commit values).

### B5. Frontend test + smoke harness

- Unit tests via the Angular test builder (`ng test`).
- An **e2e** config (`jest.e2e.config.js` + `jest-puppeteer.config.js`) that serves the dev build and drives it headless.
- A **production smoke test** (`scripts/smoke-prod.cjs` or equivalent) that loads the **minified production bundle** in headless Chromium and asserts the app's most critical surface actually instantiates — this catches prod-only failures the dev e2e suite cannot.

### B6. GitHub Actions — CI (tests + branch policy)

Create these workflows under `.github/workflows/`. All PR-triggered checks run for PRs into **both** `main` and `development`.

**`branch-name.yml`** — enforce semantic branch names on PRs:
```yaml
name: Branch name
on:
  pull_request:
    branches: [main, development]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Validate semantic branch name
        run: |
          branch="${{ github.head_ref }}"
          pattern='^(feat|fix|chore|docs|refactor|test|migration|update)/.+'
          if [[ ! "$branch" =~ $pattern ]]; then
            echo "Branch name '$branch' does not follow <type>/<description>."
            echo "Allowed types: feat, fix, chore, docs, refactor, test, migration, update"
            exit 1
          fi
          echo "Branch name '$branch' is valid."
```

**`backend-test.yml`** — Deno unit tests for edge functions:
```yaml
name: Backend test
on:
  pull_request:
    branches: [main, development]
    paths: ['supabase/functions/**']
jobs:
  test:
    name: Deno unit tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: denoland/setup-deno@v2
        with: { deno-version: v2.x }
      - name: Run unit tests
        run: |
          if [ -n "$(find supabase/functions -name '*_test.ts' 2>/dev/null)" ]; then
            deno test --allow-env --allow-net --config supabase/functions/deno.json supabase/functions/
          else
            echo "No edge function tests yet — skipping."
          fi
```

**`frontend-test.yml`** — frontend build + unit + prod smoke:
```yaml
name: Frontend test
on:
  pull_request:
    branches: [main, development]
    paths: ['frontend/**', '.github/workflows/frontend-test.yml']
jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run: { working-directory: frontend }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - name: Unit tests
        run: npm test -- --watch=false --browsers=ChromeHeadless || npm test
      - name: Production build
        run: npm run build
      - name: Smoke test (prod bundle)
        run: npm run smoke:prod
```

### B7. GitHub Actions — deploy the Supabase backend

**`deploy-backend.yml`** — push migrations + edge functions, environment-aware. `main` → production project, `development` → staging project. Uses a path filter so it only runs when the pipeline, migrations, or functions change.

```yaml
name: Deploy Supabase
on:
  push:
    branches: [main, development]
jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      pipeline: ${{ steps.filter.outputs.pipeline }}
      migrations: ${{ steps.filter.outputs.migrations }}
      functions: ${{ steps.filter.outputs.functions }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            pipeline:
              - '.github/workflows/deploy-backend.yml'
            migrations:
              - 'supabase/migrations/**'
            functions:
              - 'supabase/functions/**'

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: denoland/setup-deno@v2
        with: { deno-version: v2.x }
      - name: Run unit tests
        run: |
          if [ -n "$(find supabase/functions -name '*_test.ts' 2>/dev/null)" ]; then
            deno test --allow-env --allow-net --config supabase/functions/deno.json supabase/functions/
          else
            echo "No edge function tests yet — skipping."
          fi

  deploy:
    needs: [detect-changes, test]
    if: |
      needs.detect-changes.outputs.pipeline == 'true' ||
      needs.detect-changes.outputs.migrations == 'true' ||
      needs.detect-changes.outputs.functions == 'true'
    runs-on: ubuntu-latest
    # Maps main -> production, development -> staging via GitHub Environments.
    environment: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
    env:
      SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with: { version: latest }
      - name: Link to Supabase project
        run: supabase link --project-ref ${{ vars.SUPABASE_PROJECT_ID }}
      - name: Push database migrations
        if: needs.detect-changes.outputs.pipeline == 'true' || needs.detect-changes.outputs.migrations == 'true'
        run: supabase db push --include-all
      - name: Set edge function secrets
        if: needs.detect-changes.outputs.pipeline == 'true' || needs.detect-changes.outputs.functions == 'true'
        # Add project secrets here, e.g.:
        # run: supabase secrets set "MY_SECRET=${{ secrets.MY_SECRET }}"
        run: echo "No secrets configured yet"
      - name: Deploy all edge functions
        if: needs.detect-changes.outputs.pipeline == 'true' || needs.detect-changes.outputs.functions == 'true'
        run: |
          if [ -n "$(find supabase/functions -mindepth 1 -name '*.ts' 2>/dev/null)" ]; then
            supabase functions deploy
          else
            echo "No edge functions to deploy yet — skipping."
          fi
```

> The `SUPABASE_PROJECT_ID` variable and any secrets are resolved **per GitHub Environment** (`production` vs `staging`), which is how the same workflow targets prod from `main` and staging from `development`.

### B8. CI/CD — deploy the frontend to Cloudflare Pages (static)

**`deploy-frontend.yml`** — build the Angular app and publish the static `dist/` to Cloudflare Pages. `main` → production Pages project/branch, `development` → preview/staging.

```yaml
name: Deploy frontend (Cloudflare Pages)
on:
  push:
    branches: [main, development]
    paths: ['frontend/**', '.github/workflows/deploy-frontend.yml']
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
    defaults:
      run: { working-directory: frontend }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - name: Build
        # Production from main; development build (staging env) otherwise.
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            npm run build
          else
            npm run build:dev
          fi
      - name: Publish to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          # 'main' deploys go to production; any other branch becomes a preview.
          command: >-
            pages deploy dist/frontend/browser
            --project-name=${{ vars.CLOUDFLARE_PAGES_PROJECT }}
            --branch=${{ github.ref_name }}
```

Notes for the agent:

- Confirm the Angular build output path (`dist/frontend/browser` for the `application` builder) and adjust `pages deploy` accordingly.
- Add a Pages SPA fallback so client-side routes resolve: include a `public/_redirects` file containing `/*    /index.html   200`.
- Cloudflare Pages treats the project's **production branch** as production and all other branches as **preview** deployments — set the Pages project production branch to `main` so `development` lands as a staging preview.

### B9. README + docs

Generate a root `README.md` covering: what the project is, the stack, local dev setup (frontend + `supabase start`), environment variables (names only), how migrations/functions are deployed, the branching model, and where the brand kit lives. Keep docs short and close to the code.

### B10. Finish

- Run frontend formatter/lint/typecheck/tests and `deno test` for functions; everything green.
- Move completed items to **Done** in `TODO.md`.
- Open a PR from `chore/bootstrap-*` into `development` summarising what was created, what was tested, and any remaining risks.
- Report back to the human with the **Part C** checklist below.

---

## Part C — Manual finish-up (human, after the agent finishes)

The agent cannot create accounts, set secrets, or configure branch protection. Do these by hand:

1. **GitHub Environments** — create `production` and `staging` environments. For each, set:
   - Variable `SUPABASE_PROJECT_ID` = the matching Supabase project ref.
   - Variable `CLOUDFLARE_PAGES_PROJECT` = the Cloudflare Pages project name.
   - Secret `SUPABASE_ACCESS_TOKEN` = your Supabase personal access token.
   - Secret `CLOUDFLARE_API_TOKEN` and secret `CLOUDFLARE_ACCOUNT_ID`.
   - Any edge-function secrets referenced in `deploy-backend.yml`.
2. **Cloudflare Pages** — create the Pages project, set its **production branch to `main`**, and confirm the build output directory matches the workflow (`dist/frontend/browser`).
3. **Branch protection** — protect `main` and `development`: require PRs, require the CI checks (`Branch name`, `Frontend test`, `Backend test`) to pass, and disallow direct pushes.
4. **Supabase auth config** — set Site URL / redirect URLs for each project to the matching Cloudflare domain.
5. **First deploy** — merge the bootstrap PR into `development` first; verify the staging backend + Pages preview come up. Then promote `development` → `main` for production.
6. **Secrets hygiene** — confirm no `.env`, keys, anon-key-in-wrong-env, or service-role keys were committed.

---

## Definition of done (whole bootstrap)

- [ ] `brand-kit/` present and referenced by root `CLAUDE.md`.
- [ ] `supabase/` initialised with an initial RLS-enabled migration and a `functions/` layout.
- [ ] Root `CLAUDE.md` encodes best practices, brand usage, and `TODO.md` usage.
- [ ] `TODO.md` kanban exists and reflects real work.
- [ ] `frontend/` is Angular 22 + Tailwind v4, builds in prod, has unit + e2e + prod smoke tests.
- [ ] CI runs branch-name, frontend, and backend tests on PRs into `main` and `development`.
- [ ] `deploy-backend.yml` pushes migrations + functions, prod from `main`, staging from `development`.
- [ ] `deploy-frontend.yml` ships the static site to Cloudflare Pages, prod from `main`, preview from `development`.
- [ ] All pipelines treat `main` as production and `development` as dev/staging.
- [ ] README documents setup, env var names, deploy flow, and branching.
