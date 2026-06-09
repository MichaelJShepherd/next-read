import { createClient } from 'npm:@supabase/supabase-js@^2';
import { handleCors } from '../_shared/cors.ts';
import { ok, err } from '../_shared/response.ts';
import { log } from '../_shared/logger.ts';
import { extractGoodreadsId, normaliseProfileUrl, scrapeWantToRead } from './scraper.ts';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function supabaseAdmin() {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key, { auth: { persistSession: false } });
}

const FN = 'import-goodreads';

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
    log('warn', FN, 'invalid_url');
    return err(
      'Could not parse a Goodreads user ID from that URL. ' +
      'Use a URL like https://www.goodreads.com/user/show/12345-your-name',
      422,
    );
  }

  const cacheKey = normaliseProfileUrl(profileUrl);
  const db = supabaseAdmin();

  const { data: cached } = await db
    .from('scrape_cache')
    .select('book_data, scraped_at')
    .eq('profile_url', cacheKey)
    .single();

  if (cached) {
    const age = Date.now() - new Date(cached.scraped_at).getTime();
    if (age < CACHE_TTL_MS) {
      log('info', FN, 'cache_hit', { goodreads_id: goodreadsId, age_ms: age });
      return ok({ books: cached.book_data, cached: true });
    }
    log('info', FN, 'cache_stale', { goodreads_id: goodreadsId, age_ms: age });
  } else {
    log('info', FN, 'cache_miss', { goodreads_id: goodreadsId });
  }

  log('info', FN, 'scrape_start', { goodreads_id: goodreadsId });
  let books;
  try {
    books = await scrapeWantToRead(goodreadsId);
  } catch (e) {
    log('error', FN, 'scrape_failed', { goodreads_id: goodreadsId, error: e instanceof Error ? e.message : String(e) });
    return err(e instanceof Error ? e.message : 'Scrape failed', 502);
  }

  if (books.length === 0) {
    log('warn', FN, 'empty_shelf', { goodreads_id: goodreadsId });
    return err(
      'No books found on that Want to Read shelf. ' +
      'Make sure the profile is public and has books marked as Want to Read.',
      404,
    );
  }

  log('info', FN, 'scrape_complete', { goodreads_id: goodreadsId, book_count: books.length });

  await db.from('scrape_cache').upsert(
    { profile_url: cacheKey, goodreads_id: goodreadsId, book_data: books, scraped_at: new Date().toISOString() },
    { onConflict: 'profile_url' },
  );

  return ok({ books, cached: false });
}

if (import.meta.main) {
  Deno.serve(handler);
}
