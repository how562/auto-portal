-- Managed Links — canonical store for every UI link/button in the system.
-- Admin Link Control Panel reads/writes this table. Public site reads later.

create table if not exists public.managed_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  location text not null
    check (location in ('header','footer','homepage','inventory','vdp')),
  link_type text not null default 'route'
    check (link_type in ('route','scroll','modal','external')),
  destination text,         -- /path, #anchor, https://…  (null when type=modal)
  action_key text,          -- modal/action identifier (null when type≠modal)
  is_active boolean not null default true,
  sort_order integer not null default 0,
  notes text,
  status text not null default 'ok'
    check (status in ('ok','broken','missing','needs_decision')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists managed_links_location_sort_idx
  on public.managed_links(location, sort_order);
create index if not exists managed_links_status_idx
  on public.managed_links(status) where status <> 'ok';

alter table public.managed_links enable row level security;

-- Admin: full access
drop policy if exists "admin_all_managed_links" on public.managed_links;
create policy "admin_all_managed_links" on public.managed_links
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Public read of active links (so the public site can consume later)
drop policy if exists "public_read_active_managed_links" on public.managed_links;
create policy "public_read_active_managed_links" on public.managed_links
  for select to anon, authenticated
  using (is_active = true);

-- Auto-touch updated_at
create or replace function public.managed_links_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists managed_links_updated_at on public.managed_links;
create trigger managed_links_updated_at before update on public.managed_links
  for each row execute function public.managed_links_touch_updated_at();

-- Backfill from link_audit if present and managed_links is empty.
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema='public' and table_name='link_audit')
     and not exists (select 1 from public.managed_links) then
    insert into public.managed_links
      (label, location, link_type, destination, action_key, is_active, sort_order, notes, status)
    select
      label,
      group_name,
      link_type,
      case when link_type = 'modal' then null else url end,
      case when link_type = 'modal' then url else null end,
      is_active,
      sort_order,
      notes,
      status
    from public.link_audit;
  end if;
end $$;

-- Seed defaults only if still empty (no link_audit available)
do $$
begin
  if not exists (select 1 from public.managed_links) then
    insert into public.managed_links (location, label, link_type, destination, action_key, status, sort_order) values
      ('header','Shop Vehicles','route','/inventory',null,'ok',10),
      ('header','Service','route','/service',null,'ok',20),
      ('header','Finance Center','route','/finance',null,'ok',30),
      ('header','About Us','route','/about',null,'ok',40),
      ('header','Our Locations','route','/locations',null,'ok',50),

      ('footer','About Us','route','/about',null,'ok',10),
      ('footer','Stories','route','/stories',null,'ok',20),
      ('footer','Finance Center','route','/finance',null,'ok',30),
      ('footer','Apply for Credit','route','/finance/apply',null,'missing',40),
      ('footer','Schedule Service','route','/service/schedule',null,'missing',50),

      ('homepage','Hero CTA — Shop Now','route','/inventory',null,'ok',10),
      ('homepage','Shop by Life','scroll','#shop-by-life',null,'ok',20),
      ('homepage','Smart Match modal','modal',null,'smart-match','needs_decision',30),

      ('inventory','Vehicle card → VDP','route','/inventory/$vin',null,'ok',10),
      ('inventory','Sort dropdown','modal',null,'sort','ok',20),
      ('inventory','Compare drawer','modal',null,'compare','needs_decision',30),

      ('vdp','Photo gallery','modal',null,'gallery','ok',10),
      ('vdp','Get ePrice','modal',null,'eprice','ok',20),
      ('vdp','Apply for financing','route','/finance/apply',null,'missing',30),
      ('vdp','Window sticker','external',null,null,'broken',40);
  end if;
end $$;
