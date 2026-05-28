-- Stabilization: source switch audit log (additive).

create table if not exists public.inventory_source_switch_log (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  from_feed_source_id uuid references public.inventory_feed_sources (id) on delete set null,
  to_feed_source_id uuid not null references public.inventory_feed_sources (id) on delete cascade,
  from_provider text check (from_provider is null or from_provider in ('homenet', 'vauto')),
  to_provider text not null check (to_provider in ('homenet', 'vauto')),
  homenet_count_at_switch integer not null default 0,
  vauto_count_at_switch integer not null default 0,
  acknowledged_mismatch boolean not null default false,
  switched_at timestamptz not null default now()
);

create index if not exists inventory_source_switch_log_store_idx
  on public.inventory_source_switch_log (store_id, switched_at desc);

alter table public.inventory_source_switch_log enable row level security;

-- Admin / service role only (no public policies).
