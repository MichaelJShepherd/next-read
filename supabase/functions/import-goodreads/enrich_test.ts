import { assertEquals, assertStringIncludes } from 'std/assert/mod.ts';
import { enrichWithGenres, hasAnyGenres, normaliseSubjects, searchUrl } from './enrich.ts';
import type { ScrapedBook } from './scraper.ts';

function makeBook(overrides: Partial<ScrapedBook> & { title: string }): ScrapedBook {
  return {
    author: null,
    cover_url: null,
    page_count: null,
    avg_rating: null,
    genres: null,
    isbn: null,
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.test('searchUrl — prefers ISBN when present', () => {
  const url = searchUrl({ isbn: '9780765326355', title: 'The Way of Kings', author: 'Brandon Sanderson' });
  assertStringIncludes(url, 'q=isbn%3A9780765326355');
  assertStringIncludes(url, 'fields=subject');
  assertStringIncludes(url, 'limit=1');
});

Deno.test('searchUrl — falls back to title and author without ISBN', () => {
  const url = searchUrl({ isbn: null, title: 'The Night Circus', author: 'Erin Morgenstern' });
  assertStringIncludes(url, 'title=The+Night+Circus');
  assertStringIncludes(url, 'author=Erin+Morgenstern');
});

Deno.test('normaliseSubjects — trims, de-duplicates case-insensitively, caps at 8', () => {
  const subjects = [
    ' Fantasy ', 'fantasy', 'Romance', '', 'Historical Fiction',
    'Magic', 'Dragons', 'Epic', 'Adventure', 'Quests', 'Overflow',
  ];
  const genres = normaliseSubjects(subjects);
  assertEquals(genres, [
    'Fantasy', 'Romance', 'Historical Fiction', 'Magic',
    'Dragons', 'Epic', 'Adventure', 'Quests',
  ]);
});

Deno.test('normaliseSubjects — returns null when nothing usable remains', () => {
  assertEquals(normaliseSubjects(['', '  ']), null);
});

Deno.test('enrichWithGenres — fills genres from Open Library subjects', async () => {
  const fetchFn = ((url: string | URL | Request) => {
    assertStringIncludes(String(url), 'openlibrary.org/search.json');
    return Promise.resolve(jsonResponse({ docs: [{ subject: ['Romance', 'Historical Fiction'] }] }));
  }) as typeof fetch;

  const { books, enrichedCount, skippedCount } = await enrichWithGenres(
    [makeBook({ title: 'Outlander', isbn: '9780440212560' })],
    fetchFn,
  );
  assertEquals(books[0].genres, ['Romance', 'Historical Fiction']);
  assertEquals(enrichedCount, 1);
  assertEquals(skippedCount, 0);
});

Deno.test('enrichWithGenres — leaves genres null on lookup failure', async () => {
  const fetchFn = (() => Promise.resolve(jsonResponse({ error: 'down' }, 500))) as typeof fetch;
  const { books, enrichedCount } = await enrichWithGenres([makeBook({ title: 'Unknown' })], fetchFn);
  assertEquals(books[0].genres, null);
  assertEquals(enrichedCount, 0);
});

Deno.test('enrichWithGenres — leaves genres null when no match is found', async () => {
  const fetchFn = (() => Promise.resolve(jsonResponse({ docs: [] }))) as typeof fetch;
  const { books, enrichedCount } = await enrichWithGenres([makeBook({ title: 'Obscure' })], fetchFn);
  assertEquals(books[0].genres, null);
  assertEquals(enrichedCount, 0);
});

Deno.test('enrichWithGenres — skips books that already have genres', async () => {
  let calls = 0;
  const fetchFn = (() => {
    calls++;
    return Promise.resolve(jsonResponse({ docs: [{ subject: ['Thriller'] }] }));
  }) as typeof fetch;

  const { books } = await enrichWithGenres(
    [
      makeBook({ title: 'Pre-tagged', genres: ['Mystery'] }),
      makeBook({ title: 'Untagged' }),
    ],
    fetchFn,
  );
  assertEquals(calls, 1);
  assertEquals(books[0].genres, ['Mystery']);
  assertEquals(books[1].genres, ['Thriller']);
});

Deno.test('hasAnyGenres — detects enriched and un-enriched cached payloads', () => {
  assertEquals(hasAnyGenres([{ title: 'A', genres: ['Fantasy'] }, { title: 'B', genres: null }]), true);
  assertEquals(hasAnyGenres([{ title: 'A', genres: null }, { title: 'B', genres: [] }]), false);
  assertEquals(hasAnyGenres([]), false);
  assertEquals(hasAnyGenres('not-an-array'), false);
  assertEquals(hasAnyGenres(null), false);
});

Deno.test('enrichWithGenres — survives a fetch that rejects', async () => {
  const fetchFn = (() => Promise.reject(new Error('network down'))) as typeof fetch;
  const { books, enrichedCount } = await enrichWithGenres([makeBook({ title: 'Flaky' })], fetchFn);
  assertEquals(books[0].genres, null);
  assertEquals(enrichedCount, 0);
});
