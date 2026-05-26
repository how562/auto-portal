-- Branding CMS tables (editable brand-reference data; global UI tokens remain in globals.css).

create table if not exists public.branding_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_type text not null,
  variant text not null default 'any',
  file_url text not null,
  alt_text text,
  usage_notes text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branding_colors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  token_name text,
  hex text not null,
  rgb text,
  usage_note text,
  category text not null default 'neutral',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branding_typography (
  id uuid primary key default gen_random_uuid(),
  font_role text not null,
  font_family text not null,
  fallback_stack text,
  font_weights text,
  usage_notes text,
  example_preview text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branding_messaging (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'voice',
  body text not null,
  usage_notes text,
  applies_to text not null default 'group-wide',
  dealership_name text,
  oem text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branding_disclaimers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  disclaimer_type text not null default 'general',
  body text not null,
  applies_to text not null default 'group-wide',
  dealership_name text,
  oem text,
  is_required boolean not null default false,
  effective_date date,
  expiration_date date,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branding_dealer_references (
  id uuid primary key default gen_random_uuid(),
  store_name text not null,
  oem text not null,
  logo_reference_url text,
  required_ad_elements text,
  known_restrictions text,
  compliance_notes text,
  disclaimer_notes text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'branding_colors_category_check') then
    alter table public.branding_colors
      add constraint branding_colors_category_check
      check (category in ('primary', 'secondary', 'accent', 'neutral', 'compliance', 'oem_reference'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'branding_messaging_applies_to_check') then
    alter table public.branding_messaging
      add constraint branding_messaging_applies_to_check
      check (applies_to in ('group-wide', 'dealership', 'oem'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'branding_disclaimers_applies_to_check') then
    alter table public.branding_disclaimers
      add constraint branding_disclaimers_applies_to_check
      check (applies_to in ('group-wide', 'oem', 'dealership'));
  end if;
end $$;

create index if not exists branding_logos_sort_idx on public.branding_logos (sort_order, name);
create index if not exists branding_colors_sort_idx on public.branding_colors (sort_order, name);
create index if not exists branding_typography_sort_idx on public.branding_typography (sort_order, font_role);
create index if not exists branding_messaging_sort_idx on public.branding_messaging (sort_order, title);
create index if not exists branding_disclaimers_sort_idx on public.branding_disclaimers (sort_order, title);
create index if not exists branding_dealer_references_sort_idx on public.branding_dealer_references (sort_order, store_name);

alter table public.branding_logos enable row level security;
alter table public.branding_colors enable row level security;
alter table public.branding_typography enable row level security;
alter table public.branding_messaging enable row level security;
alter table public.branding_disclaimers enable row level security;
alter table public.branding_dealer_references enable row level security;

drop policy if exists "branding_logos_public_read_active" on public.branding_logos;
create policy "branding_logos_public_read_active"
  on public.branding_logos for select to anon, authenticated using (is_active = true);

drop policy if exists "branding_colors_public_read_active" on public.branding_colors;
create policy "branding_colors_public_read_active"
  on public.branding_colors for select to anon, authenticated using (is_active = true);

drop policy if exists "branding_typography_public_read_active" on public.branding_typography;
create policy "branding_typography_public_read_active"
  on public.branding_typography for select to anon, authenticated using (is_active = true);

drop policy if exists "branding_messaging_public_read_active" on public.branding_messaging;
create policy "branding_messaging_public_read_active"
  on public.branding_messaging for select to anon, authenticated using (is_active = true);

drop policy if exists "branding_disclaimers_public_read_active" on public.branding_disclaimers;
create policy "branding_disclaimers_public_read_active"
  on public.branding_disclaimers for select to anon, authenticated using (is_active = true);

drop policy if exists "branding_dealer_references_public_read_active" on public.branding_dealer_references;
create policy "branding_dealer_references_public_read_active"
  on public.branding_dealer_references for select to anon, authenticated using (is_active = true);
