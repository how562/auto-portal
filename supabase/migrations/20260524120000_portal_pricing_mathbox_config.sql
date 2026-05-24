-- VDP Math Box presentation config (labels, order, visibility — not vehicle prices).
create table if not exists public.portal_pricing_mathbox_config (
  id uuid primary key default gen_random_uuid(),
  line_key text not null unique,
  label text not null,
  label_es text,
  source_key text not null,
  group_name text not null default 'standard'
    check (group_name in ('standard', 'discounts', 'conditional', 'fees', 'final')),
  line_type text not null default 'charge'
    check (line_type in ('charge', 'discount', 'subtotal', 'final', 'info')),
  display_order integer not null default 0,
  is_active boolean not null default true,
  is_conditional boolean not null default false,
  show_when_zero boolean not null default false,
  collapse_by_default boolean not null default false,
  disclaimer_text text,
  disclaimer_key text,
  applies_to text not null default 'all'
    check (applies_to in ('all', 'new', 'used', 'certified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portal_pricing_mathbox_config_order_idx
  on public.portal_pricing_mathbox_config (display_order);

alter table public.portal_pricing_mathbox_config enable row level security;

drop policy if exists "portal_pricing_mathbox_config_public_read"
  on public.portal_pricing_mathbox_config;
create policy "portal_pricing_mathbox_config_public_read"
  on public.portal_pricing_mathbox_config
  for select
  to anon, authenticated
  using (true);

insert into public.portal_pricing_mathbox_config (
  line_key, label, label_es, source_key, group_name, line_type,
  display_order, is_active, is_conditional, show_when_zero,
  collapse_by_default, disclaimer_key, applies_to
) values
  ('msrp', 'MSRP', 'MSRP', 'msrp', 'standard', 'charge', 10, true, false, false, false, null, 'all'),
  ('invoice', 'Invoice', 'Factura', 'invoice', 'standard', 'charge', 15, true, false, false, false, null, 'all'),
  ('dealer_discount', 'Dealer Discount', 'Descuento del concesionario', 'dealer_discount', 'discounts', 'discount', 20, true, false, false, false, null, 'all'),
  ('dealer_discount_derived', 'Dealer Discount', 'Descuento del concesionario', 'dealer_discount_derived', 'discounts', 'discount', 21, false, false, false, false, null, 'all'),
  ('internet_price', 'Internet Price', 'Precio en internet', 'internet_price', 'standard', 'charge', 30, true, false, false, false, null, 'all'),
  ('sale_price', 'Selling Price', 'Precio de venta', 'sale_price', 'standard', 'charge', 35, true, false, false, false, null, 'all'),
  ('conditional_incentives', 'Conditional Offers', 'Ofertas condicionales', 'conditional_incentives', 'conditional', 'discount', 40, true, true, false, true, 'vdp.math.conditionalDisclaimer', 'all'),
  ('conditional_unavailable', 'Additional offers', 'Ofertas adicionales', '_conditional_unavailable', 'conditional', 'info', 45, true, true, false, false, 'vdp.math.incentivesUnavailable', 'all'),
  ('doc_fee', 'Doc Fee', 'Cargo de documentación', 'doc_fee', 'fees', 'charge', 50, true, false, false, false, null, 'all'),
  ('final_price', 'Your Price', 'Tu precio', 'final_price', 'final', 'final', 60, true, false, false, false, 'vdp.math.microcopy', 'all'),
  ('pricing_disclaimer', 'Pricing disclaimer', 'Aviso de precios', '_pricing_disclaimer', 'final', 'info', 70, true, false, false, false, 'vdp.math.disclaimer', 'all')
on conflict (line_key) do nothing;
