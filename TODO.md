# Goodreads TBR Recommendation App — Development Kanban Plan

## Board Instructions for Coding Agent

Use this document as the working development board.

Rules:

- Move only one task into **In Progress** at a time unless tasks are clearly independent.
- When starting a task, move it from **TODO** to **In Progress**.
- When complete, move it from **In Progress** to **Done**.
- Do not skip acceptance criteria.
- If blocked, add a short blocker note under the task.

---

# TODO

## 1. Project Setup

### 1.1 Create Angular project

- [ ] Create new Angular standalone project
- [ ] Enable routing
- [ ] Configure mobile-first structure
- [ ] Add base environment files
- [ ] Add linting/formatting
- [ ] Add path aliases if useful

Acceptance criteria:

- [ ] App runs locally
- [ ] Routes can be added cleanly
- [ ] Project structure is ready for feature modules/components

---

### 1.2 Configure Supabase client

- [ ] Install Supabase JS client
- [ ] Add Supabase environment variables
- [ ] Create Supabase service wrapper
- [ ] Add anonymous sign-in initialization
- [ ] Ensure session hydration before protected app logic runs

Acceptance criteria:

- [ ] Anonymous user is created automatically
- [ ] Session persists across refresh
- [ ] App can access current user ID

---

## 2. Goodreads Scraping Risk Stream

### 2.1 Build Goodreads scraping proof of concept

- [ ] Accept Goodreads profile URL
- [ ] Normalize/validate URL
- [ ] Fetch profile HTML
- [ ] Extract Want to Read shelf data
- [ ] Extract title, author, cover URL, synopsis, page count, and rating where possible

Acceptance criteria:

- [ ] Scraper works for at least one real profile
- [ ] Failure modes are documented
- [ ] Missing metadata is handled gracefully

---

### 2.2 Implement scrape rate limiting

- [ ] Prevent more than one scrape per profile per 24 hours
- [ ] Return cached data if profile was scraped recently
- [ ] Store scrape timestamps

Acceptance criteria:

- [ ] Repeated imports reuse cached data
- [ ] User receives clear messaging about cached imports

---

## 3. Recommendation Engine

### 3.1 Build rules-based scoring engine

Scoring inputs:

- [ ] Genre match
- [ ] Mood match
- [ ] Commitment level
- [ ] Avoidance filters
- [ ] Ratings
- [ ] Series information

Acceptance criteria:

- [ ] Engine returns ranked results
- [ ] Results are deterministic/testable

---

## 4. Roulette Spinner

### 4.1 Build spinner experience

- [ ] Add animated roulette interaction
- [ ] Respect reduced motion preference
- [ ] Allow respin
- [ ] Allow accepting result

Acceptance criteria:

- [ ] Spinner feels delightful
- [ ] Spinner works smoothly on mobile

---

## 5. Deployment

### 5.1 Deploy MVP

- [ ] Deploy app
- [ ] Smoke test full flow
- [ ] Validate analytics events
- [ ] Validate recommendation completion flow

Acceptance criteria:

- [ ] Internal tester can complete full recommendation flow successfully

---

# In Progress

_No tasks currently in progress._

---

# Done

_No tasks completed yet._
