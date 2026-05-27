-- Register Executive Team in CMS (public site uses app/executive-team dedicated route).

do $$
declare
  v_page_id uuid;
begin
  select id into v_page_id from public.site_pages where slug = 'executive-team' limit 1;

  if v_page_id is null then
    insert into public.site_pages (title, slug, status, meta_description)
    values (
      'Executive Team',
      'executive-team',
      'published',
      'Meet the executive leadership team at Cavender Auto Group — experienced leaders committed to customers, team members, and community.'
    )
    returning id into v_page_id;
  else
    update public.site_pages
       set title = 'Executive Team',
           status = 'published',
           meta_description = 'Meet the executive leadership team at Cavender Auto Group — experienced leaders committed to customers, team members, and community.'
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
      'Executive Team (dedicated layout)',
      'The public site uses the dedicated Executive Team layout at /executive-team. Update copy, executives, and imagery in lib/executiveTeamPageContent.ts. CMS sections here are for reference only.',
      jsonb_build_object('alignment', 'left')
    );
  end if;
end $$;
