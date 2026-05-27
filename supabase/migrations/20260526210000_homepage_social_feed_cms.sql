-- Homepage social feed backup posts (CMS-managed carousel until Meta API is live).

do $$
declare
  v_page_id uuid;
begin
  select id into v_page_id from public.site_pages where slug = 'home' limit 1;

  if v_page_id is null then
    insert into public.site_pages (title, slug, status, meta_description)
    values (
      'Home',
      'home',
      'published',
      'Homepage CMS content for Cavender Auto Group.'
    )
    returning id into v_page_id;
  end if;

  if not exists (
    select 1
      from public.page_sections
     where page_id = v_page_id
       and section_type = 'social_feed'
  ) then
    insert into public.page_sections
      (page_id, section_type, sort_order, is_active, eyebrow, headline, subheadline, settings)
    values (
      v_page_id,
      'social_feed',
      90,
      true,
      'Community',
      'Around the Cavender Family',
      'Real moments from our dealerships, our team, and our community.',
      jsonb_build_object(
        'eyebrow', 'Community',
        'description', 'Real moments from our dealerships, our team, and our community.',
        'posts', jsonb_build_array(
          jsonb_build_object(
            'id', 'social-1',
            'platform', 'facebook',
            'image_url', '/social-feed/01.jpg',
            'caption', 'Thank you to everyone who joined us for our community drive event — your support means everything to the Cavender family.',
            'date_label', 'Mar 18, 2026',
            'href', 'https://www.facebook.com/CavenderAutoG',
            'page_name', 'Cavender Auto Group',
            'is_active', true,
            'sort_order', 10
          ),
          jsonb_build_object(
            'id', 'social-2',
            'platform', 'instagram',
            'image_url', '/social-feed/02.jpg',
            'caption', 'Weekend-ready rides are waiting on the lot. Stop by and find your perfect match.',
            'date_label', 'Mar 15, 2026',
            'href', 'https://www.instagram.com/',
            'page_name', 'cavenderautogroup',
            'is_active', true,
            'sort_order', 20
          ),
          jsonb_build_object(
            'id', 'social-3',
            'platform', 'facebook',
            'image_url', '/social-feed/03.jpg',
            'caption', 'Proud to serve drivers across Texas with trusted brands and a team that treats you like family.',
            'date_label', 'Mar 10, 2026',
            'href', 'https://www.facebook.com/CavenderAutoG',
            'page_name', 'Cavender Auto Group',
            'is_active', true,
            'sort_order', 30
          ),
          jsonb_build_object(
            'id', 'social-4',
            'platform', 'instagram',
            'image_url', '/social-feed/04.jpg',
            'caption', 'Fresh arrivals hitting the showroom floor — browse inventory online or visit us today.',
            'date_label', 'Mar 6, 2026',
            'href', 'https://www.instagram.com/',
            'page_name', 'cavenderautogroup',
            'is_active', true,
            'sort_order', 40
          ),
          jsonb_build_object(
            'id', 'social-5',
            'platform', 'facebook',
            'image_url', '/social-feed/05.jpg',
            'caption', 'Honoring those who serve — ask about exclusive savings for military and first responders.',
            'date_label', 'Mar 1, 2026',
            'href', 'https://www.facebook.com/CavenderAutoG',
            'page_name', 'Cavender Auto Group',
            'is_active', true,
            'sort_order', 50
          )
        )
      )
    );
  end if;
end $$;
