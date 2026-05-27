-- Multi-provider inventory feed sources: one active provider per dealership (store).

create table if not exists public.inventory_feed_sources (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  provider text not null check (provider in ('homenet', 'vauto')),
  label text not null,
  status text not null default 'configured'
    check (status in ('configured', 'disabled')),
  last_import_at timestamptz,
  last_vehicle_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, provider)
);

create index if not exists inventory_feed_sources_store_id_idx
  on public.inventory_feed_sources (store_id);

create table if not exists public.dealership_inventory_settings (
  store_id uuid primary key references public.stores (id) on delete cascade,
  active_inventory_feed_source_id uuid
    references public.inventory_feed_sources (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.vehicles
  add column if not exists inventory_provider text;

update public.vehicles
set inventory_provider = 'homenet'
where inventory_provider is null
   or inventory_provider = '';

alter table public.vehicles
  alter column inventory_provider set default 'homenet';

alter table public.vehicles
  alter column inventory_provider set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'vehicles_inventory_provider_check'
  ) then
    alter table public.vehicles
      add constraint vehicles_inventory_provider_check
      check (inventory_provider in ('homenet', 'vauto'));
  end if;
end $$;

alter table public.vehicles
  drop constraint if exists vehicles_store_vin_unique;

create unique index if not exists vehicles_store_vin_provider_uidx
  on public.vehicles (store_id, vin, inventory_provider)
  where vin is not null
    and vin <> ''
    and store_id is not null;

create index if not exists vehicles_store_provider_status_idx
  on public.vehicles (store_id, inventory_provider, status);

alter table public.feed_import_runs
  add column if not exists inventory_provider text
    check (inventory_provider is null or inventory_provider in ('homenet', 'vauto')),
  add column if not exists store_id uuid references public.stores (id) on delete set null,
  add column if not exists inventory_feed_source_id uuid
    references public.inventory_feed_sources (id) on delete set null;

create index if not exists feed_import_runs_provider_idx
  on public.feed_import_runs (inventory_provider, started_at desc);

alter table public.inventory_feed_sources enable row level security;
alter table public.dealership_inventory_settings enable row level security;

drop policy if exists "inventory_feed_sources_public_read" on public.inventory_feed_sources;
create policy "inventory_feed_sources_public_read"
  on public.inventory_feed_sources
  for select
  to anon, authenticated
  using (true);

drop policy if exists "dealership_inventory_settings_public_read" on public.dealership_inventory_settings;
create policy "dealership_inventory_settings_public_read"
  on public.dealership_inventory_settings
  for select
  to anon, authenticated
  using (true);

insert into public.inventory_feed_sources (store_id, provider, label, status)
select s.id, p.provider, p.label, 'configured'
from public.stores s
cross join (
  values
    ('homenet'::text, 'HomeNet'),
    ('vauto'::text, 'vAuto')
) as p(provider, label)
on conflict (store_id, provider) do nothing;

insert into public.dealership_inventory_settings (store_id, active_inventory_feed_source_id)
select s.id, ifs.id
from public.stores s
join public.inventory_feed_sources ifs
  on ifs.store_id = s.id and ifs.provider = 'homenet'
where not exists (
  select 1 from public.dealership_inventory_settings dis where dis.store_id = s.id
);

update public.inventory_feed_sources ifs
set last_vehicle_count = c.cnt,
    updated_at = now()
from (
  select store_id, inventory_provider, count(*)::int as cnt
  from public.vehicles
  where status = 'active'
    and store_id is not null
  group by store_id, inventory_provider
) c
where ifs.store_id = c.store_id
  and ifs.provider = c.inventory_provider;
