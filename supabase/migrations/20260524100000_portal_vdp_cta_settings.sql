-- VDP price-box CTA labels, order, and visibility (public read for anon).
create table if not exists public.portal_vdp_cta_settings (
  action_key text primary key,
  label text not null,
  label_es text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  applies_to text not null default 'all'
    check (applies_to in ('all', 'new', 'used', 'certified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portal_vdp_cta_settings enable row level security;

drop policy if exists "portal_vdp_cta_settings_public_read" on public.portal_vdp_cta_settings;
create policy "portal_vdp_cta_settings_public_read"
  on public.portal_vdp_cta_settings
  for select
  to anon, authenticated
  using (true);

insert into public.portal_vdp_cta_settings (action_key, label, label_es, sort_order, applies_to) values
  ('calculate_payment', 'Calculate My Payment', 'Calcular mi pago', 10, 'all'),
  ('value_trade', 'Value My Trade', 'Valuar mi auto', 20, 'used'),
  ('check_availability', 'Check Availability', 'Consultar disponibilidad', 30, 'all'),
  ('get_eprice', 'Get E-Price', 'Obtener e-precio', 40, 'used'),
  ('unlock_savings', 'Unlock Savings', 'Desbloquear ahorros', 40, 'new')
on conflict (action_key) do nothing;
