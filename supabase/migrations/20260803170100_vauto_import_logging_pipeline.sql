-- Forward-only: align import-run logging + pipeline tables with app writers.
-- Preserves historical HomeNet / legacy Lovable run rows (legacy columns kept).
--
-- App writers (must succeed after this migration):
--   lib/feedImportRunLog.ts → feed_import_runs + feed_import_run_items (run_id)
--   lib/rawFeedArchive.ts → raw_feed_archives + inventory_import_failures
--   lib/inventorySnapshots.ts → inventory_snapshots

-- ---------------------------------------------------------------------------
-- inventory_feed_sources: intake metadata
-- ---------------------------------------------------------------------------

alter table public.inventory_feed_sources
  add column if not exists last_intake_at timestamptz,
  add column if not exists last_error_message text;

comment on column public.inventory_feed_sources.last_intake_at is
  'Last SFTP discovery/archive intake (may precede a full import).';

-- ---------------------------------------------------------------------------
-- feed_import_runs: portal columns + trigger source (legacy counters retained)
-- ---------------------------------------------------------------------------

alter table public.feed_import_runs
  add column if not exists inventory_provider text,
  add column if not exists store_id uuid references public.stores (id) on delete set null,
  add column if not exists inventory_feed_source_id uuid
    references public.inventory_feed_sources (id) on delete set null,
  add column if not exists run_kind text,
  add column if not exists trigger_source text,
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists files_processed integer default 0,
  add column if not exists files_succeeded integer default 0,
  add column if not exists files_failed integer default 0,
  add column if not exists files_skipped integer default 0,
  add column if not exists total_upserted integer default 0,
  add column if not exists error_message text;

-- Defaults for new portal runs
update public.feed_import_runs
set started_at = coalesce(started_at, created_at, now())
where started_at is null;

alter table public.feed_import_runs
  alter column started_at set default now();

update public.feed_import_runs
set run_kind = coalesce(run_kind, 'import')
where run_kind is null;

alter table public.feed_import_runs
  alter column run_kind set default 'import';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'feed_import_runs_run_kind_check'
  ) then
    alter table public.feed_import_runs
      add constraint feed_import_runs_run_kind_check
      check (run_kind in ('import', 'intake', 'reconcile'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'feed_import_runs_inventory_provider_check'
  ) then
    alter table public.feed_import_runs
      add constraint feed_import_runs_inventory_provider_check
      check (
        inventory_provider is null
        or inventory_provider in ('homenet', 'vauto')
      );
  end if;
end $$;

-- Historical rows: leave inventory_provider null (unknown / pre-portal).
-- New writers always set homenet|vauto.

comment on column public.feed_import_runs.trigger_source is
  'What kicked off the run: cron | manual | api | edge | inline_csv | unknown.';

comment on column public.feed_import_runs.run_kind is
  'import = parse+upsert; intake = SFTP discovery/archive only; reconcile = missing/sold pass.';

-- Portal writers use running|success|partial|failed; legacy used pending|success|failed.
alter table public.feed_import_runs
  drop constraint if exists feed_import_runs_status_check;

alter table public.feed_import_runs
  add constraint feed_import_runs_status_check
  check (
    status in ('pending', 'running', 'success', 'partial', 'failed')
  );

alter table public.feed_import_runs
  alter column status set default 'running';

comment on column public.feed_import_runs.status is
  'Portal: running|success|partial|failed. Legacy pending retained for historical rows.';

create index if not exists feed_import_runs_started_at_idx
  on public.feed_import_runs (started_at desc);

create index if not exists feed_import_runs_provider_started_idx
  on public.feed_import_runs (inventory_provider, started_at desc);

create index if not exists feed_import_runs_status_started_idx
  on public.feed_import_runs (status, started_at desc);

create index if not exists feed_import_runs_run_kind_idx
  on public.feed_import_runs (run_kind, started_at desc);

-- ---------------------------------------------------------------------------
-- feed_import_run_items: dual-write compat with legacy Lovable columns
-- ---------------------------------------------------------------------------

alter table public.feed_import_run_items
  add column if not exists run_id uuid,
  add column if not exists file_name text,
  add column if not exists store_id uuid references public.stores (id) on delete set null,
  add column if not exists store_name text,
  add column if not exists status text,
  add column if not exists rows_processed integer default 0,
  add column if not exists upserted integer default 0,
  add column if not exists skipped integer default 0,
  add column if not exists error_message text,
  add column if not exists skip_reason text,
  add column if not exists store_mapping_source text;

-- Backfill portal run_id from legacy import_run_id
update public.feed_import_run_items
set run_id = import_run_id
where run_id is null
  and import_run_id is not null;

-- Backfill legacy import_run_id from portal run_id (if any orphan portal rows)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'feed_import_run_items'
      and column_name = 'import_run_id'
  ) then
    execute $sql$
      update public.feed_import_run_items
      set import_run_id = run_id
      where import_run_id is null
        and run_id is not null
    $sql$;
  end if;
