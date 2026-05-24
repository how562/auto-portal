-- Unified managed links for portal navigation and CTAs (public read for anon).
create table if not exists public.portal_managed_links (
  link_key text primary key,
  link_type text not null check (link_type in ('cta', 'nav')),
  menu_location text check (menu_location is null or menu_location in ('header', 'footer')),
  parent_key text references public.portal_managed_links (link_key) on delete set null,
  is_group boolean not null default false,
  label text not null,
  label_es text,
  url text,
  sort_order integer not null default 0,
  opens_new_tab boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portal_managed_links_type_location check (
  (link_type = 'cta' and menu_location is null and is_group = false)
  or (link_type = 'nav' and menu_location is not null)
  )
);

create index if not exists portal_managed_links_nav_idx
  on public.portal_managed_links (link_type, menu_location, sort_order)
  where link_type = 'nav' and is_active = true;

create index if not exists portal_managed_links_cta_idx
  on public.portal_managed_links (link_type)
  where link_type = 'cta' and is_active = true;

alter table public.portal_managed_links enable row level security;

drop policy if exists "portal_managed_links_public_read" on public.portal_managed_links;
create policy "portal_managed_links_public_read"
  on public.portal_managed_links
  for select
  to anon, authenticated
  using (is_active = true);

-- CTAs
insert into public.portal_managed_links (link_key, link_type, label, label_es, url, sort_order) values
  ('discovery_primary', 'cta', 'Start Discovery', 'Comienza tu búsqueda', '#guided-discovery', 1),
  ('discovery_browse', 'cta', 'Browse Inventory', 'Ver inventario', '/inventory', 2),
  ('discovery_view_all_matches', 'cta', 'View all matching vehicles', 'Ver todas las opciones', null, 3),
  ('get_my_shortlist', 'cta', 'Get My Shortlist', 'Te ayudamos a elegir', null, 4),
  ('header_shortlist', 'cta', 'Get Shortlist', 'Mi lista', null, 5),
  ('footer_shortlist', 'cta', 'Get My Shortlist', 'Te ayudamos a elegir', null, 6),
  ('footer_discovery_primary', 'cta', 'Start Discovery', 'Comienza tu búsqueda', '/#guided-discovery', 7),
  ('availability', 'cta', 'Check Availability', 'Consultar disponibilidad', null, 8),
  ('build_my_shortlist', 'cta', 'Build My Shortlist', 'Armar mi lista', null, 9),
  ('compare_similar', 'cta', 'Compare Similar', 'Comparar similares', null, 10),
  ('contact_team', 'cta', 'Contact our team', 'Habla con nuestro equipo', null, 11),
  ('view_details', 'cta', 'View details', 'Ver detalles', null, 12),
  ('details_link', 'cta', 'Details', 'Detalles', null, 13),
  ('shortlist_compact', 'cta', 'Shortlist', 'Lista', null, 14),
  ('save_shortlist', 'cta', 'Save', 'Guardar', null, 15),
  ('check_availability', 'cta', 'Check availability', 'Consultar disponibilidad', null, 16),
  ('check_compact', 'cta', 'Check', 'Consultar', null, 17),
  ('commitment_learn_more', 'cta', 'Learn More', 'Conocer más', '/cavender-commitment', 18),
  ('commitment_browse_vehicles', 'cta', 'See Available Vehicles', 'Ver vehículos disponibles', '/inventory', 19)
on conflict (link_key) do nothing;

-- Header navigation
insert into public.portal_managed_links (link_key, link_type, menu_location, label, url, sort_order) values
  ('fallback-find', 'nav', 'header', 'Find My Vehicle', '#guided-discovery', 1),
  ('fallback-inventory', 'nav', 'header', 'Inventory', '/inventory', 2),
  ('fallback-locations', 'nav', 'header', 'Locations', '/locations', 3),
  ('fallback-how', 'nav', 'header', 'How It Works', '#how-it-works', 4),
  ('fallback-shortlist', 'nav', 'header', 'Get Shortlist', 'action:general-shortlist', 5)
on conflict (link_key) do nothing;

-- Footer groups
insert into public.portal_managed_links (link_key, link_type, menu_location, is_group, label, sort_order) values
  ('nav_footer_group_discover', 'nav', 'footer', true, 'Discover', 1),
  ('nav_footer_group_shop', 'nav', 'footer', true, 'Shop', 2),
  ('nav_footer_group_group', 'nav', 'footer', true, 'Group', 3),
  ('nav_footer_group_legal', 'nav', 'footer', true, 'Legal', 4)
on conflict (link_key) do nothing;

-- Footer items
insert into public.portal_managed_links (link_key, link_type, menu_location, parent_key, label, url, sort_order) values
  ('fb-d1', 'nav', 'footer', 'nav_footer_group_discover', 'Find My Vehicle', '#guided-discovery', 1),
  ('fb-d2', 'nav', 'footer', 'nav_footer_group_discover', 'Smart Match', '#guided-discovery', 2),
  ('fb-d3', 'nav', 'footer', 'nav_footer_group_discover', 'Categories', '#categories', 3),
  ('fb-s1', 'nav', 'footer', 'nav_footer_group_shop', 'Inventory', '/inventory', 1),
  ('fb-s2', 'nav', 'footer', 'nav_footer_group_shop', 'Under $30k', '/inventory?budget=under-30k', 2),
  ('fb-s3', 'nav', 'footer', 'nav_footer_group_shop', 'Compare', 'action:compare', 3),
  ('fb-g1', 'nav', 'footer', 'nav_footer_group_group', 'Locations', '/locations', 1),
  ('fb-g2', 'nav', 'footer', 'nav_footer_group_group', 'How It Works', '#how-it-works', 2),
  ('fb-g3', 'nav', 'footer', 'nav_footer_group_group', 'Contact', '/contact-the-cavenders', 3),
  ('fb-l1', 'nav', 'footer', 'nav_footer_group_legal', 'Privacy', '/privacy', 1),
  ('fb-l2', 'nav', 'footer', 'nav_footer_group_legal', 'Terms', '/terms', 2),
  ('fb-l3', 'nav', 'footer', 'nav_footer_group_legal', 'Accessibility', '/accessibility', 3)
on conflict (link_key) do nothing;
