-- Spanish CTA labels (optional per key; English label remains required).
alter table public.portal_cta_settings
  add column if not exists label_es text;

update public.portal_cta_settings set label_es = 'Comienza tu búsqueda' where cta_key = 'discovery_primary' and label_es is null;
update public.portal_cta_settings set label_es = 'Ver inventario' where cta_key = 'discovery_browse' and label_es is null;
update public.portal_cta_settings set label_es = 'Te ayudamos a elegir' where cta_key = 'get_my_shortlist' and label_es is null;
update public.portal_cta_settings set label_es = 'Mi lista' where cta_key = 'header_shortlist' and label_es is null;
update public.portal_cta_settings set label_es = 'Te ayudamos a elegir' where cta_key = 'footer_shortlist' and label_es is null;
update public.portal_cta_settings set label_es = 'Comienza tu búsqueda' where cta_key = 'footer_discovery_primary' and label_es is null;
update public.portal_cta_settings set label_es = 'Consultar disponibilidad' where cta_key = 'availability' and label_es is null;
update public.portal_cta_settings set label_es = 'Armar mi lista' where cta_key = 'build_my_shortlist' and label_es is null;
update public.portal_cta_settings set label_es = 'Comparar similares' where cta_key = 'compare_similar' and label_es is null;
update public.portal_cta_settings set label_es = 'Habla con nuestro equipo' where cta_key = 'contact_team' and label_es is null;
update public.portal_cta_settings set label_es = 'Ver detalles' where cta_key = 'view_details' and label_es is null;
update public.portal_cta_settings set label_es = 'Detalles' where cta_key = 'details_link' and label_es is null;
update public.portal_cta_settings set label_es = 'Lista' where cta_key = 'shortlist_compact' and label_es is null;
update public.portal_cta_settings set label_es = 'Guardar' where cta_key = 'save_shortlist' and label_es is null;
update public.portal_cta_settings set label_es = 'Consultar disponibilidad' where cta_key = 'check_availability' and label_es is null;
update public.portal_cta_settings set label_es = 'Consultar' where cta_key = 'check_compact' and label_es is null;
