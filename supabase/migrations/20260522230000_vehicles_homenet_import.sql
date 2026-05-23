-- Vehicles inventory + HomeNet import support.
-- If public.vehicles already exists in your project, run only the DO blocks / ALTERs that apply.

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  state text,
  phone text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores (id) on delete set null,
  vin text,
  stock_number text,
  condition text,
  year integer,
  make text,
  model text,
  trim text,
  body_style text,
  exterior_color text,
  interior_color text,
  mileage integer,
  internet_price numeric,
  primary_image_url text,
  status text not null default 'active',
  source_raw jsonb,
  import_source text,
  import_key text,
  imported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicles
  add column if not exists source_raw jsonb,
  add column if not exists import_source text,
  add column if not exists import_key text,
  add column if not exists imported_at timestamptz,
  add column if not exists exterior_color text,
  add column if not exists interior_color text,
  add column if not exists mileage integer;

create unique index if not exists vehicles_import_key_uidx
  on public.vehicles (import_key)
  where import_key is not null and import_key <> '';

create index if not exists vehicles_status_idx on public.vehicles (status);
create index if not exists vehicles_store_id_idx on public.vehicles (store_id);

alter table public.vehicles enable row level security;

drop policy if exists "vehicles_public_read" on public.vehicles;
create policy "vehicles_public_read"
  on public.vehicles
  for select
  to anon, authenticated
  using (status = 'active');
