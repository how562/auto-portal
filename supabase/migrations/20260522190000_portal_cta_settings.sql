-- Global portal CTA labels and URLs (public read for anon).
create table if not exists public.portal_cta_settings (
  cta_key text primary key,
  label text not null,
  url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portal_cta_settings enable row level security;

drop policy if exists "portal_cta_settings_public_read" on public.portal_cta_settings;
create policy "portal_cta_settings_public_read"
  on public.portal_cta_settings
  for select
  to anon, authenticated
  using (is_active = true);

insert into public.portal_cta_settings (cta_key, label, url) values
  ('discovery_primary', 'Start Discovery', '#guided-discovery'),
  ('discovery_browse', 'Browse Inventory', '/inventory'),
  ('get_my_shortlist', 'Get My Shortlist', null),
  ('header_shortlist', 'Get Shortlist', null),
  ('footer_shortlist', 'Get My Shortlist', null),
  ('footer_discovery_primary', 'Start Discovery', '/#guided-discovery'),
  ('availability', 'Check Availability', null),
  ('build_my_shortlist', 'Build My Shortlist', null),
  ('compare_similar', 'Compare Similar', null),
  ('contact_team', 'Contact our team', null),
  ('view_details', 'View details', null),
  ('details_link', 'Details', null),
  ('shortlist_compact', 'Shortlist', null),
  ('save_shortlist', 'Save', null),
  ('check_availability', 'Check availability', null),
  ('check_compact', 'Check', null)
on conflict (cta_key) do nothing;
