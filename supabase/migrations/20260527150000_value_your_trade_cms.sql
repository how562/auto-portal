-- Value Your Trade dedicated page (hero + partner iframe).

do $$
declare
  v_page_id uuid;
begin
  select id into v_page_id from public.site_pages where slug = 'value-your-trade' limit 1;

  if v_page_id is null then
    insert into public.site_pages (title, slug, status, meta_description)
    values (
      'Value Your Trade',
      'value-your-trade',
      'published',
      'Get a trade-in value for your vehicle with Cavender Auto Group. Quick online offers from our trusted partner.'
    )
    returning id into v_page_id;
  else
    update public.site_pages
       set title = 'Value Your Trade',
           status = 'published',
           meta_description = 'Get a trade-in value for your vehicle with Cavender Auto Group. Quick online offers from our trusted partner.'
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
      'Value Your Trade (dedicated layout)',
      'Edit hero copy and partner iframe settings in the dedicated content editor.',
      jsonb_build_object('alignment', 'left')
    );
  end if;
end $$;
