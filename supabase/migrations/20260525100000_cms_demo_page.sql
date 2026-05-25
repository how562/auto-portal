-- CMS demo page: exercises hero, text_block, image_text, cta_band, card_grid, faq

do $$
declare
  v_page_id uuid;
begin
  select id into v_page_id from public.site_pages where slug = 'cms-demo' limit 1;

  if v_page_id is null then
    insert into public.site_pages (title, slug, status, meta_description)
    values (
      'CMS Demo',
      'cms-demo',
      'published',
      'Internal demo page for all core CMS section types.'
    )
    returning id into v_page_id;
  else
    update public.site_pages
       set title = 'CMS Demo',
           status = 'published',
           meta_description = 'Internal demo page for all core CMS section types.'
     where id = v_page_id;
  end if;

  delete from public.page_sections where page_id = v_page_id;

  insert into public.page_sections
    (page_id, section_type, sort_order, headline, subheadline, body, settings)
  values
    (
      v_page_id, 'hero', 10,
      'CMS Hero Demo',
      'Subheadline for hero — canonical fields only.',
      null,
      jsonb_build_object('variant', 'light', 'cta_label', 'Browse inventory', 'cta_href', '/inventory')
    ),
    (
      v_page_id, 'text_block', 20,
      'Text block demo',
      'Supporting subheadline',
      E'First paragraph of body copy.\n\nSecond paragraph with a blank line between.',
      jsonb_build_object('alignment', 'left')
    ),
    (
      v_page_id, 'image_text', 30,
      'Image + text demo',
      null,
      E'Body copy lives in the body column.\n\nImage URL is optional — text still renders.',
      jsonb_build_object('media_type', 'image', 'layout', 'image_right')
    ),
    (
      v_page_id, 'cta_band', 40,
      'Ready to take the next step?',
      'Choose an action below.',
      null,
      jsonb_build_object(
        'buttons', jsonb_build_array(
          jsonb_build_object('label', 'Shop inventory', 'url', '/inventory'),
          jsonb_build_object('label', 'Contact', 'url', '/about-us')
        )
      )
    ),
    (
      v_page_id, 'card_grid', 50,
      'Card grid demo',
      'Cards are defined in settings.cards',
      null,
      jsonb_build_object(
        'cards', jsonb_build_array(
          jsonb_build_object('title', 'Integrity', 'body', 'We win with honesty and transparency.'),
          jsonb_build_object('title', 'Commitment', 'body', 'We follow through on every promise.'),
          jsonb_build_object('title', 'Community', 'body', 'We give back to San Antonio.')
        )
      )
    ),
    (
      v_page_id, 'faq', 60,
      'FAQ demo',
      null,
      null,
      jsonb_build_object(
        'items', jsonb_build_array(
          jsonb_build_object('question', 'Where is body stored?', 'answer', 'In the body column — not content or title.'),
          jsonb_build_object('question', 'What about Spanish?', 'answer', 'Use headline_es, body_es, and related _es fields.')
        )
      )
    );
end $$;