end $$;

-- FK for portal run_id (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'feed_import_run_items_run_id_fkey'
  ) then
    alter table public.feed_import_run_items
      add constraint feed_import_run_items_run_id_fkey
      foreign key (run_id) references public.feed_import_runs (id) on delete cascade;
  end if;
exception
  when others then
    raise notice 'feed_import_run_items_run_id_fkey skipped: %', sqlerrm;
end $$;

create index if not exists feed_import_run_items_run_id_idx
  on public.feed_import_run_items (run_id);

create index if not exists feed_import_run_items_import_run_id_idx
  on public.feed_import_run_items (import_run_id);

-- Expand/relax legacy action check so file-summary portal inserts can coexist.
-- Portal writers send status (success|skipped|failed) and omit action.
alter table public.feed_import_run_items
  alter column action drop not null;

alter table public.feed_import_run_items
  drop constraint if exists feed_import_run_items_action_check;

alter table public.feed_import_run_items
  add constraint feed_import_run_items_action_check
  check (
    action is null
    or action in (
      'created', 'updated', 'missing', 'failed',
      'success', 'skipped', 'partial', 'running'
    )
  );

-- Allow portal inserts that only set run_id (legacy import_run_id NOT NULL).
alter table public.feed_import_run_items
  alter column import_run_id drop not null;

create or replace function public.feed_import_run_items_compat_bi()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.run_id is null and new.import_run_id is not null then
    new.run_id := new.import_run_id;
  end if;

  if new.import_run_id is null and new.run_id is not null then
    new.import_run_id := new.run_id;
  end if;

  if new.action is null then
    new.action := case lower(coalesce(new.status, ''))
      when 'success' then 'updated'
      when 'skipped' then 'missing'
      when 'failed' then 'failed'
      when 'partial' then 'updated'
      when 'created' then 'created'
      when 'updated' then 'updated'
      when 'missing' then 'missing'
      else 'updated'
    end;
  end if;

  if new.status is null and new.action is not null then
    new.status := new.action;
  end if;

  if new.file_name is null then
    new.file_name := coalesce(new.message, '');
  end if;

  return new;
end;
$$;

drop trigger if exists feed_import_run_items_compat_bi on public.feed_import_run_items;
create trigger feed_import_run_items_compat_bi
  before insert or update on public.feed_import_run_items
  for each row
  execute function public.feed_import_run_items_compat_bi();

comment on function public.feed_import_run_items_compat_bi() is
  'Keeps legacy import_run_id/action in sync with portal run_id/status writers during HomeNet→vAuto transition.';

-- ---------------------------------------------------------------------------
-- Pipeline tables (idempotent; may already exist from 20260527210000)
-- ---------------------------------------------------------------------------

