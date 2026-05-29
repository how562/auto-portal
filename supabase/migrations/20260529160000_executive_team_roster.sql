-- Refresh executive roster defaults in CMS page_content when placeholders were saved.

update public.site_pages
set page_content = jsonb_set(
  coalesce(page_content, '{}'::jsonb),
  '{executives}',
  '[
    {"id":"bobby-cavender","name":"Bobby Cavender","title":"President","image":"/images/executive-team/bobby-cavender.png"},
    {"id":"lee-cavender","name":"Lee Cavender","title":"Chief Development Officer","image":"/images/executive-team/lee-cavender.png"},
    {"id":"rob-cavender","name":"Rob Cavender","title":"Chief Executive Officer","image":"/images/executive-team/rob-cavender.png"},
    {"id":"jonathan-gray","name":"Jonathan Gray","title":"Chief Operating Officer","image":"/images/executive-team/jonathan-gray.png"},
    {"id":"amber-pfaff-chavez","name":"Amber Pfaff-Chavez","title":"Chief Financial Officer","image":"/images/executive-team/amber-pfaff-chavez.png"},
    {"id":"misty-avila","name":"Misty Avila","title":"Director of Human Resources","image":"/images/executive-team/misty-avila.png"}
  ]'::jsonb,
  true
),
updated_at = now()
where slug = 'executive-team';
