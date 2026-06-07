# Feature Specification: Goodreads TBR Recommendation Assistant

## 1. Product Summary

The application is a responsive web app that helps Goodreads users choose their next book from their existing Goodreads “Want to Read” list.

The core problem is decision paralysis. Users with large to-read lists often spend too much time scrolling, comparing, and second-guessing what to read next. This app acts as a cozy personal librarian that guides the user through a short, filter-based recommendation flow and presents a small set of suitable books.

The app is not intended to replace Goodreads. It is designed to make Goodreads more useful by helping users make reading decisions faster and with more confidence.

## 2. Product Positioning

### Product Promise

Help readers choose their next book from their Goodreads TBR based on their current mood, energy, and reading preferences.

### Suggested Positioning Statement

A cozy personal librarian for your Goodreads TBR.

### Core User Outcome

The user finishes a recommendation session having selected a book to read next.

## 3. North Star Metric

Recommendation sessions resulting in a selected book.

### Supporting Metrics

- Number of recommendation sessions started
- Number of recommendation sessions completed
- Percentage of sessions resulting in a selected book
- Average time to select a book
- Number of books marked as in progress
- Number of books marked as completed
- Number of repeat users
- Number of imported Goodreads books per user

## 4. Target Users

### Primary User

A Goodreads user with a large “Want to Read” shelf who struggles to decide what to read next.

### Secondary User

A casual reader who uses Goodreads inconsistently but still wants help narrowing down their reading options.

### User Context

The app is designed primarily for mobile use. Users are likely to open it when they are about to start a new book, often in a relaxed or low-energy context.

## 5. Core User Problem

Goodreads helps users collect books, but it does not sufficiently help them decide what to read next based on their current mood, energy, and preferences.

Large TBR lists create friction because users have too many choices and not enough decision support.

## 6. MVP Scope

The MVP should focus on helping a user import their Goodreads TBR, answer a short filter-based flow, receive 3–5 suitable book options, and select one book to read next.

### MVP Must-Haves

- Goodreads TBR import
- Responsive mobile-first web app
- Cozy personal librarian experience
- Short quiz/filter recommendation flow
- Book recommendation results showing 3–5 books
- Book cover display
- Book synopsis display
- Basic recommendation explanation
- Roulette/spinner selection from recommended books
- Ability to manually select a book
- Session completion tracking
- Selected book confirmation screen
- Ability to mark selected book as “in progress”
- Ability to mark book as “completed”, subject to Goodreads integration capability

### Out of Scope for MVP

- Social features
- Friend recommendations
- Full reading tracker replacement
- Public user profiles
- Reviews and ratings authored inside the app
- Community features
- Complex AI chat experience
- Marketplace or bookstore integration
- Native mobile app

## 7. Key Product Risk

### Goodreads Integration Risk

Goodreads integration is a significant technical and product risk.

The product depends heavily on access to the user’s Goodreads “Want to Read” shelf. The ability to import, sync, update, mark books as in progress, and mark books as completed will depend on Goodreads’ current integration options and limitations.

This risk should not block product definition, but it must be called out clearly as the main dependency to validate before or during early technical discovery.

## 8. Primary User Journey

### Step 1: Landing / Welcome

The user lands on the app and sees a simple value proposition.

Example copy:

“Let your TBR breathe. Find your next read from your Goodreads list in under a minute.”

Primary CTA:

“Import my Goodreads TBR”

### Step 2: Goodreads Import

The user imports or connects their Goodreads account.

The app retrieves the user’s to-read list and stores the imported books.

### Step 3: TBR Ready State

After import, the user sees confirmation that their TBR is ready.

Example:

“Your bookshelf is ready. I found 247 books waiting for you.”

Primary CTA:

“Help me choose”

### Step 4: Filter / Quiz Flow

The app asks a short sequence of cozy, low-friction questions.

The goal is to understand what kind of reading experience the user wants right now.

### Step 5: Recommendation Results

The app presents 3–5 recommended books from the user’s Goodreads TBR.

Each result should show:

- Cover
- Title
- Author
- Short synopsis
- Page count
- Rating if available
- Genre/tags if available
- Why this book was recommended

### Step 6: Roulette / Spinner

The user can use a roulette-style spinner to randomly select one of the recommended books.

### Step 7: Final Selection

The app confirms the selected book.

