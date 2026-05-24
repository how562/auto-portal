-- Page Importer v2 — Visual Structure Importer
-- Adds layout_variant to page_sections and an import-screenshots storage bucket.

alter table public.page_sections
  add column if not exists layout_variant text;

-- Public storage bucket for screenshot-assisted imports
insert into storage.buckets (id, name, public)
values ('import-screenshots', 'import-screenshots', true)
on conflict (id) do nothing;

-- Admins can upload / manage screenshots
drop policy if exists "admin_write_import_screenshots" on storage.objects;
create policy "admin_write_import_screenshots" on storage.objects
  for all to authenticated
  using (bucket_id = 'import-screenshots' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'import-screenshots' and public.has_role(auth.uid(), 'admin'));

-- Public read (bucket is public, but make explicit)
drop policy if exists "public_read_import_screenshots" on storage.objects;
create policy "public_read_import_screenshots" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'import-screenshots');
