-- Feed import run history for admin visibility (service role / admin API only).
create table if not exists public.feed_import_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running',
  files_processed integer not null default 0,
  files_succeeded integer not null default 0,
  files_failed integer not null default 0,
  files_skipped integer not null default 0,
  total_upserted integer not null default 0,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists feed_import_runs_started_at_idx
  on public.feed_import_runs (started_at desc);

create table if not exists public.feed_import_run_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.feed_import_runs (id) on delete cascade,
  file_name text not null,
  store_id uuid references public.stores (id) on delete set null,
  store_name text,
  status text not null,
  rows_processed integer not null default 0,
  upserted integer not null default 0,
  skipped integer not null default 0,
  error_message text,
  skip_reason text,
  store_mapping_source text,
  created_at timestamptz not null default now()
);

create index if not exists feed_import_run_items_run_id_idx
  on public.feed_import_run_items (run_id);

alter table public.feed_import_runs enable row level security;
alter table public.feed_import_run_items enable row level security;

-- No public policies: admin reads via service role only.
