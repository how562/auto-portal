-- Seed: Finance Center page
-- Idempotent; safe to re-run. Only touches the finance page + its sections.

do $$
declare
  v_page_id uuid;
begin
  select id into v_page_id from public.site_pages where slug = 'finance' limit 1;

  if v_page_id is null then
    insert into public.site_pages (title, slug, status, meta_description)
    values (
      'Finance Center',
      'finance',
      'published',
      'Apply for auto financing at any Cavender Auto Group dealership.'
    )
    returning id into v_page_id;
  else
    update public.site_pages
    set title = 'Finance Center',
        status = 'published'
    where id = v_page_id;
  end if;

  delete from public.page_sections where page_id = v_page_id;

  -- SECTION 1: Hero
  insert into public.page_sections
    (page_id, section_type, layout_variant, headline, subheadline, image_url, sort_order, settings)
  values (
    v_page_id,
    'hero',
    'image_background',
    'Cavender Credit Center',
    'Your Gateway To Affordable Auto Financing',
    null,
    10,
    jsonb_build_object(
      'image_note', 'Hero shows financing paperwork image in original design'
    )
  );

  -- SECTION 2: Location card grid
  insert into public.page_sections
    (page_id, section_type, layout_variant, headline, subheadline, sort_order, settings)
  values (
    v_page_id,
    'card_grid',
    'locations',
    'Get Approved at a Cavender Location',
    'Choose your preferred dealership to get started with financing.',
    20,
    jsonb_build_object(
      'cards', jsonb_build_array(
        jsonb_build_object(
          'title','Cavender Buick GMC North',
          'body', E'17811 San Pedro Ave\nSan Antonio, TX 78232\nSales: (866) 220-7982',
          'cta_label','Get Approved Today',
          'cta_url','/credit?store=bg-north'
        ),
        jsonb_build_object(
          'title','Cavender Buick GMC West',
          'body', E'7400 W Loop 1604\nNorth San Antonio, TX 78254\nSales: (866) 457-7085',
          'cta_label','Get Approved Today',
          'cta_url','/credit?store=bg-west'
        ),
        jsonb_build_object(
          'title','Cavender Cadillac',
          'body', E'7625 North Loop 1604\nEast San Antonio, TX 78233\nSales: (210) 544-5069',
          'cta_label','Get Approved Today',
          'cta_url','/credit?store=cadillac'
        ),
        jsonb_build_object(
          'title','Cavender Chevrolet',
          'body', E'30700 IH 10\nBoerne, TX 78006\nSales: (866) 718-0391',
          'cta_label','Get Approved Today',
          'cta_url','/credit?store=chevy'
        ),
        jsonb_build_object(
          'title','Cavender Grande Ford',
          'body', E'3600 IH 35\nEast San Antonio, TX 78219\nSales: (210) 514-1365',
          'cta_label','Get Approved Today',
          'cta_url','/credit?store=ford'
        ),
        jsonb_build_object(
          'title','Cavender Nissan of Rockwall',
          'body', E'1700 IH 30\nRockwall, TX 75087\nSales: (469) 522-3858',
          'cta_label','Get Approved Today',
          'cta_url','/credit?store=rockwall'
        ),
        jsonb_build_object(
          'title','Cavender Nissan of San Marcos',
          'body', E'2980 IH 35\nSan Marcos, TX 78666\nSales: (512) 689-9099',
          'cta_label','Get Approved Today',
          'cta_url','/credit?store=san-marcos'
        ),
        jsonb_build_object(
          'title','Jaguar San Antonio',
          'body', E'13660 W Interstate 10\nSan Antonio, TX 78249\nSales: (210) 263-3713',
          'cta_label','Get Approved Today',
          'cta_url','/credit?store=jaguar'
        ),
        jsonb_build_object(
          'title','Land Rover San Antonio',
          'body', E'13660 W Interstate 10\nSan Antonio, TX 78249',
          'cta_label','Get Approved Today',
          'cta_url','/credit?store=land-rover'
        )
      )
    )
  );

  -- SECTION 3: CTA Band - location selector
  insert into public.page_sections
    (page_id, section_type, layout_variant, headline, subheadline, sort_order, settings)
  values (
    v_page_id,
    'cta_band',
    'dark_band',
    'Get directions to one of our locations',
    'Select your preferred dealership and start your visit today.',
    30,
    jsonb_build_object(
      'type', 'location_selector',
      'cta_label', 'Go'
    )
  );
end $$;
