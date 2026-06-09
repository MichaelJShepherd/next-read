-- Scrape cache: stores the raw Goodreads shelf data for 24h.
-- Keyed by normalised Goodreads profile URL (not per-user).
-- Accessed by the import-goodreads edge function via service role.
create table public.scrape_cache (
  id uuid primary key default gen_random_uuid(),
  profile_url text not null unique,
  goodreads_id text not null,
  book_data jsonb not null default '[]',
  scraped_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table
  public.scrape_cache enable row level security;

create trigger set_scrape_cache_updated_at before
update
  on public.scrape_cache for each row execute function public.set_updated_at();