-- Track what was recommended and what the user selected.
-- Books currently live client-side (localStorage), so we snapshot them as
-- jsonb rather than referencing public.books. book_id remains available for
-- future DB-backed books. RLS and owner policies are already enabled on the
-- recommendations table and cover these new columns.

alter table public.recommendations
  add column picks         jsonb not null default '[]'::jsonb,
  add column selected_book jsonb;
