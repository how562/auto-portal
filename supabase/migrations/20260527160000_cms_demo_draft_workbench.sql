-- CMS Demo is an internal workbench page — keep draft, not in Live list.

update public.site_pages
   set status = 'draft',
       title = 'CMS Demo'
 where slug = 'cms-demo';
