-- Seed draft CMS pages for every navigation URL that does not already have a page.
-- Each new page gets a starter hero + text_block section.
-- Safe to re-run: skips slugs that already exist in site_pages.

with nav(slug, title) as (
  values
    ('certified-pre-owned',    'Certified Pre-Owned'),
    ('service',                'Service'),
    ('schedule-service',       'Schedule Service'),
    ('collision',              'Collision Center'),
    ('finance',                'Finance'),
    ('credit',                 'Credit'),
    ('insurance',              'Insurance'),
    ('value-your-trade',       'Value Your Trade'),
    ('why-cavender',           'Why Cavender'),
    ('cavender-commitment',    'Cavender Commitment'),
    ('cavender-cares',         'Cavender Cares'),
    ('about-us',               'About Us'),
    ('cavender-history',       'Cavender History'),
    ('meet-the-team',          'Meet the Team'),
    ('locations',              'Locations'),
    ('careers',                'Careers'),
    ('contact-the-cavenders',  'Contact the Cavenders'),
    ('stories',                'Stories')
),
inserted as (
  insert into public.site_pages (title, slug, status)
  select n.title, n.slug, 'draft'
  from nav n
  where not exists (
    select 1 from public.site_pages p where p.slug = n.slug
  )
  returning id, title
)
insert into public.page_sections
  (page_id, section_type, layout_variant, headline, body, sort_order)
select i.id, s.section_type, s.layout_variant, s.headline, s.body, s.sort_order
from inserted i
cross join lateral (values
  ('hero'::text,       'centered'::text, i.title, null::text,                                              0),
  ('text_block'::text, 'default'::text,  null::text, 'This page is ready to be customized in the CMS.',  10)
) as s(section_type, layout_variant, headline, body, sort_order);
