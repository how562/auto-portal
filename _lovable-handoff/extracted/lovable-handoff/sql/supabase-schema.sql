-- ============================================================
-- Automotive Inventory Admin — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE where possible).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- ROLES ----------
do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

-- ---------- CORE TABLES ----------
create table if not exists public.dealer_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  dealer_group_id uuid references public.dealer_groups(id) on delete set null,
  name text not null,
  city text,
  state text,
  phone text,
  website text,
  created_at timestamptz not null default now()
);

create table if not exists public.feed_sources (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade,
  name text not null,
  feed_type text not null check (feed_type in ('csv','xml','api')),
  feed_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.feed_field_mappings (
  id uuid primary key default gen_random_uuid(),
  feed_source_id uuid references public.feed_sources(id) on delete cascade,
  source_field text not null,
  mapped_field text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.feed_import_runs (
  id uuid primary key default gen_random_uuid(),
  feed_source_id uuid references public.feed_sources(id) on delete cascade,
  status text not null check (status in ('pending','success','failed')),
  total_records integer not null default 0,
  new_records integer not null default 0,
  updated_records integer not null default 0,
  removed_records integer not null default 0,
  error_log text,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  dealer_group_id uuid references public.dealer_groups(id) on delete set null,
  store_id uuid references public.stores(id) on delete cascade,
  source_feed_id uuid references public.feed_sources(id) on delete set null,
  vin text not null,
  stock_number text,
  condition text check (condition in ('new','used','cpo')),
  year integer,
  make text,
  model text,
  trim text,
  body_style text,
  exterior_color text,
  interior_color text,
  mileage integer,
  msrp numeric,
  internet_price numeric,
  sale_price numeric,
  status text not null default 'active' check (status in ('active','missing','sold')),
  days_in_stock integer,
  primary_image_url text,
  raw_data jsonb,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
do $$ begin
  alter table public.vehicles add constraint vehicles_store_vin_unique unique (store_id, vin);
exception when duplicate_table then null; when duplicate_object then null; end $$;

create table if not exists public.vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.vehicle_pricing_history (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  old_price numeric,
  new_price numeric,
  changed_at timestamptz not null default now()
);

-- ---------- AUTH: profiles + user_roles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

-- security definer: avoids recursive RLS
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

-- trigger: create profile, first user becomes admin
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_count int;
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;

  select count(*) into user_count from public.user_roles where role = 'admin';
  if user_count = 0 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- updated_at trigger for vehicles
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

-- ---------- RLS ----------
alter table public.dealer_groups enable row level security;
alter table public.stores enable row level security;
alter table public.feed_sources enable row level security;
alter table public.feed_field_mappings enable row level security;
alter table public.feed_import_runs enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_images enable row level security;
alter table public.vehicle_pricing_history enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

-- admin-only policies for admin tables
do $$
declare
  t text;
  tables text[] := array[
    'dealer_groups','stores','feed_sources','feed_field_mappings',
    'feed_import_runs','vehicles','vehicle_images','vehicle_pricing_history'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "admin_all_%s" on public.%I', t, t);
    execute format(
      'create policy "admin_all_%s" on public.%I for all to authenticated using (public.has_role(auth.uid(), ''admin'')) with check (public.has_role(auth.uid(), ''admin''))',
      t, t
    );
  end loop;
end $$;

-- profiles: user sees own, admin sees all
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- user_roles: user sees own, admin sees all
drop policy if exists "user_roles_self_select" on public.user_roles;
create policy "user_roles_self_select" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- Note: service_role key bypasses RLS automatically. The external worker
-- should use SUPABASE_SERVICE_ROLE_KEY for all writes.

-- ============================================================
-- SMART COLLECTIONS (append)
-- ============================================================
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  dealer_group_id uuid references public.dealer_groups(id) on delete cascade,
  store_id uuid references public.stores(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists collections_set_updated_at on public.collections;
create trigger collections_set_updated_at
before update on public.collections
for each row execute function public.set_updated_at();

create table if not exists public.collection_rules (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  field text not null,
  operator text not null check (operator in ('equals','not_equals','less_than','greater_than','greater_than_or_equal','less_than_or_equal','contains')),
  value text not null,
  created_at timestamptz not null default now()
);

-- Upgrade older installs (safe to re-run):
-- alter table public.collections add column if not exists updated_at timestamptz not null default now();
-- alter table public.collection_rules drop constraint if exists collection_rules_operator_check;
-- alter table public.collection_rules add constraint collection_rules_operator_check
--   check (operator in ('equals','not_equals','less_than','greater_than','greater_than_or_equal','less_than_or_equal','contains'));

alter table public.collections enable row level security;
alter table public.collection_rules enable row level security;

do $$
declare
  t text;
  tables text[] := array['collections','collection_rules'];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "admin_all_%s" on public.%I', t, t);
    execute format(
      'create policy "admin_all_%s" on public.%I for all to authenticated using (public.has_role(auth.uid(), ''admin'')) with check (public.has_role(auth.uid(), ''admin''))',
      t, t
    );
  end loop;
end $$;

-- ============================================================
-- FEED IMPORT RUN ITEMS (append) — per-vehicle results per run
-- ============================================================
create table if not exists public.feed_import_run_items (
  id uuid primary key default gen_random_uuid(),
  import_run_id uuid not null references public.feed_import_runs(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  vin text,
  stock_number text,
  action text not null check (action in ('created','updated','missing','failed')),
  message text,
  created_at timestamptz not null default now()
);

create index if not exists feed_import_run_items_run_action_idx
  on public.feed_import_run_items(import_run_id, action);

alter table public.feed_import_run_items enable row level security;

drop policy if exists "admin_all_feed_import_run_items" on public.feed_import_run_items;
create policy "admin_all_feed_import_run_items" on public.feed_import_run_items
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- HOMEPAGE SECTIONS (append)
-- ============================================================
create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  dealer_group_id uuid references public.dealer_groups(id) on delete cascade,
  title text,
  subtitle text,
  section_type text not null check (section_type in ('collection','banner','static')),
  collection_id uuid references public.collections(id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists homepage_sections_sort_idx
  on public.homepage_sections(sort_order);

alter table public.homepage_sections enable row level security;

drop policy if exists "admin_all_homepage_sections" on public.homepage_sections;
create policy "admin_all_homepage_sections" on public.homepage_sections
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- PAGE BUILDER CMS (append)
-- ============================================================
create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  dealer_group_id uuid references public.dealer_groups(id) on delete cascade,
  store_id uuid references public.stores(id) on delete set null,
  title text not null,
  slug text not null,
  meta_description text,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists site_pages_set_updated_at on public.site_pages;
create trigger site_pages_set_updated_at
before update on public.site_pages
for each row execute function public.set_updated_at();

create index if not exists site_pages_slug_idx on public.site_pages(slug);
create index if not exists site_pages_status_idx on public.site_pages(status);

create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.site_pages(id) on delete cascade,
  section_type text not null check (section_type in (
    'hero','text_block','image_text','split_feature','cta_band','faq',
    'stats','card_grid','inventory_collection','form','locations','custom_html'
  )),
  layout_variant text,
  eyebrow text,
  headline text,
  subheadline text,
  body text,
  image_url text,
  cta_text text,
  cta_url text,
  sort_order integer not null default 0,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);


create index if not exists page_sections_page_sort_idx on public.page_sections(page_id, sort_order);

alter table public.site_pages enable row level security;
alter table public.page_sections enable row level security;

do $$
declare
  t text;
  tables text[] := array['site_pages','page_sections'];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "admin_all_%s" on public.%I', t, t);
    execute format(
      'create policy "admin_all_%s" on public.%I for all to authenticated using (public.has_role(auth.uid(), ''admin'')) with check (public.has_role(auth.uid(), ''admin''))',
      t, t
    );
  end loop;
end $$;

-- Public read of published pages and their sections (for future Next.js site)
drop policy if exists "public_read_published_pages" on public.site_pages;
create policy "public_read_published_pages" on public.site_pages
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "public_read_published_page_sections" on public.page_sections;
create policy "public_read_published_page_sections" on public.page_sections
  for select to anon, authenticated
  using (exists (
    select 1 from public.site_pages p
    where p.id = page_sections.page_id and p.status = 'published'
  ));
-- Notes table (per-user personal notes for admins)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled',
  body text not null default '',
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes enable row level security;

drop policy if exists "notes_owner_all" on public.notes;
create policy "notes_owner_all" on public.notes
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

create index if not exists notes_user_updated_idx
  on public.notes(user_id, pinned desc, updated_at desc);
-- Navigation Management — menus + items with parent/child support
-- Run in Supabase SQL Editor

create table if not exists public.navigation_menus (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null check (location in ('header','footer','utility')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists navigation_menus_location_idx
  on public.navigation_menus(location);

create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.navigation_menus(id) on delete cascade,
  parent_id uuid references public.navigation_items(id) on delete cascade,
  label text not null,
  url text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  opens_new_tab boolean not null default false,
  -- footer column grouping (optional, used when location = 'footer')
  column_group text,
  created_at timestamptz not null default now()
);

create index if not exists navigation_items_menu_sort_idx
  on public.navigation_items(menu_id, parent_id, sort_order);

alter table public.navigation_menus enable row level security;
alter table public.navigation_items enable row level security;

-- Admin write
drop policy if exists "admin_all_navigation_menus" on public.navigation_menus;
create policy "admin_all_navigation_menus" on public.navigation_menus
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admin_all_navigation_items" on public.navigation_items;
create policy "admin_all_navigation_items" on public.navigation_items
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Public read of active menus and their active items
drop policy if exists "public_read_active_navigation_menus" on public.navigation_menus;
create policy "public_read_active_navigation_menus" on public.navigation_menus
  for select to anon, authenticated
  using (is_active = true);

drop policy if exists "public_read_active_navigation_items" on public.navigation_items;
create policy "public_read_active_navigation_items" on public.navigation_items
  for select to anon, authenticated
  using (
    is_active = true and exists (
      select 1 from public.navigation_menus m
      where m.id = navigation_items.menu_id and m.is_active = true
    )
  );

-- Seed default menus + items
do $$
declare
  header_id uuid;
  footer_id uuid;
begin
  -- Header
  if not exists (select 1 from public.navigation_menus where location = 'header') then
    insert into public.navigation_menus (name, location) values ('Header', 'header')
      returning id into header_id;

    insert into public.navigation_items (menu_id, label, url, sort_order) values
      (header_id, 'Shop Vehicles',  '/inventory',      10),
      (header_id, 'Service',        '/service',        20),
      (header_id, 'Collision',      '/collision',      30),
      (header_id, 'Finance Center', '/finance',        40),
      (header_id, 'About Us',       '/about',          50),
      (header_id, 'Why Cavender?',  '/why-cavender',   60),
      (header_id, 'Stories',        '/stories',        70),
      (header_id, 'Español',        '/es',             80),
      (header_id, 'Our Locations',  '/locations',      90);
  end if;

  -- Footer
  if not exists (select 1 from public.navigation_menus where location = 'footer') then
    insert into public.navigation_menus (name, location) values ('Footer', 'footer')
      returning id into footer_id;

    insert into public.navigation_items (menu_id, label, url, sort_order, column_group) values
      (footer_id, 'About Us',        '/about',           10, 'About'),
      (footer_id, 'Why Cavender?',   '/why-cavender',    20, 'About'),
      (footer_id, 'Stories',         '/stories',         30, 'About'),
      (footer_id, 'Our Locations',   '/locations',       40, 'About'),

      (footer_id, 'Finance Center',  '/finance',         10, 'Finance'),
      (footer_id, 'Apply for Credit','/finance/apply',   20, 'Finance'),
      (footer_id, 'Trade Appraisal', '/finance/trade',   30, 'Finance'),

      (footer_id, 'Shop Vehicles',   '/inventory',       10, 'Shop'),
      (footer_id, 'New',             '/inventory/new',   20, 'Shop'),
      (footer_id, 'Used',            '/inventory/used',  30, 'Shop'),
      (footer_id, 'Certified',       '/inventory/certified', 40, 'Shop'),

      (footer_id, 'Service',         '/service',         10, 'Service'),
      (footer_id, 'Schedule Service','/service/schedule',20, 'Service'),
      (footer_id, 'Collision',       '/collision',       30, 'Service'),
      (footer_id, 'Parts',           '/parts',           40, 'Service');
  end if;
end $$;
