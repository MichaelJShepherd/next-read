import type { ScrapedBook } from './scraper.ts';

const BASE = 'https://openlibrary.org';
const MAX_GENRES = 8;
const CONCURRENCY = 8;
const REQUEST_TIMEOUT_MS = 5_000;
const ENRICH_BUDGET_MS = 30_000;

export interface EnrichResult {
  books: ScrapedBook[];
  /** Books that received at least one genre. */
  enrichedCount: number;
  /** Books not attempted because the time budget ran out. */
  skippedCount: number;
}

/**
 * True when at least one book in an untyped cached payload carries genres.
 * Cache entries written before genre enrichment existed have none and must
 * be treated as stale.
 */
export function hasAnyGenres(bookData: unknown): boolean {
  return (
    Array.isArray(bookData) &&
    bookData.some(
      (b: unknown) =>
        typeof b === 'object' &&
        b !== null &&
        Array.isArray((b as { genres?: unknown }).genres) &&
        ((b as { genres: unknown[] }).genres.length > 0),
    )
  );
}

/** Builds the Open Library search URL for a book — by ISBN when present, title/author otherwise. */
export function searchUrl(book: Pick<ScrapedBook, 'isbn' | 'title' | 'author'>): string {
  const params = new URLSearchParams({ fields: 'subject', limit: '1' });
  if (book.isbn) {
    params.set('q', `isbn:${book.isbn}`);
  } else {
    params.set('title', book.title);
    if (book.author) params.set('author', book.author);
  }
  return `${BASE}/search.json?${params}`;
}

/** Trims, de-duplicates (case-insensitive), and caps raw Open Library subjects. */
export function normaliseSubjects(subjects: string[]): string[] | null {
  const seen = new Set<string>();
  const genres: string[] = [];
  for (const subject of subjects) {
    const trimmed = subject.trim();
    if (!trimmed || seen.has(trimmed.toLowerCase())) continue;
    seen.add(trimmed.toLowerCase());
    genres.push(trimmed);
    if (genres.length >= MAX_GENRES) break;
  }
  return genres.length > 0 ? genres : null;
}

async function fetchGenres(
  book: ScrapedBook,
  fetchFn: typeof fetch,
): Promise<string[] | null> {
  try {
    const res = await fetchFn(searchUrl(book), {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { docs?: { subject?: string[] }[] };
    const subjects = data.docs?.[0]?.subject;
    if (!Array.isArray(subjects)) return null;
    return normaliseSubjects(subjects.filter((s): s is string => typeof s === 'string'));
  } catch {
    return null;
  }
}

/**
 * Looks up genres on Open Library for each book that has none.
 * Failures leave a book's genres null; the import never fails on enrichment.
 * Stops starting new lookups once the time budget is spent so huge shelves
 * cannot stall the import.
 */
export async function enrichWithGenres(
  books: ScrapedBook[],
  fetchFn: typeof fetch = fetch,
): Promise<EnrichResult> {
  const out = [...books];
  const deadline = Date.now() + ENRICH_BUDGET_MS;
  let next = 0;
  let enrichedCount = 0;
  let skippedCount = 0;

  async function worker(): Promise<void> {
    while (next < out.length) {
      const i = next++;
      if (out[i].genres !== null) continue;
      if (Date.now() > deadline) {
        skippedCount++;
        continue;
      }
      const genres = await fetchGenres(out[i], fetchFn);
      if (genres) {
        out[i] = { ...out[i], genres };
        enrichedCount++;
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, out.length) }, () => worker()),
  );
  return { books: out, enrichedCount, skippedCount };
}
