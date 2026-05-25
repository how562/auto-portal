-- Site page builder (site_pages + page_sections). Idempotent; no dealer_groups / auth.users deps.

create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  meta_description text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_pages
  add column if not exists meta_description text;
alter table public.site_pages
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site_pages_status_check'
  ) then
    alter table public.site_pages
      add constraint site_pages_status_check
      check (status in ('draft', 'published'));
  end if;
end $$;

create unique index if not exists site_pages_slug_uniq on public.site_pages (slug);
create index if not exists site_pages_status_idx on public.site_pages (status);

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.site_pages (id) on delete cascade,
  section_type text not null,
  title text,
  subtitle text,
  content text,
  layout_variant text,
  eyebrow text,
  headline text,
  subheadline text,
  body text,
  headline_es text,
  subheadline_es text,
  body_es text,
  cta_text_es text,
  image_url text,
  image_url_es text,
  cta_text text,
  cta_url text,
  cta_url_es text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.page_sections add column if not exists title text;
alter table public.page_sections add column if not exists subtitle text;
alter table public.page_sections add column if not exists content text;
alter table public.page_sections add column if not exists layout_variant text;
alter table public.page_sections add column if not exists eyebrow text;
alter table public.page_sections add column if not exists headline text;
alter table public.page_sections add column if not exists subheadline text;
alter table public.page_sections add column if not exists body text;
alter table public.page_sections add column if not exists headline_es text;
alter table public.page_sections add column if not exists subheadline_es text;
alter table public.page_sections add column if not exists body_es text;
alter table public.page_sections add column if not exists cta_text_es text;
alter table public.page_sections add column if not exists image_url text;
alter table public.page_sections add column if not exists image_url_es text;
alter table public.page_sections add column if not exists cta_text text;
alter table public.page_sections add column if not exists cta_url text;
alter table public.page_sections add column if not exists cta_url_es text;
alter table public.page_sections add column if not exists is_active boolean not null default true;
alter table public.page_sections add column if not exists updated_at timestamptz not null default now();

create index if not exists page_sections_page_sort_idx
  on public.page_sections (page_id, sort_order);

alter table public.site_pages enable row level security;
alter table public.page_sections enable row level security;

drop policy if exists "site_pages_public_read_published" on public.site_pages;
create policy "site_pages_public_read_published"
  on public.site_pages
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "page_sections_public_read_published" on public.page_sections;
create policy "page_sections_public_read_published"
  on public.page_sections
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.site_pages p
      where p.id = page_sections.page_id and p.status = 'published'
    )
  );