### Step 8: Mark as In Progress

The user can mark the book as in progress inside the app.

### Step 9: Mark as Completed

The user can later mark the book as completed.

## 9. Recommendation Flow Questions

### Question 1: Reading Energy

“What kind of reading energy do you have?”

Options:

- Light and easy
- Medium focus
- Fully immersive
- Surprise me

### Question 2: Mood

“What kind of mood are you after?”

Options:

- Cozy
- Emotional
- Fast-paced
- Romantic
- Dark
- Hopeful
- Thought-provoking
- Escapist

### Question 3: Commitment Level

“How much of a commitment feels right?”

Options:

- Short and quick
- Medium-length
- Long and immersive
- I’m open

### Question 4: Genre Direction

“What sounds good right now?”

Options:

- Fantasy
- Romance
- Thriller
- Mystery
- Sci-fi
- Literary fiction
- Historical fiction
- Non-fiction
- Surprise me

### Question 5: Avoidance Filter

“What are you not in the mood for?”

Options:

- Slow pacing
- Heavy topics
- Sad endings
- Complex worldbuilding
- Romance-heavy
- Violence
- Starting a series
- No strong preference

## 10. Recommendation Logic

The MVP can begin with a rules-based scoring system rather than complex AI.

Each book receives a score based on how well it matches the user’s selected filters.

## 11. Randomization Logic

### Full TBR Random

The app picks any eligible book from the user’s imported Goodreads TBR.

### Curated Roulette

The app first narrows the TBR using the quiz flow, then spins between the 3–5 recommended books.

## 12. Book Status Management

### Statuses

- Want to read
- Recommended
- Selected
- In progress
- Completed
- Dismissed for now

## 13. Data Model

### User

- id
- email
- display_name
- created_at
- last_login_at

### Book

- id
- external_goodreads_id
- title
- author
- cover_url
- synopsis
- page_count
- average_rating
- genres
- series_name
- series_number
- goodreads_url

### RecommendationSession

- id
- user_id
- started_at
- completed_at
- resulted_in_selection
- selected_book_id
- filters

## 14. Core Screens

1. Landing Page
2. Import Screen
3. Home / Bookshelf Screen
4. Quiz Screen
5. Recommendation Results Screen
6. Spinner Screen
7. Selected Book Screen
8. In Progress Screen

## 15. UX Principles

- Mobile-first
- Fast
- Cozy
- Low cognitive load
- Decisive

## 16. Visual Direction

The design should feel like a cozy personal librarian.

Avoid:
- Dense Goodreads-style lists
- Productivity dashboard vibes
- Overly gamified interfaces

## 17. Functional Requirements

### Goodreads Import

The system must allow users to import their Goodreads TBR.

### Recommendation Quiz

The system must guide users through a short filter-based flow.

### Recommendation Results

The system must show 3–5 recommended books.

### Roulette Spinner

The system must allow users to spin between recommended books.

### Book Selection

The system must allow users to confirm a selected book.

### Mark as In Progress

The system must allow users to mark a selected book as in progress.

### Mark as Completed

The system must allow users to mark a book as completed.

## 18. Non-Functional Requirements

### Performance

- Fast mobile load times
- Quick recommendation results
- Optimized cover image loading

### Accessibility

- Large tap targets
- Screen-reader support
- Reduced motion support

### Privacy

- User book data should remain private
- Users should be able to delete their data

## 19. Analytics Events

- recommendation_session_started
- recommendation_results_viewed
- spinner_started
- book_selected
- book_marked_in_progress
- book_marked_completed

### North Star Event

recommendation_session_completed_with_selected_book

## 20. MVP Success Criteria

The MVP is successful if users can:

- Import their Goodreads TBR
- Complete a recommendation flow
- See 3–5 relevant book options
- Use a spinner or manually choose a book
- Mark the chosen book as in progress
- Complete a recommendation session with confidence

## 21. Future Enhancements

- AI-assisted personalization
- Mood tagging
- Better recommendation intelligence
- StoryGraph support
- Reading habit learning
- Book comparison tools

## 22. Product Definition Summary

This application helps Goodreads users make faster, better reading decisions from their own TBR lists.

The core product loop is:

Import Goodreads TBR → answer mood-based filters → receive 3–5 options → spin or choose → mark as in progress → eventually mark as completed.
