import { createClient } from 'npm:@supabase/supabase-js@^2';
import { handleCors } from '../_shared/cors.ts';
import { ok, err } from '../_shared/response.ts';
import { extractGoodreadsId, normaliseProfileUrl, scrapeWantToRead } from './scraper.ts';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function supabaseAdmin() {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function handler(req: Request): Promise<Response> {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') return err('Method not allowed', 405);

  let profileUrl: string;
  try {
    const body = await req.json();
    profileUrl = (body?.profileUrl ?? '').trim();
  } catch {
    return err('Invalid JSON body', 400);
  }

  if (!profileUrl) return err('profileUrl is required', 400);

  const goodreadsId = extractGoodreadsId(profileUrl);
  if (!goodreadsId) {
    return err(
      'Could not parse a Goodreads user ID from that URL. ' +
      'Use a URL like https://www.goodreads.com/user/show/12345-your-name',
      422,
    );
  }

  const cacheKey = normaliseProfileUrl(profileUrl);
  const db = supabaseAdmin();

  // Check cache
  const { data: cached } = await db
    .from('scrape_cache')
    .select('book_data, scraped_at')
    .eq('profile_url', cacheKey)
    .single();

  if (cached) {
    const age = Date.now() - new Date(cached.scraped_at).getTime();
    if (age < CACHE_TTL_MS) {
      return ok({ books: cached.book_data, cached: true });
    }
  }

  // Scrape fresh
  let books;
  try {
    books = await scrapeWantToRead(goodreadsId);
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Scrape failed', 502);
  }

  if (books.length === 0) {
    return err(
      'No books found on that Want to Read shelf. ' +
      'Make sure the profile is public and has books marked as Want to Read.',
      404,
    );
  }

  // Upsert cache
  await db.from('scrape_cache').upsert(
    { profile_url: cacheKey, goodreads_id: goodreadsId, book_data: books, scraped_at: new Date().toISOString() },
    { onConflict: 'profile_url' },
  );

  return ok({ books, cached: false });
}

if (import.meta.main) {
  Deno.serve(handler);
}
