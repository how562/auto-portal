-- Homepage layout order (portal section stack on /).

create table if not exists public.homepage_layout_settings (
  id text primary key default 'default',
  section_order jsonb not null default '[]'::jsonb,
  hidden_sections jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.homepage_layout_settings (id, section_order, hidden_sections)
values ('default', '[]'::jsonb, '[]'::jsonb)
on conflict (id) do nothing;

alter table public.homepage_layout_settings enable row level security;

drop policy if exists "homepage_layout_settings_public_read" on public.homepage_layout_settings;
create policy "homepage_layout_settings_public_read"
  on public.homepage_layout_settings
  for select
  to anon, authenticated
  using (true);
