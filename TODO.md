# Next Read — Kanban

> Track delivery status here. The product spec is the source of truth for behaviour;
> when they disagree, the spec wins.

---

## Backlog

> Known future work, not yet planned.

### 10. Goodreads profile import

Depends on: 1

#### Tasks

- Accept Goodreads profile URL
- Normalise and validate URL
- Fetch profile HTML (edge function)
- Extract Want to Read shelf data
- Extract title, author, cover URL, synopsis, page count, and rating where available
- Handle missing metadata gracefully
- Document known failure modes
- Prevent more than one scrape per profile per 24 hours
- Return cached data if profile was scraped recently
- Store scrape timestamps
- UI: URL input + import progress + confirmation screen

#### Done when

- Scraper works end-to-end for at least one real Goodreads profile
- Missing fields are handled without errors
- Repeated imports within 24 hours return cached data with clear user messaging
- User can see their Want to Read list in the app

### 11. Recommendation engine + quiz

Depends on: 1, 10

#### Tasks

- Design quiz question flow (moods, pace, length preference)
- Build quiz step component with chip selection (brand chip tokens)
- Build rules-based scoring engine with inputs: genre match, mood match, commitment level, avoidance filters, ratings, series information
- Engine returns deterministic, testable ranked results
- Connect quiz answers to scoring engine
- Display ranked results from TBR

#### Done when

- Engine returns ranked results that are deterministic and unit-testable
- User completes quiz and receives ≥1 ranked book recommendation from their TBR

### 12. Roulette spin animation

Depends on: 11

#### Tasks

- Implement roulette spinner component (2–4s decelerate easing)
- Respect `prefers-reduced-motion` (instant reveal fallback)
- Allow respin
- Allow accepting result
- Wire to recommendation result reveal

#### Done when

- Spinner resolves to a single book recommendation with correct motion behaviour
- Respin and accept actions work correctly on mobile

### 13. MVP validation

Depends on: 2, 12

#### Tasks

- Smoke test full end-to-end flow (import → quiz → spin → accept)
- Validate analytics events fire at each step
- Validate recommendation completion flow with a real TBR

#### Done when

- An internal tester can complete the full recommendation flow successfully in production

---

## To Do

> Scoped and ready to pick up.

---

## In Progress

> Actively being worked (keep this short — ideally one item).

### 1. Bootstrap

Depends on: —

#### Tasks

- [x] B0 Preflight checks
- [x] B1 Root CLAUDE.md
- [x] B2 TODO.md kanban
- [x] B3 Angular 22 + Tailwind v4 frontend scaffold
- [x] B4 Supabase initial migration + functions layout
- [x] B5 Frontend test + smoke harness
- [x] B6 GitHub Actions CI (branch-name, backend-test, frontend-test)
- [x] B7 GitHub Actions deploy-backend
- [x] B8 GitHub Actions deploy-frontend (Cloudflare Pages)
- [x] B9 README

#### Done when

- All CI workflows pass on a PR into `development`
- Frontend builds in production mode
- Supabase migration applies cleanly with RLS enabled
- README covers local dev setup end-to-end

---

## In Review

> PR open / awaiting review.

### 2. Part C — infrastructure finish-up

Depends on: 1

#### Tasks

- [ ] Create GitHub Environments (`production` and `staging`)
- [ ] Set `SUPABASE_PROJECT_ID` variable on each environment
- [ ] Set `CLOUDFLARE_PAGES_PROJECT` variable on each environment
- [ ] Set `SUPABASE_ACCESS_TOKEN` secret on each environment
- [ ] Set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets on each environment
- [ ] Fill in Supabase URLs + anon keys in `frontend/src/environments/` (do not commit)
- [ ] Create Cloudflare Pages project, set production branch to `main`
- [ ] Enable branch protection on `main` and `development` (require PRs + CI checks)
- [ ] Merge bootstrap PR into `development`, verify staging deploy
- [ ] Promote `development → main` for production deploy
- [ ] Set Supabase auth Site URL / redirect URLs per environment

#### Done when

- Staging deploys cleanly from `development`
- Production deploys cleanly from `main`
- Branch protection prevents direct pushes to both branches

---

## Done

> Merged and verified.

---

### Task template

### <n>. <Short title>

Depends on: <task numbers, if any>

#### Tasks

- <subtask>

#### Done when

- <clear, testable acceptance criteria>
