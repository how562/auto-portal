-- Batch 1: file-pattern → store routing for multi-dealer SFTP imports (idempotent).
create table if not exists public.feed_file_mappings (
  id uuid primary key default gen_random_uuid(),
  file_pattern text not null,
  store_id uuid not null references public.stores (id) on delete cascade,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists feed_file_mappings_store_idx
  on public.feed_file_mappings (store_id);

create index if not exists feed_file_mappings_active_idx
  on public.feed_file_mappings (is_active);

create unique index if not exists feed_file_mappings_pattern_store_uniq
  on public.feed_file_mappings (file_pattern, store_id);

alter table public.feed_file_mappings enable row level security;

drop policy if exists "feed_file_mappings_public_read" on public.feed_file_mappings;
create policy "feed_file_mappings_public_read"
  on public.feed_file_mappings
  for select
  to anon, authenticated
  using (true);
