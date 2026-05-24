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
