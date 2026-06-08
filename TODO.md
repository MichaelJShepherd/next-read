# Next Read — Kanban

> Track delivery status here. The product spec is the source of truth for behaviour;
> when they disagree, the spec wins.

---

## Backlog
> Known future work, not yet planned.

### 10. Goodreads TBR import
Depends on: 1

#### Tasks
- Accept Goodreads export CSV
- Build CSV parser + validation
- Map to internal book schema
- UI: file upload + import confirmation screen

#### Done when
- User can upload a Goodreads export CSV and see their TBR list in the app

### 11. Mood-based recommendation quiz
Depends on: 1, 10

#### Tasks
- Design quiz question flow (moods, pace, length preference)
- Build quiz step component with chip selection
- Connect to recommendation engine / AI call
- Display ranked results from TBR

#### Done when
- User completes quiz and receives ≥1 ranked book recommendation from their TBR

### 12. Roulette spin animation
Depends on: 11

#### Tasks
- Implement roulette spinner component (2–4s decelerate, prefers-reduced-motion fallback)
- Wire to recommendation result reveal

#### Done when
- Spinner resolves to a single book recommendation with correct motion behaviour

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
- [ ] B3 Angular 22 + Tailwind v4 frontend scaffold
- [ ] B4 Supabase initial migration + functions layout
- [ ] B5 Frontend test + smoke harness
- [ ] B6 GitHub Actions CI (branch-name, backend-test, frontend-test)
- [ ] B7 GitHub Actions deploy-backend
- [ ] B8 GitHub Actions deploy-frontend (Cloudflare Pages)
- [ ] B9 README

#### Done when
- All CI workflows pass on a PR into `development`
- Frontend builds in production mode
- Supabase migration applies cleanly with RLS enabled
- README covers local dev setup end-to-end

---

## In Review
> PR open / awaiting review.

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
