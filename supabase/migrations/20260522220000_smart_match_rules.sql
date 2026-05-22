-- Lifestyle matching rules for Shop by Life and Smart Match (public read).
create table if not exists public.smart_match_rules (
  id uuid primary key default gen_random_uuid(),
  lifestyle_key text not null,
  priority integer not null default 0,
  label_en text,
  label_es text,
  body_styles text[] not null default '{}',
  makes text[] not null default '{}',
  model_keywords text[] not null default '{}',
  trim_keywords text[] not null default '{}',
  min_price numeric,
  max_price numeric,
  condition text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists smart_match_rules_lifestyle_priority_idx
  on public.smart_match_rules (lifestyle_key, priority)
  where is_active = true;

alter table public.smart_match_rules enable row level security;

drop policy if exists "smart_match_rules_public_read" on public.smart_match_rules;
create policy "smart_match_rules_public_read"
  on public.smart_match_rules
  for select
  to anon, authenticated
  using (is_active = true);

insert into public.smart_match_rules (
  lifestyle_key,
  priority,
  label_en,
  label_es,
  body_styles,
  makes,
  model_keywords,
  trim_keywords,
  min_price,
  max_price,
  condition
) values
  (
    'family',
    10,
    'Spacious SUV or van fit for family and daily life',
    'SUV o van espaciosa para familia y día a día',
    array['suv', 'crossover', 'van', 'minivan', 'wagon'],
    '{}',
    array['traverse', 'yukon', 'tahoe', 'suburban', 'acadia', 'equinox'],
    '{}',
    null,
    null,
    null
  ),
  (
    'work',
    20,
    'Truck or capability-focused match for work and towing',
    'Camioneta o opción con capacidad de trabajo y remolque',
    array['truck', 'pickup'],
    '{}',
    array['sierra', 'silverado', 'f-150', 'ram', 'tundra', 'tacoma'],
    '{}',
    null,
    null,
    null
  ),
  (
    'luxury',
    30,
    'Premium pricing in a luxury band',
    'Precio en rango de lujo',
    '{}',
    '{}',
    '{}',
    '{}',
    45000,
    null,
    null
  ),
  (
    'luxury',
    31,
    'Premium brand or elevated trim',
    'Marca premium o versión elevada',
    '{}',
    array['cadillac', 'land rover', 'jaguar', 'bmw', 'mercedes', 'lexus', 'audi', 'porsche', 'lincoln', 'genesis', 'acura', 'infiniti'],
    '{}',
    array['premium', 'platinum', 'denali', 'escalade'],
    null,
    null,
    null
  ),
  (
    'budget',
    40,
    'Value-forward pricing under $30k',
    'Precio accesible por debajo de $30k',
    '{}',
    '{}',
    '{}',
    '{}',
    null,
    30000,
    null
  ),
  (
    'first',
    50,
    'Approachable pre-owned option for a first vehicle',
    'Seminuevo accesible ideal como primer vehículo',
    '{}',
    '{}',
    '{}',
    '{}',
    null,
    40000,
    'used'
  ),
  (
    'efficient',
    60,
    'Hybrid, electric, or fuel-efficient daily driver',
    'Híbrido, eléctrico o eficiente para el día a día',
    array['hatch', 'sedan'],
    '{}',
    array['hybrid', 'electric', 'ev', 'phev', 'plug-in', 'bolt', 'leaf', 'prius', 'mpg'],
    '{}',
    null,
    35000,
    null
  );
