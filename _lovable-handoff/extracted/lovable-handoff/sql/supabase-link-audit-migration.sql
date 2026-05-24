-- Link Audit / Control Panel — source of truth for every UI link
-- Run in Supabase SQL Editor

create table if not exists public.link_audit (
  id uuid primary key default gen_random_uuid(),
  group_name text not null check (group_name in ('header','footer','homepage','inventory','vdp')),
  label text not null,
  link_type text not null default 'route'
    check (link_type in ('route','scroll','modal','external')),
  url text,
  status text not null default 'ok'
    check (status in ('ok','broken','missing','needs_decision')),
  notes text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists link_audit_group_idx on public.link_audit(group_name, sort_order);
create index if not exists link_audit_status_idx on public.link_audit(status) where status <> 'ok';

alter table public.link_audit enable row level security;

drop policy if exists "admin_all_link_audit" on public.link_audit;
create policy "admin_all_link_audit" on public.link_audit
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Seed (idempotent: only inserts if table is empty)
do $$
begin
  if not exists (select 1 from public.link_audit) then
    insert into public.link_audit (group_name, label, link_type, url, status, sort_order) values
      -- Header
      ('header','Shop Vehicles','route','/inventory','ok',10),
      ('header','Service','route','/service','ok',20),
      ('header','Collision','route','/collision','ok',30),
      ('header','Finance Center','route','/finance','ok',40),
      ('header','About Us','route','/about','ok',50),
      ('header','Why Cavender?','route','/why-cavender','ok',60),
      ('header','Stories','route','/stories','ok',70),
      ('header','Español','route','/es','needs_decision',80),
      ('header','Our Locations','route','/locations','ok',90),

      -- Footer
      ('footer','About Us','route','/about','ok',10),
      ('footer','Why Cavender?','route','/why-cavender','ok',20),
      ('footer','Stories','route','/stories','ok',30),
      ('footer','Our Locations','route','/locations','ok',40),
      ('footer','Finance Center','route','/finance','ok',50),
      ('footer','Apply for Credit','route','/finance/apply','missing',60),
      ('footer','Trade Appraisal','route','/finance/trade','missing',70),
      ('footer','Schedule Service','route','/service/schedule','missing',80),
      ('footer','Parts','route','/parts','needs_decision',90),

      -- Homepage sections
      ('homepage','Hero CTA — Shop Now','route','/inventory','ok',10),
      ('homepage','Hero CTA — Get Pre-Approved','route','/finance/apply','missing',20),
      ('homepage','Shop by Life','scroll','#shop-by-life','ok',30),
      ('homepage','Featured Vehicles','scroll','#featured','ok',40),
      ('homepage','Smart Match modal','modal','smart-match','needs_decision',50),
      ('homepage','Newsletter signup','modal','newsletter','needs_decision',60),

      -- Inventory (listing page)
      ('inventory','Filter: Body Style','modal','filter-body-style','ok',10),
      ('inventory','Filter: Price','modal','filter-price','ok',20),
      ('inventory','Filter: Make','modal','filter-make','ok',30),
      ('inventory','Sort dropdown','modal','sort','ok',40),
      ('inventory','Vehicle card → VDP','route','/inventory/$vin','ok',50),
      ('inventory','Compare drawer','modal','compare','needs_decision',60),
      ('inventory','Save search','modal','save-search','needs_decision',70),

      -- VDP (vehicle detail page)
      ('vdp','Photo gallery','modal','gallery','ok',10),
      ('vdp','Get ePrice','modal','eprice','ok',20),
      ('vdp','Schedule test drive','modal','test-drive','ok',30),
      ('vdp','Apply for financing','route','/finance/apply','missing',40),
      ('vdp','Value your trade','route','/finance/trade','missing',50),
      ('vdp','Contact dealer','modal','contact-dealer','ok',60),
      ('vdp','Window sticker','external',null,'broken',70),
      ('vdp','CarFax report','external',null,'broken',80),
      ('vdp','Share vehicle','modal','share','ok',90);
  end if;
end $$;

-- Auto-touch updated_at
create or replace function public.link_audit_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists link_audit_updated_at on public.link_audit;
create trigger link_audit_updated_at before update on public.link_audit
  for each row execute function public.link_audit_touch_updated_at();
