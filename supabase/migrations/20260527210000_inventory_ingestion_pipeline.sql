-- Provider-agnostic ingestion pipeline tables (vAuto intake + future normalization).

-- Alias note: `inventory_feed_sources` is the live "inventory_sources" registry per store.

alter table public.inventory_feed_sources
  add column if not exists last_intake_at timestamptz,
  add column if not exists last_error_message text;

alter table public.feed_import_runs
  add column if not exists run_kind text not null default 'import'
    check (run_kind in ('import', 'intake', 'reconcile'));

comment on column public.feed_import_runs.run_kind is
  'import = parse+upsert; intake = SFTP discovery/archive only; reconcile = missing/sold pass';

-- Raw files as received (SFTP path and/or object storage reference before parse).
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

-- Row/file/run-level failures (separate from feed_import_run_items summaries).
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
  import_key text,
  error_code text,
  error_message text not null,
  created_at timestamptz not null default now()
);

create index if not exists inventory_import_failures_run_id_idx
  on public.inventory_import_failures (feed_import_run_id);

-- Point-in-time inventory counts per provider (future diff / history).
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

-- Scheduled import metadata (cron / external scheduler hooks).
create table if not exists public.feed_import_schedules (
  id uuid primary key default gen_random_uuid(),
  inventory_provider text not null
    check (inventory_provider in ('homenet', 'vauto')),
  store_id uuid references public.stores (id) on delete cascade,
  cron_expression text,
  is_enabled boolean not null default false,
  last_triggered_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.raw_feed_archives enable row level security;
alter table public.inventory_import_failures enable row level security;
alter table public.inventory_snapshots enable row level security;
alter table public.feed_import_schedules enable row level security;

-- Service role / admin API only (no public policies).
