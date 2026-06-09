# Next Read — Kanban

> Track delivery status here. The product spec is the source of truth for behaviour;
> when they disagree, the spec wins. Where the build has deliberately diverged from
> the spec, the divergence is noted on the relevant task and reflected back into the spec.

---

## Backlog

> Known future work, not yet planned.

### 16. Book status: mark in progress / completed

Depends on: 11

> Not built. The spec lists these as MVP must-haves, but they depend on Goodreads
> write-back capability, which is the spec's called-out key risk. Selection ("accepted")
> is already tracked; in-progress/completed states are not.

#### Tasks

- Decide on storage for reading status (local vs DB vs Goodreads write-back)
- Mark a selected book as "in progress"
- Mark a book as "completed"
- Surface status on the home/bookshelf screen

#### Done when

- A user can mark a chosen book in progress and later completed
- Status persists across sessions

### 17. Server-side recommend function (decision needed)

Depends on: 11

> The scoring engine currently runs client-side (`quiz.service.ts`). The `recommend`
> edge function is a stub returning `{ message: 'recommend stub' }` and is not called
> by the frontend. Either implement scoring server-side or remove the stub.

#### Tasks

- Decide: keep client-side scoring, or move it behind the `recommend` edge function
- If removing: delete the stub function and its test
- If implementing: port scoring, validate inputs, return ranked results with logging

#### Done when

- No dead/stub edge function remains, or `recommend` does real work end-to-end

### 13. MVP validation + analytics

Depends on: 11, 16

> Recommendation sessions and selections are now persisted to the `recommendations`
> table (see task 15), which covers the North Star data. The named analytics events
> in the spec (§19) are not yet emitted as discrete events.

#### Tasks

- Emit spec analytics events (session started/completed, results viewed, book selected, etc.)
- Smoke test full end-to-end flow (import → quiz → results → select) in production
- Validate recommendation completion with a real TBR

#### Done when

- An internal tester can complete the full flow in production
- Session + selection data is queryable for the North Star metric

---

## To Do

> Scoped and ready to pick up.

_(nothing queued)_

---

## In Progress

> Actively being worked (keep this short — ideally one item).

_(nothing in flight)_

---

## In Review

> PR open / awaiting review.

### 2. Part C — infrastructure finish-up

Depends on: 1

> Manual steps the agent cannot perform (accounts, secrets, branch protection, first deploy).

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
- [ ] Enable anonymous sign-ins on the hosted Supabase project (Authentication → Sign In / Providers) per environment — required for recommendation/selection tracking

#### Done when

- Staging deploys cleanly from `development`
- Production deploys cleanly from `main`
- Branch protection prevents direct pushes to both branches

---

## Done

> Merged and verified.

### 12. Roulette / spinner selection

Depends on: 11

> Implemented as an optional "Spin for me" control on the results page rather than a
> separate spinner screen. The highlight travels across the existing result cards with
> decelerating steps (~2–3s, within the brand's 2–4s spinner window, via
> `spin-plan.ts`), lands on a random pick, and reuses the unused `book-spin` pulse.
> Manual selection remains the primary path.

#### Tasks

- [x] Roulette spin over the 3–5 results (2–4s decelerating step sequence)
- [x] Respect `prefers-reduced-motion` (instant reveal fallback)
- [x] Respin and accept from the spin result panel
- [x] Wired to the existing result reveal and accept/confirmation flow
- [x] Unit tests for the spin schedule (`spin-plan.spec.ts`)

#### Done when

- [x] Spinner resolves to a single book with correct motion behaviour
- [x] Respin and accept work on mobile

### 19. Quiz flow improvements

Depends on: 11

> Hardened and polished the quiz flow. Adds the spec's MVP "basic recommendation
> explanation": scoring now produces human-readable reasons per pick, shown as a
> "Why this pick" section in the result detail modal.

#### Tasks

- [x] Empty-shelf guard: `/quiz` shows an import prompt instead of a pointless quiz when no books are imported
- [x] No-match handling: stay on the quiz with a friendly notice instead of silently bouncing home
- [x] Restore previous answers so "Try different answers" refines instead of resetting
- [x] "Why this pick" reasons (mood match, length fit, high rating) surfaced in the result modal
- [x] Accessibility: screen-reader step announcements, arrow-key support + roving tabindex on the commitment radio group, 44px chip tap targets, mood emoji rendered
- [x] Code quality: removed non-null `!`, caught the floating tracking promise, aligned avoid chips with the brand-kit selected-chip style
- [x] Unit tests for the scoring engine (`quiz.service.spec.ts`)

