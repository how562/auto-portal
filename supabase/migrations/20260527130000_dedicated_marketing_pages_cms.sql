-- Register dedicated marketing pages in CMS (public routes use App Router layouts).

do $$
declare
  r record;
  v_page_id uuid;
begin
  for r in
    select *
    from (
      values
        (
          'about-us'::text,
          'About Us'::text,
          'Learn about Cavender Auto Group — our story, values, and commitment to customers across Texas.'::text,
          'The public site uses the dedicated About Us layout at /about-us. Update hero copy, story sections, and values in lib/aboutUsPageContent.ts. Use Page settings for SEO title and meta description.'::text
        ),
        (
          'locations',
          'Locations',
          'Find Cavender Auto Group dealerships across South and Central Texas. View hours, directions, and contact information.',
          'The public site uses the dedicated Locations layout at /locations. Dealership list data comes from stores in the database; page copy is in lib/locationsPageContent.ts.'
        ),
        (
          'schedule-service',
          'Schedule Service',
          'Schedule service online or call the service department at any Cavender Auto Group dealership.',
          'The public site uses the dedicated Schedule Service layout at /schedule-service. Service location cards use store scheduling URLs from the database; intro copy is in lib/serviceSchedulingContent.ts.'
        ),
        (
          'executive-team',
          'Executive Team',
          'Meet the executive leadership team at Cavender Auto Group — experienced leaders committed to customers, team members, and community.',
          'The public site uses the dedicated Executive Team layout at /executive-team. Update copy, executives, and imagery in lib/executiveTeamPageContent.ts.'
        )
    ) as t(slug, title, meta_description, admin_note)
  loop
    select id into v_page_id from public.site_pages where slug = r.slug limit 1;

    if v_page_id is null then
      insert into public.site_pages (title, slug, status, meta_description)
      values (r.title, r.slug, 'published', r.meta_description)
      returning id into v_page_id;
    else
      update public.site_pages
         set title = r.title,
             status = 'published',
             meta_description = r.meta_description
       where id = v_page_id;
    end if;

    if not exists (
      select 1 from public.page_sections
       where page_id = v_page_id
         and section_type = 'text_block'
    ) then
      insert into public.page_sections
        (page_id, section_type, sort_order, headline, body, settings)
      values (
        v_page_id,
        'text_block',
        10,
        r.title || ' (dedicated layout)',
        r.admin_note,
        jsonb_build_object('alignment', 'left')
      );
    end if;
  end loop;
end $$;
