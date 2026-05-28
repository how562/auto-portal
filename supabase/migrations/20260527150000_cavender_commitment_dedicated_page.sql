-- Cavender Commitment dedicated landing page at /cavender-commitment

do $$
declare
  v_page_id uuid;
begin
  select id into v_page_id from public.site_pages where slug = 'cavender-commitment' limit 1;

  if v_page_id is null then
    insert into public.site_pages (title, slug, status, meta_description)
    values (
      'Cavender Commitment',
      'cavender-commitment',
      'published',
      'Free oil changes for life for veterans and active-duty military members at Cavender Auto Group.'
    )
    returning id into v_page_id;
  else
    update public.site_pages
       set title = 'Cavender Commitment',
           status = 'published',
           meta_description = 'Free oil changes for life for veterans and active-duty military members at Cavender Auto Group.'
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
      'Cavender Commitment (dedicated layout)',
      'The public site uses the dedicated layout at /cavender-commitment. Edit copy in Admin → Site pages → Cavender Commitment.',
      jsonb_build_object('alignment', 'left')
    );
  end if;
end $$;
