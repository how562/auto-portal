-- Structured JSON content for dedicated marketing page layouts.

alter table public.site_pages
  add column if not exists page_content jsonb;

comment on column public.site_pages.page_content is
  'Dedicated layout copy and structured blocks (about-us, locations, schedule-service, executive-team).';
