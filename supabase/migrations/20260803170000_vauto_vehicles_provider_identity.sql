-- Forward-only: prepare vehicles for portal-owned vAuto + HomeNet transition.
-- Preserves all existing HomeNet-era rows; does not delete inventory data.
--
-- Goals:
--   * backfill null inventory_provider → homenet
--   * provider-aware VIN uniqueness (replace legacy store+vin unique)
--   * stock-number uniqueness when VIN is absent
--   * ensure last_seen_at / imported_at / import_source / is_active usable
--   * indexes for active inventory + provider lookups

-- ---------------------------------------------------------------------------
-- Columns the importer / transition need
-- ---------------------------------------------------------------------------

alter table public.vehicles
  add column if not exists last_seen_at timestamptz;

alter table public.vehicles
  add column if not exists imported_at timestamptz;

alter table public.vehicles
  add column if not exists import_source text;

alter table public.vehicles
  add column if not exists inventory_provider text;

alter table public.vehicles
  add column if not exists import_key text;

alter table public.vehicles
  add column if not exists source_raw jsonb;

alter table public.vehicles
  add column if not exists image_urls jsonb;

comment on column public.vehicles.last_seen_at is
  'Refreshed on each successful import sighting; used for soft-deactivate of missing feed rows.';

comment on column public.vehicles.imported_at is
  'Timestamp of the most recent successful upsert for this vehicle row.';

comment on column public.vehicles.import_source is
  'Feed/import pipeline label (e.g. homenet_dealer_send, vauto).';

comment on column public.vehicles.inventory_provider is
  'Physical feed provider for this row: homenet | vauto. Public reads filter by the store active provider.';

comment on column public.vehicles.status is
  'Lifecycle flag used by Auto Portal (active | inactive | missing). Prefer this over any boolean.';

-- Portal “is_active” convenience for GEO-style queries / future importer.
-- Derived from status so HomeNet rollback rows stay consistent without dual writes.
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'vehicles'
      and column_name = 'is_active'
  ) then
    alter table public.vehicles
      add column is_active boolean
      generated always as (status = 'active') stored;
  end if;
end $$;

comment on column public.vehicles.is_active is
  'Generated: true when status = active. Do not write directly; update status instead.';

-- Allow stock-only rows (VIN absent) for future vAuto matching rules.
-- Existing rows all have VINs; this does not clear them.
alter table public.vehicles
  alter column vin drop not null;

-- ---------------------------------------------------------------------------
-- Backfill provider + timestamps (HomeNet preserved)
-- ---------------------------------------------------------------------------

update public.vehicles
set inventory_provider = 'homenet'
where inventory_provider is null
   or btrim(inventory_provider) = '';

update public.vehicles
set import_source = coalesce(nullif(btrim(import_source), ''), 'homenet_dealer_send')
where inventory_provider = 'homenet'
  and (import_source is null or btrim(import_source) = '');

update public.vehicles
set last_seen_at = coalesce(last_seen_at, imported_at, updated_at, created_at)
where last_seen_at is null;

update public.vehicles
set imported_at = coalesce(imported_at, last_seen_at, updated_at, created_at)
where imported_at is null;

alter table public.vehicles
  alter column inventory_provider set default 'homenet';

alter table public.vehicles
  alter column inventory_provider set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'vehicles_inventory_provider_check'
  ) then
    alter table public.vehicles
      add constraint vehicles_inventory_provider_check
      check (inventory_provider in ('homenet', 'vauto'));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Replace legacy unique (store_id, vin) with provider-aware strategy
-- ---------------------------------------------------------------------------

alter table public.vehicles
  drop constraint if exists vehicles_store_vin_unique;

drop index if exists public.vehicles_store_vin_unique;

-- VIN-first identity per store + provider (empty VIN excluded → stock index below).
create unique index if not exists vehicles_store_vin_provider_uidx
  on public.vehicles (store_id, vin, inventory_provider)
  where store_id is not null
    and vin is not null
    and btrim(vin) <> '';

-- Stock fallback identity when VIN is absent.
create unique index if not exists vehicles_store_stock_provider_uidx
  on public.vehicles (store_id, stock_number, inventory_provider)
  where store_id is not null
    and stock_number is not null
    and btrim(stock_number) <> ''
    and (vin is null or btrim(vin) = '');

-- Lookups / active inventory
create index if not exists vehicles_store_provider_status_idx
  on public.vehicles (store_id, inventory_provider, status);

create index if not exists vehicles_store_provider_vin_idx
  on public.vehicles (store_id, inventory_provider, vin)
  where vin is not null and btrim(vin) <> '';

create index if not exists vehicles_store_provider_stock_idx
  on public.vehicles (store_id, inventory_provider, stock_number)
  where stock_number is not null and btrim(stock_number) <> '';

create index if not exists vehicles_active_provider_store_idx
  on public.vehicles (inventory_provider, store_id, imported_at desc)
  where status = 'active';

create index if not exists vehicles_last_seen_at_idx
  on public.vehicles (store_id, inventory_provider, last_seen_at desc);

create index if not exists vehicles_import_key_uidx
  on public.vehicles (import_key)
  where import_key is not null and btrim(import_key) <> '';

-- ---------------------------------------------------------------------------
-- Refresh cached counts after provider backfill (rollback-friendly metadata)
-- ---------------------------------------------------------------------------

update public.inventory_feed_sources ifs
set last_vehicle_count = (
      select count(*)::int
      from public.vehicles v
      where v.store_id = ifs.store_id
        and v.inventory_provider = ifs.provider
        and v.status = 'active'
    ),
    updated_at = now();