create table if not exists public.raw_feed_archives (
  id uuid primary key default gen_random_uuid(),
  feed_import_run_id uuid references public.feed_import_runs (id) on delete set null,
  inventory_feed_source_id uuid references public.inventory_feed_sources (id) on delete set null,
  store_id uuid references public.stores (id) on delete set null,
  inventory_provider text not null
    check (inventory_provider in ('homenet', 'vauto')),
  file_name text not null,
  remote_path text,
  file_format text,
  byte_size bigint,
  checksum_sha256 text,
  storage_kind text not null default 'sftp_retained'
    check (storage_kind in ('sftp_retained', 'supabase_storage', 'inline_pending')),
  storage_path text,
  parse_status text not null default 'pending'
    check (parse_status in ('pending', 'inspected', 'parsed', 'failed', 'skipped')),
  received_at timestamptz not null default now(),
  archived_at timestamptz not null default now(),
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists raw_feed_archives_provider_received_idx
  on public.raw_feed_archives (inventory_provider, received_at desc);

create index if not exists raw_feed_archives_run_id_idx
  on public.raw_feed_archives (feed_import_run_id);

create index if not exists raw_feed_archives_remote_path_idx
  on public.raw_feed_archives (remote_path)
  where remote_path is not null;

create table if not exists public.inventory_import_failures (
  id uuid primary key default gen_random_uuid(),
  feed_import_run_id uuid references public.feed_import_runs (id) on delete cascade,
  raw_feed_archive_id uuid references public.raw_feed_archives (id) on delete set null,
  inventory_provider text not null
    check (inventory_provider in ('homenet', 'vauto')),
  store_id uuid references public.stores (id) on delete set null,
  failure_scope text not null
    check (failure_scope in ('run', 'file', 'row')),
  file_name text,
  row_number integer,
  vin text,
  stock_number text,
  import_key text,
  error_code text,
  error_message text not null,
  created_at timestamptz not null default now()
);

-- stock_number may be missing on older table copies — add if needed
alter table public.inventory_import_failures
  add column if not exists stock_number text;

create index if not exists inventory_import_failures_run_id_idx
  on public.inventory_import_failures (feed_import_run_id);

create index if not exists inventory_import_failures_provider_created_idx
  on public.inventory_import_failures (inventory_provider, created_at desc);

create index if not exists inventory_import_failures_scope_idx
  on public.inventory_import_failures (failure_scope, created_at desc);

create table if not exists public.inventory_snapshots (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  inventory_provider text not null
    check (inventory_provider in ('homenet', 'vauto')),
  feed_import_run_id uuid references public.feed_import_runs (id) on delete set null,
  snapshot_at timestamptz not null default now(),
  active_vehicle_count integer not null default 0,
  storage_ref text,
  created_at timestamptz not null default now()
);

create index if not exists inventory_snapshots_store_provider_idx
  on public.inventory_snapshots (store_id, inventory_provider, snapshot_at desc);

create table if not exists public.feed_import_schedules (
  id uuid primary key default gen_random_uuid(),
  inventory_provider text not null
    check (inventory_provider in ('homenet', 'vauto')),
  store_id uuid references public.stores (id) on delete cascade,
  cron_expression text,
  is_enabled boolean not null default false,
  last_triggered_at timestamptz,
  next_run_at timestamptz,
  trigger_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.feed_import_schedules
  add column if not exists trigger_source text;

create index if not exists feed_import_schedules_provider_enabled_idx
  on public.feed_import_schedules (inventory_provider, is_enabled);

-- ---------------------------------------------------------------------------
-- Dealership ↔ feed-file mappings: optional provider scope
-- ---------------------------------------------------------------------------

alter table public.feed_file_mappings
  add column if not exists inventory_provider text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'feed_file_mappings_inventory_provider_check'
  ) then
    alter table public.feed_file_mappings
      add constraint feed_file_mappings_inventory_provider_check
      check (
        inventory_provider is null
        or inventory_provider in ('homenet', 'vauto')
      );
  end if;
end $$;

comment on column public.feed_file_mappings.inventory_provider is
  'Optional provider scope. NULL = mapping applies to any provider (legacy HomeNet behavior).';

-- Prefer provider-aware uniqueness while keeping null-provider legacy rows unique per store+pattern.
drop index if exists public.feed_file_mappings_pattern_store_uniq;

create unique index if not exists feed_file_mappings_pattern_store_provider_uniq
  on public.feed_file_mappings (
    file_pattern,
    store_id,
    (coalesce(inventory_provider, ''))
  );

create index if not exists feed_file_mappings_provider_active_idx
  on public.feed_file_mappings (inventory_provider, is_active)
  where is_active = true;
