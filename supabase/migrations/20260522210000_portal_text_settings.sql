-- Editable portal UI copy (public read for anon).
create table if not exists public.portal_text_settings (
  text_key text primary key,
  label_en text not null,
  label_es text,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portal_text_settings enable row level security;

drop policy if exists "portal_text_settings_public_read" on public.portal_text_settings;
create policy "portal_text_settings_public_read"
  on public.portal_text_settings
  for select
  to anon, authenticated
  using (is_active = true);

insert into public.portal_text_settings (text_key, label_en, label_es, category) values
  ('smart_match_eyebrow', 'Smart match', 'Match inteligente', 'smart_match'),
  ('smart_match_title', 'Refine your fit', 'Afina tu búsqueda', 'smart_match'),
  ('smart_match_step_1_title', 'What do you need it for?', '¿Para qué lo necesitas?', 'smart_match'),
  ('smart_match_step_1_body', 'Pick the story that fits your life—we''ll bias inventory toward it.', 'Elige la historia que encaja con tu vida; priorizamos inventario acorde.', 'smart_match'),
  ('smart_match_results_title', 'Your matches', 'Tus opciones', 'smart_match'),
  ('smart_match_results_body', 'Based on what matters to you, here are a few vehicles to consider.', 'Según lo que más te importa, estas son algunas opciones para considerar.', 'smart_match'),
  ('smart_match_empty', 'Complete the steps to reveal your matches', 'Completa los pasos para ver tus opciones', 'smart_match'),
  ('smart_match_view_all', 'View all matching vehicles', 'Ver todas las opciones', 'smart_match')
on conflict (text_key) do nothing;
