-- Forward-only: inventory RLS + vehicle_images read path.
-- Does not drop legacy tables (dealer_groups, feed_sources, vehicle_images, etc.).
-- Import writes remain service-role only (no anon/authenticated INSERT/UPDATE policies).

-- ---------------------------------------------------------------------------
-- vehicles: public may read active rows only
-- ---------------------------------------------------------------------------

alter table public.vehicles enable row level security;

drop policy if exists "vehicles_public_read" on public.vehicles;
create policy "vehicles_public_read"
  on public.vehicles
  for select
  to anon, authenticated
  using (status = 'active');

-- Keep legacy anon-only policy aligned if present
drop policy if exists "public_read_active_vehicles" on public.vehicles;
create policy "public_read_active_vehicles"
  on public.vehicles
  for select
  to anon
  using (status = 'active');

-- ---------------------------------------------------------------------------
-- vehicle_images: readable when parent vehicle is active (legacy table retained)
-- Portal primary path uses vehicles.image_urls; this enables optional joins.
-- ---------------------------------------------------------------------------

alter table public.vehicle_images enable row level security;

create index if not exists vehicle_images_vehicle_sort_idx
  on public.vehicle_images (vehicle_id, sort_order);

drop policy if exists "vehicle_images_public_read_active" on public.vehicle_images;
create policy "vehicle_images_public_read_active"
  on public.vehicle_images
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.vehicles v
      where v.id = vehicle_images.vehicle_id
        and v.status = 'active'
    )
  );

-- ---------------------------------------------------------------------------
-- Source registry: public read (active-provider resolution on every page)
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- Feed file mappings: public read (store resolution helpers may use anon)
-- Writes: service role / admin only (no public write policy)
-- ---------------------------------------------------------------------------

alter table public.feed_file_mappings enable row level security;

drop policy if exists "feed_file_mappings_public_read" on public.feed_file_mappings;
create policy "feed_file_mappings_public_read"
  on public.feed_file_mappings
  for select
  to anon, authenticated
  using (true);

-- Remove overly broad authenticated write if present (imports use service role).
-- Legacy policy name from live DB; dropping is safe — CMS admin uses service role.
drop policy if exists "feed_file_mappings write authenticated" on public.feed_file_mappings;
drop policy if exists "feed_file_mappings_write_authenticated" on public.feed_file_mappings;

-- ---------------------------------------------------------------------------
-- Import logs / pipeline: NOT publicly readable
-- Admin UI uses getSupabaseAdmin() (service role). Legacy app_role policies kept.
-- ---------------------------------------------------------------------------

alter table public.feed_import_runs enable row level security;
alter table public.feed_import_run_items enable row level security;
alter table public.raw_feed_archives enable row level security;
alter table public.inventory_import_failures enable row level security;
alter table public.inventory_snapshots enable row level security;
alter table public.feed_import_schedules enable row level security;
alter table public.inventory_source_switch_log enable row level security;

-- Explicitly ensure no anon SELECT policies on import audit tables.
drop policy if exists "feed_import_runs_public_read" on public.feed_import_runs;
drop policy if exists "feed_import_run_items_public_read" on public.feed_import_run_items;
drop policy if exists "raw_feed_archives_public_read" on public.raw_feed_archives;
drop policy if exists "inventory_import_failures_public_read" on public.inventory_import_failures;
drop policy if exists "inventory_snapshots_public_read" on public.inventory_snapshots;
drop policy if exists "feed_import_schedules_public_read" on public.feed_import_schedules;

-- ---------------------------------------------------------------------------
-- Legacy tables retained (DO NOT DROP) — documented for operators
-- ---------------------------------------------------------------------------

comment on table public.vehicle_images is
  'LEGACY retained. Portal merchandising uses vehicles.image_urls jsonb. Kept for rollback / optional GEO-parity image rows.';

comment on table public.vehicle_pricing_history is
  'LEGACY retained. Not written by current Auto Portal importer. Do not drop during HomeNet→vAuto cutover.';

comment on table public.feed_sources is
  'LEGACY retained (Lovable-era). Portal uses inventory_feed_sources. Do not drop during transition.';

comment on table public.feed_field_mappings is
  'LEGACY retained (Lovable-era field maps). Portal uses feed_file_mappings + code aliases. Do not drop during transition.';

comment on table public.dealer_groups is
  'LEGACY retained. Auto Portal dealership identity is public.stores. Do not drop during transition.';

comment on table public.smart_match_config is
  'LEGACY retained. Portal Smart Match uses smart_match_rules. Do not drop during transition.';
