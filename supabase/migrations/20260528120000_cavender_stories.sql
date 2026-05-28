-- Editorial Stories index (/stories)

create table if not exists public.cavender_stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  category text not null check (category in ('community', 'vehicles', 'people', 'culture')),
  cover_image text not null default '',
  cover_image_alt text not null default '',
  author text not null default 'Cavender Editorial',
  published_at timestamptz not null default now(),
  read_time text not null default '5 min read',
  featured boolean not null default false,
  external_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  body jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cavender_stories_status_published_at_idx
  on public.cavender_stories (status, published_at desc);

create index if not exists cavender_stories_category_idx
  on public.cavender_stories (category);

alter table public.cavender_stories enable row level security;

create policy "Public read published stories"
  on public.cavender_stories
  for select
  to anon, authenticated
  using (status = 'published');

comment on table public.cavender_stories is
  'Editorial stories for /stories — published rows override lib placeholders when present.';
