-- JLR inventory audience architecture: pool store + audiences + mapping fix.
-- Auto Portal only. Does not delete HomeNet data or switch providers.

-- ---------------------------------------------------------------------------
-- 1) Store role: dealership (public) vs inventory_pool (internal owner)
-- ---------------------------------------------------------------------------
alter table public.stores
  add column if not exists inventory_role text not null default 'dealership';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'stores_inventory_role_check'
  ) then
    alter table public.stores
      add constraint stores_inventory_role_check
      check (inventory_role in ('dealership', 'inventory_pool'));
  end if;
end $$;

comment on column public.stores.inventory_role is
  'dealership = public site; inventory_pool = hidden physical inventory owner (e.g. JLR shared feed)';

create index if not exists stores_inventory_role_idx
  on public.stores (inventory_role);

-- ---------------------------------------------------------------------------
-- 2) Dedicated JLR pool store (fixed UUID for stable references)
-- ---------------------------------------------------------------------------
insert into public.stores (
  id,
  name,
  city,
  state,
  phone,
  website,
  is_active,
  inventory_role
)
values (
  'b7e1c2a0-4f11-4b2a-9c3d-11a22b33c44d',
  'JLR San Antonio Inventory Pool',
  'San Antonio',
  'TX',
  null,
  null,
  true,
  'inventory_pool'
)
on conflict (id) do update
set
  name = excluded.name,
  inventory_role = 'inventory_pool',
  is_active = true;

-- Ensure feed sources exist for the pool (HomeNet + vAuto); do not activate vAuto.
insert into public.inventory_feed_sources (store_id, provider, label, status)
select
  'b7e1c2a0-4f11-4b2a-9c3d-11a22b33c44d',
  p.provider,
  p.label,
  'configured'
from (
  values
    ('homenet'::text, 'HomeNet'),
    ('vauto'::text, 'vAuto')
) as p(provider, label)
on conflict (store_id, provider) do nothing;

insert into public.dealership_inventory_settings (store_id, active_inventory_feed_source_id)
select
  'b7e1c2a0-4f11-4b2a-9c3d-11a22b33c44d',
  ifs.id
from public.inventory_feed_sources ifs
where ifs.store_id = 'b7e1c2a0-4f11-4b2a-9c3d-11a22b33c44d'
  and ifs.provider = 'homenet'
on conflict (store_id) do nothing;

-- ---------------------------------------------------------------------------
-- 3) inventory_audiences
-- ---------------------------------------------------------------------------
create table if not exists public.inventory_audiences (
  id uuid primary key default gen_random_uuid(),
  audience_key text not null unique,
  label text not null,
  site_store_id uuid not null references public.stores (id) on delete cascade,
  source_store_id uuid not null references public.stores (id) on delete restrict,
  rules jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_store_id)
);

create index if not exists inventory_audiences_source_store_id_idx
  on public.inventory_audiences (source_store_id);

create index if not exists inventory_audiences_active_idx
  on public.inventory_audiences (is_active)
  where is_active = true;

comment on table public.inventory_audiences is
  'Maps a public site store to a physical inventory pool + query-time audience rules. Does not duplicate vehicles.';

alter table public.inventory_audiences enable row level security;

drop policy if exists "inventory_audiences_public_read" on public.inventory_audiences;
create policy "inventory_audiences_public_read"
  on public.inventory_audiences
  for select
  to anon, authenticated
  using (is_active = true);

-- Seed Jaguar / Land Rover audiences (site stores must exist).
insert into public.inventory_audiences (
  audience_key,
  label,
  site_store_id,
  source_store_id,
  rules,
  is_active
)
select
  'jaguar',
  'Jaguar San Antonio audience',
  s.id,
  'b7e1c2a0-4f11-4b2a-9c3d-11a22b33c44d',
  jsonb_build_object(
    'version', 1,
    'include_used', true,
    'include_cpo_as_used', true,
    'new_make_any_of', jsonb_build_array('jaguar'),
    'new_land_rover_family', false
  ),
  true
from public.stores s
where s.name = 'Jaguar San Antonio'
on conflict (audience_key) do update
set
  site_store_id = excluded.site_store_id,
  source_store_id = excluded.source_store_id,
  rules = excluded.rules,
  is_active = true,
  updated_at = now();

insert into public.inventory_audiences (
  audience_key,
  label,
  site_store_id,
  source_store_id,
  rules,
  is_active
)
select
  'land_rover',
  'Land Rover San Antonio audience',
  s.id,
  'b7e1c2a0-4f11-4b2a-9c3d-11a22b33c44d',
  jsonb_build_object(
    'version', 1,
    'include_used', true,
    'include_cpo_as_used', true,
    'new_make_any_of', jsonb_build_array('land rover', 'landrover', 'range rover'),
    'new_land_rover_family', true
  ),
  true
from public.stores s
where s.name = 'Land Rover San Antonio'
on conflict (audience_key) do update
set
  site_store_id = excluded.site_store_id,
  source_store_id = excluded.source_store_id,
  rules = excluded.rules,
  is_active = true,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 4) Feed mapping: single file → pool; disable dual Jaguar/LR mappings
-- ---------------------------------------------------------------------------
update public.feed_file_mappings ffm
set
  is_active = false,
  notes = coalesce(notes || ' ', '') ||
    '[disabled] JLR shared file now maps to inventory pool only.',
  updated_at = now()
from public.stores s
where ffm.store_id = s.id
  and ffm.file_pattern = 'JaguarLandRoverofSanAntonio'
  and s.inventory_role = 'dealership';

-- No unique (file_pattern, store_id) constraint — upsert manually.
insert into public.feed_file_mappings (
  file_pattern,
  store_id,
  is_active,
  notes,
  inventory_provider
)
select
  'JaguarLandRoverofSanAntonio',
  'b7e1c2a0-4f11-4b2a-9c3d-11a22b33c44d',
  true,
  'Shared Jaguar/Land Rover vAuto file → JLR inventory pool (audiences derive virtual sites).',
  'vauto'
where not exists (
  select 1
  from public.feed_file_mappings ffm
  where ffm.file_pattern = 'JaguarLandRoverofSanAntonio'
    and ffm.store_id = 'b7e1c2a0-4f11-4b2a-9c3d-11a22b33c44d'
);

update public.feed_file_mappings
set
  is_active = true,
  notes = 'Shared Jaguar/Land Rover vAuto file → JLR inventory pool (audiences derive virtual sites).',
  inventory_provider = 'vauto',
  updated_at = now()
where file_pattern = 'JaguarLandRoverofSanAntonio'
  and store_id = 'b7e1c2a0-4f11-4b2a-9c3d-11a22b33c44d';
