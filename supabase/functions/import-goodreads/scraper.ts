import { parse } from 'node-html-parser';

export interface ScrapedBook {
  title: string;
  author: string | null;
  cover_url: string | null;
  page_count: number | null;
  avg_rating: number | null;
  genres: string[] | null;
  isbn: string | null;
}

const RSS_PAGE_SIZE = 100;
const MAX_PAGES = 10; // cap at 1000 books

/** Extracts the numeric Goodreads user ID from any Goodreads profile URL. */
export function extractGoodreadsId(url: string): string | null {
  const match = url.match(/goodreads\.com\/(?:user\/show\/|review\/list(?:_rss)?\/)(\d+)/);
  return match?.[1] ?? null;
}

/** Normalises a Goodreads URL to a canonical form for cache keying. */
export function normaliseProfileUrl(url: string): string {
  const id = extractGoodreadsId(url);
  return id ? `https://www.goodreads.com/review/list_rss/${id}` : url.trim().toLowerCase();
}

/** Fetches all pages of the public RSS to-read shelf for a given Goodreads user ID. */
export async function scrapeWantToRead(goodreadsId: string): Promise<ScrapedBook[]> {
  const all: ScrapedBook[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url =
      `https://www.goodreads.com/review/list_rss/${goodreadsId}` +
      `?shelf=to-read&page=${page}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, text/xml',
      },
    });

    if (res.status === 404) throw new Error('Goodreads profile not found or is private.');
    if (!res.ok) throw new Error(`Goodreads returned ${res.status}. Try again later.`);

    const xml = await res.text();
    const items = parseRssXml(xml);
    all.push(...items);

    if (items.length < RSS_PAGE_SIZE) break;

    // Be polite between pages
    await new Promise<void>(resolve => setTimeout(resolve, 300));
  }

  return all;
}

function stripCdata(s: string): string {
  return s.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

function text(item: ReturnType<typeof parse>, selector: string): string {
  return stripCdata(item.querySelector(selector)?.text?.trim() ?? '');
}

/** Pure RSS parser — no network calls, safe to unit test. */
export function parseRssXml(xml: string): ScrapedBook[] {
  const root = parse(xml);
  const items = root.querySelectorAll('item');
  const books: ScrapedBook[] = [];

  for (const item of items) {
    const title = text(item, 'title');
    if (!title) continue;

    const author = text(item, 'author_name') || null;

    const rawCover =
      text(item, 'book_large_image_url') ||
      text(item, 'book_small_image_url') ||
      null;
    const cover_url = rawCover?.includes('nophoto') ? null : rawCover ?? null;

    const avgStr = text(item, 'average_rating');
    const avg_rating = avgStr ? parseFloat(avgStr) || null : null;

    const pagesStr = text(item, 'num_pages');
    const page_count = pagesStr ? parseInt(pagesStr, 10) || null : null;

    const isbnRaw = text(item, 'isbn').replace(/[^0-9X]/gi, '');
    const isbn = isbnRaw.length >= 10 ? isbnRaw : null;

    books.push({ title, author, cover_url, page_count, avg_rating, genres: null, isbn });
  }

  return books;
}
