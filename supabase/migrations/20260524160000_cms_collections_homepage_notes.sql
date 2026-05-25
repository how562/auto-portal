-- CMS expansion: collections, homepage sections, admin notes (idempotent, no dealer_groups dependency).

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores (id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists collections_slug_uniq on public.collections (slug);
create index if not exists collections_sort_idx on public.collections (sort_order);
create index if not exists collections_active_idx on public.collections (is_active);

create table if not exists public.collection_rules (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections (id) on delete cascade,
  field text not null,
  operator text not null check (
    operator in (
      'equals',
      'not_equals',
      'less_than',
      'greater_than',
      'greater_than_or_equal',
      'less_than_or_equal',
      'contains'
    )
  ),
  value text not null,
  created_at timestamptz not null default now()
);

create index if not exists collection_rules_collection_idx
  on public.collection_rules (collection_id);

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  title text,
  title_es text,
  subtitle text,
  subtitle_es text,
  section_type text not null default 'collection' check (
    section_type in ('collection', 'banner', 'static')
  ),
  collection_id uuid references public.collections (id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.homepage_sections
  add column if not exists title_es text;
alter table public.homepage_sections
  add column if not exists subtitle_es text;
alter table public.homepage_sections
  add column if not exists updated_at timestamptz not null default now();

create index if not exists homepage_sections_sort_idx
  on public.homepage_sections (sort_order);
create index if not exists homepage_sections_active_idx
  on public.homepage_sections (is_active);

-- Shared admin scratchpad (no auth.users — service role / admin API only).
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled',
  body text not null default '',
  pinned boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes add column if not exists archived boolean not null default false;

create index if not exists notes_list_idx
  on public.notes (archived, pinned desc, updated_at desc);

alter table public.collections enable row level security;
alter table public.collection_rules enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.notes enable row level security;

drop policy if exists "collections_public_read" on public.collections;
create policy "collections_public_read"
  on public.collections
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "collection_rules_public_read" on public.collection_rules;
create policy "collection_rules_public_read"
  on public.collection_rules
  for select
  to anon, authenticated
  using (true);

drop policy if exists "homepage_sections_public_read" on public.homepage_sections;
create policy "homepage_sections_public_read"
  on public.homepage_sections
  for select
  to anon, authenticated
  using (is_active = true);
