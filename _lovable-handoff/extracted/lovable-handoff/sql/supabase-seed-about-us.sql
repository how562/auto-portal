-- Seed: About Us page (full copy from reference)
-- Idempotent; safe to re-run. Only touches the about-us page + its sections.

do $$
declare
  v_page_id uuid;
begin
  select id into v_page_id from public.site_pages where slug = 'about-us' limit 1;

  if v_page_id is null then
    insert into public.site_pages (title, slug, status, meta_description)
    values (
      'About Us',
      'about-us',
      'published',
      'Learn about Cavender Auto Group — our values, our team, and our commitment to delivering exceptional experiences.'
    )
    returning id into v_page_id;
  else
    update public.site_pages
       set title = 'About Us',
           status = 'published',
           meta_description = 'Learn about Cavender Auto Group — our values, our team, and our commitment to delivering exceptional experiences.'
     where id = v_page_id;
  end if;

  -- Replace existing sections
  delete from public.page_sections where page_id = v_page_id;

  -- 1. HERO
  insert into public.page_sections
    (page_id, section_type, layout_variant, headline, subheadline, sort_order, settings)
  values (
    v_page_id, 'hero', 'image_background',
    'The Cavender Way',
    'Delivering exceptional experiences to those we serve.',
    10,
    jsonb_build_object(
      'source', 'Cavender About Us reference page',
      'image_note', 'Hero background image from original page should be added later.'
    )
  );

  -- 2. IMAGE_TEXT (video right)
  insert into public.page_sections
    (page_id, section_type, layout_variant, headline, body, sort_order, settings)
  values (
    v_page_id, 'image_text', 'video_right',
    'Who Is Cavender Auto Group?',
    E'Our dealerships are built around one goal — delivering confidence at every step. From your first test drive to long-term vehicle ownership, we focus on making every interaction simple, transparent, and respectful.\n\nWe’re proud to serve San Antonio with a commitment to our community, offering military support initiatives and giving back through quarterly vehicle giveaways. When you choose Cavender, you’re choosing a team that stands behind every promise.',
    20,
    jsonb_build_object(
      'media_type', 'video',
      'video_note', 'Original page uses a YouTube video embed for The Cavender Family History.',
      'video_title', 'The Cavender Family History - Serving San Antonio'
    )
  );

  -- 3. CARD_GRID — Our Values
  insert into public.page_sections
    (page_id, section_type, layout_variant, headline, subheadline, sort_order, settings)
  values (
    v_page_id, 'card_grid', 'values',
    'Our Values',
    'The Cavender Way — delivering exceptional experiences to those we serve.',
    30,
    jsonb_build_object(
      'cards', jsonb_build_array(
        jsonb_build_object('title','Integrity',   'body','We win the right way — with honesty, transparency, and trust in every interaction.'),
        jsonb_build_object('title','Commitment',  'body','We take pride in our work and follow through on every promise.'),
        jsonb_build_object('title','Empowerment', 'body','We empower our team to take ownership and treat every customer like family.'),
        jsonb_build_object('title','Innovation',  'body','We continuously improve our processes to make every experience transparent and convenient.')
      )
    )
  );

  -- 4. CTA_BAND (button row)
  insert into public.page_sections
    (page_id, section_type, layout_variant, headline, subheadline, sort_order, settings)
  values (
    v_page_id, 'cta_band', 'button_row',
    'Start your journey with Cavender today',
    'Choose your next step below.',
    40,
    jsonb_build_object(
      'buttons', jsonb_build_array(
        jsonb_build_object('label','Shop New Inventory','url','/inventory?condition=new'),
        jsonb_build_object('label','Get Financing',    'url','/finance'),
        jsonb_build_object('label','Contact Us',       'url','/contact-the-cavenders')
      )
    )
  );
end $$;
