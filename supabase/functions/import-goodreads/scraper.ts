import { parse } from 'node-html-parser';

export interface ScrapedBook {
  title: string;
  author: string | null;
  cover_url: string | null;
  page_count: number | null;
  avg_rating: number | null;
  genres: string[] | null;
}

/** Extracts the numeric Goodreads user ID from any Goodreads profile URL. */
export function extractGoodreadsId(url: string): string | null {
  const match = url.match(/goodreads\.com\/(?:user\/show\/|review\/list\/)(\d+)/);
  return match?.[1] ?? null;
}

/** Normalises a Goodreads URL to a canonical form for cache keying. */
export function normaliseProfileUrl(url: string): string {
  const id = extractGoodreadsId(url);
  return id ? `https://www.goodreads.com/review/list/${id}` : url.trim().toLowerCase();
}

/** Fetches and parses the Want to Read shelf for a given Goodreads user ID. */
export async function scrapeWantToRead(goodreadsId: string): Promise<ScrapedBook[]> {
  const shelfUrl =
    `https://www.goodreads.com/review/list/${goodreadsId}` +
    `?shelf=to-read&view=table&per_page=200&sort=date_added`;

  const res = await fetch(shelfUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (res.status === 404) throw new Error('Goodreads profile not found or is private.');
  if (!res.ok) throw new Error(`Goodreads returned ${res.status}. Try again later.`);

  const html = await res.text();
  return parseShelfHtml(html);
}

/** Pure HTML parser — no network calls, safe to unit test. */
export function parseShelfHtml(html: string): ScrapedBook[] {
  const root = parse(html);
  const books: ScrapedBook[] = [];

  for (const row of root.querySelectorAll('tr.bookalike')) {
    const titleEl = row.querySelector('td.field.title a');
    if (!titleEl) continue;

    const title = titleEl.text.trim().replace(/\s+/g, ' ');
    if (!title) continue;

    const authorEl =
      row.querySelector('td.field.author .authorName') ??
      row.querySelector('td.field.author a');

    const coverEl = row.querySelector('td.field.cover img');
    const src = coverEl?.getAttribute('src') ?? null;
    const cover_url = src ? src.replace(/\._[A-Z0-9]+_\./, '.') : null; // strip resize tokens

    const pagesRaw = row.querySelector('td.field.num_pages .value')?.text?.trim() ?? '';
    const page_count = pagesRaw ? parseInt(pagesRaw.replace(/,/g, ''), 10) || null : null;

    const ratingRaw = row.querySelector('td.field.avg_rating .value')?.text?.trim() ?? '';
    const avg_rating = ratingRaw ? parseFloat(ratingRaw) || null : null;

    books.push({
      title,
      author: authorEl?.text?.trim().replace(/\s+/g, ' ') ?? null,
      cover_url,
      page_count,
      avg_rating,
      genres: null,
    });
  }

  return books;
}