#### Done when

- [x] A user with an empty shelf or over-strict filters is told what to do next instead of hitting a dead end
- [x] Each recommended book explains why it was picked

### 18. Add a root `.gitignore` and untrack stray files

Depends on: —

> Added a repo-wide root `.gitignore` (agent/editor dirs, env/secrets, OS cruft,
> build output) alongside the existing `frontend/` and `supabase/` ones. Audited the
> index: nothing sensitive was ever tracked (no `.env`, keys, `node_modules`, or
> `dist`), so nothing needed removing. `.claude/` is now ignored; legitimate untracked
> source files remain stage-able.

#### Tasks

- [x] Add a root `.gitignore` covering editor/agent dirs, env files, OS cruft, and build output
- [x] Confirm nothing that should never have been committed is tracked (none found)
- [x] Confirm no `.env`, keys, or service-account files are tracked

#### Done when

- [x] A root `.gitignore` is committed and `git status` is clean of stray files

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

### 10. Goodreads TBR import

Depends on: 1

> Built against the public Goodreads RSS feed (`/review/list_rss/{id}?shelf=to-read`),
> not the authenticated HTML shelf. The import edge function parses the feed; the
> frontend stores the imported books in `localStorage` (not the DB) for the MVP.

#### Tasks

- [x] Accept and normalise/validate a Goodreads profile URL
- [x] Fetch the Want to Read shelf via the RSS feed (edge function, paginated)
- [x] Extract title, author, cover URL, page count, rating, genres, ISBN where available
- [x] Handle missing metadata gracefully
- [x] 24h scrape cache (`goodreads_scrape_cache`) to avoid re-scraping
- [x] UI: URL input + import progress + confirmation screen
- [x] Structured logging on the edge function

#### Done when

- [x] Scraper works end-to-end for a real Goodreads profile
- [x] Missing fields handled without errors
- [x] User can review their imported list before continuing

### 11. Recommendation engine + quiz

Depends on: 1, 10

> Diverged from the spec's 5-question flow: implemented as a 3-step quiz
> (mood multi-select, commitment, avoidance). Scoring runs client-side in
> `quiz.service.ts`. Results are deterministic per score, with a small ±1.5
> jitter so closely-scored books vary between runs.

#### Tasks

- [x] 3-step quiz: mood (multi), commitment (length), avoidance (multi)
- [x] Rules-based scoring: genre/mood match, commitment fit, avoidance filter, rating bonus
- [x] Light randomisation so near-ties shuffle between runs
- [x] Connect quiz answers to the engine and display the 3–5 ranked results

#### Done when

- [x] Engine returns ranked results from the user's TBR
- [x] User completes the quiz and receives ≥1 recommendation

### 14. Book detail modal + external synopsis

Depends on: 11

> Results show 3–5 cards; tapping one opens a bottom-sheet modal with synopsis,
> genres, rating, and page count. Synopsis and genres are fetched on demand from
> Open Library (ISBN edition → work, with a title/author search fallback) and
> cached in-memory + `localStorage`.

#### Tasks

- [x] 3–5 result card list with cover, title, author, rating, page count
- [x] Bottom-sheet detail modal (scroll lock, backdrop, Escape to close)
- [x] On-demand synopsis + genres from Open Library with two-level cache
- [x] Manual selection → confirmation screen

#### Done when

- [x] User can inspect any recommended book and confirm a selection

### 15. Anonymous-user tracking of recommendations & selections

Depends on: 11

> Every visitor gets a persisted anonymous Supabase session. Recommendation sessions
> and the final selection are written to the `recommendations` table under RLS
> (`auth.uid() = user_id`). Books live in `localStorage`, so picks and the selected
> book are stored as `jsonb` snapshots rather than via the `book_id` FK.

#### Tasks

- [x] Enable anonymous sign-ins (`config.toml`) and bootstrap a session on app load
- [x] `recommendations` migration: add `picks` + `selected_book` jsonb columns
- [x] Record the recommendation (answers + picks) on quiz completion
- [x] Mark the accepted book on selection
- [x] Best-effort writes — tracking never blocks or breaks the reading flow

#### Done when

- [x] Anon sign-in → insert → selection update verified end-to-end under RLS
- [x] Hosted enablement tracked as a Part C step

---

### Task template

### <n>. <Short title>

Depends on: <task numbers, if any>

#### Tasks

- <subtask>

#### Done when

- <clear, testable acceptance criteria>
