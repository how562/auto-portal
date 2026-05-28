-- Inventory listing pages: site_pages with locked filter presets (e.g. /pre-owned).

alter table public.site_pages
  add column if not exists page_type text not null default 'cms';

alter table public.site_pages
  add column if not exists inventory_preset jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site_pages_page_type_check'
  ) then
    alter table public.site_pages
      add constraint site_pages_page_type_check
      check (page_type in ('cms', 'inventory'));
  end if;
end $$;

-- Seed Pre-Owned inventory page (published).
insert into public.site_pages (title, slug, status, meta_description, page_type, inventory_preset)
values (
  'Pre-Owned',
  'pre-owned',
  'published',
  'Shop pre-owned vehicles at Cavender Auto Group — quality used cars, trucks, and SUVs across Texas.',
  'inventory',
  '{"condition":"used"}'::jsonb
)
on conflict (slug) do update set
  title = excluded.title,
  meta_description = excluded.meta_description,
  page_type = excluded.page_type,
  inventory_preset = excluded.inventory_preset,
  status = excluded.status,
  updated_at = now();
