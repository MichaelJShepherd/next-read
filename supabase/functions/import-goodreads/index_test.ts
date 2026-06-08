import { assertEquals, assertStringIncludes } from 'std/assert/mod.ts';
import { extractGoodreadsId, normaliseProfileUrl, parseShelfHtml } from './scraper.ts';

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
    'https://www.goodreads.com/review/list/12345',
  );
});

Deno.test('parseShelfHtml — returns empty array for empty HTML', () => {
  assertEquals(parseShelfHtml('<html></html>'), []);
});

Deno.test('parseShelfHtml — parses book rows', () => {
  const html = `
    <table>
      <tr class="bookalike">
        <td class="field title"><a href="/book/show/1">The Night Circus</a></td>
        <td class="field author"><a class="authorName" href="/author/show/1">Erin Morgenstern</a></td>
        <td class="field cover"><img src="https://covers.gr/book/1._SX98_.jpg" /></td>
        <td class="field num_pages"><div class="value">387</div></td>
        <td class="field avg_rating"><div class="value">4.03</div></td>
      </tr>
    </table>
  `;
  const books = parseShelfHtml(html);
  assertEquals(books.length, 1);
  assertEquals(books[0].title, 'The Night Circus');
  assertEquals(books[0].author, 'Erin Morgenstern');
  assertEquals(books[0].page_count, 387);
  assertEquals(books[0].avg_rating, 4.03);
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
