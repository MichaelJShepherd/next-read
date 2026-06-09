import { assertEquals, assertStringIncludes } from 'std/assert/mod.ts';
import { extractGoodreadsId, normaliseProfileUrl, parseRssXml } from './scraper.ts';

Deno.test('extractGoodreadsId — user/show URL', () => {
  assertEquals(
    extractGoodreadsId('https://www.goodreads.com/user/show/12345-john-doe'),
    '12345',
  );
});

Deno.test('extractGoodreadsId — review/list URL', () => {
  assertEquals(
    extractGoodreadsId('https://www.goodreads.com/review/list/99999'),
    '99999',
  );
});

Deno.test('extractGoodreadsId — invalid URL returns null', () => {
  assertEquals(extractGoodreadsId('https://example.com'), null);
});

Deno.test('normaliseProfileUrl', () => {
  assertEquals(
    normaliseProfileUrl('https://www.goodreads.com/user/show/12345-john'),
    'https://www.goodreads.com/review/list_rss/12345',
  );
});

Deno.test('parseRssXml — returns empty array for empty feed', () => {
  assertEquals(parseRssXml('<rss><channel></channel></rss>'), []);
});

Deno.test('parseRssXml — parses items', () => {
  const xml = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title><![CDATA[The Night Circus]]></title>
      <author_name>Erin Morgenstern</author_name>
      <book_large_image_url><![CDATA[https://covers.gr/book/1.jpg]]></book_large_image_url>
      <average_rating>4.03</average_rating>
      <num_pages>387</num_pages>
    </item>
  </channel>
</rss>`;
  const books = parseRssXml(xml);
  assertEquals(books.length, 1);
  assertEquals(books[0].title, 'The Night Circus');
  assertEquals(books[0].author, 'Erin Morgenstern');
  assertEquals(books[0].avg_rating, 4.03);
  assertEquals(books[0].page_count, 387);
});

Deno.test('handler — OPTIONS returns 200', async () => {
  const { handler } = await import('./index.ts');
  const res = await handler(new Request('http://localhost/import-goodreads', { method: 'OPTIONS' }));
  assertEquals(res.status, 200);
});

Deno.test('handler — missing profileUrl returns 400', async () => {
  const { handler } = await import('./index.ts');
  const res = await handler(new Request('http://localhost/import-goodreads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  }));
  assertEquals(res.status, 400);
});

Deno.test('handler — invalid URL returns 422', async () => {
  const { handler } = await import('./index.ts');
  const res = await handler(new Request('http://localhost/import-goodreads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileUrl: 'https://example.com/not-goodreads' }),
  }));
  assertEquals(res.status, 422);
  const json = await res.json();
  assertStringIncludes(json.error, 'Goodreads user ID');
});
