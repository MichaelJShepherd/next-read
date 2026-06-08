-- Initial schema for Next Read
-- All user-owned tables have RLS enabled and owner-filtered policies.

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- Profiles
-- Mirrors auth.users 1-to-1. Created automatically on signup.
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- Books (TBR entries imported from Goodreads)
-- ============================================================
create table public.books (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  title       text not null,
  author      text,
  cover_url   text,
  page_count  integer,
  avg_rating  numeric(3, 2),
  genres      text[],
  synopsis    text,
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.books enable row level security;

create policy "Users can view own books"
  on public.books for select
  using (auth.uid() = user_id);

create policy "Users can insert own books"
  on public.books for insert
  with check (auth.uid() = user_id);

create policy "Users can update own books"
  on public.books for update
  using (auth.uid() = user_id);

create policy "Users can delete own books"
  on public.books for delete
  using (auth.uid() = user_id);

create index books_user_id_idx on public.books (user_id);

-- ============================================================
-- Recommendations (quiz results)
-- ============================================================
create table public.recommendations (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  book_id       uuid references public.books (id) on delete set null,
  quiz_answers  jsonb not null default '{}',
  accepted      boolean,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.recommendations enable row level security;

create policy "Users can view own recommendations"
  on public.recommendations for select
  using (auth.uid() = user_id);

create policy "Users can insert own recommendations"
  on public.recommendations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recommendations"
  on public.recommendations for update
  using (auth.uid() = user_id);

create index recommendations_user_id_idx on public.recommendations (user_id);

-- ============================================================
-- Auto-update updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_books_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

create trigger set_recommendations_updated_at
  before update on public.recommendations
  for each row execute function public.set_updated_at();

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
