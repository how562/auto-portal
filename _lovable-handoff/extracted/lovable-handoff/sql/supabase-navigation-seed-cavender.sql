-- Cavender Header Navigation seed/update
-- Idempotent: matches on (menu_id, parent_id, label) and updates url/sort_order/is_active.
-- Run in Supabase SQL Editor.

do $$
declare
  header_id uuid;
  parent_id_var uuid;
begin
  -- Ensure a single active Header menu exists
  select id into header_id
    from public.navigation_menus
   where location = 'header'
   order by created_at asc
   limit 1;

  if header_id is null then
    insert into public.navigation_menus (name, location, is_active)
    values ('Header', 'header', true)
    returning id into header_id;
  else
    update public.navigation_menus
       set is_active = true, name = coalesce(name, 'Header')
     where id = header_id;
  end if;

  -- Helper: upsert top-level item; sets url/sort_order/is_active
  -- Top-level items
  perform 1;

  -- 1. New
  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, null, 'New', '/inventory?condition=new', 10, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id is null and label = 'New'
  );
  update public.navigation_items
     set url = '/inventory?condition=new', sort_order = 10, is_active = true
   where menu_id = header_id and parent_id is null and label = 'New';

  -- 2. Pre-Owned
  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, null, 'Pre-Owned', '/inventory?condition=used', 20, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id is null and label = 'Pre-Owned'
  );
  update public.navigation_items
     set url = '/inventory?condition=used', sort_order = 20, is_active = true
   where menu_id = header_id and parent_id is null and label = 'Pre-Owned';

  select id into parent_id_var from public.navigation_items
   where menu_id = header_id and parent_id is null and label = 'Pre-Owned';

  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, parent_id_var, 'Certified Pre-Owned', '/certified-pre-owned', 10, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id = parent_id_var and label = 'Certified Pre-Owned'
  );
  update public.navigation_items
     set url = '/certified-pre-owned', sort_order = 10, is_active = true
   where menu_id = header_id and parent_id = parent_id_var and label = 'Certified Pre-Owned';

  -- 3. Service
  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, null, 'Service', '/service', 30, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id is null and label = 'Service'
  );
  update public.navigation_items
     set url = '/service', sort_order = 30, is_active = true
   where menu_id = header_id and parent_id is null and label = 'Service';

  select id into parent_id_var from public.navigation_items
   where menu_id = header_id and parent_id is null and label = 'Service';

  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, parent_id_var, 'Schedule Service', '/schedule-service', 10, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id = parent_id_var and label = 'Schedule Service'
  );
  update public.navigation_items
     set url = '/schedule-service', sort_order = 10, is_active = true
   where menu_id = header_id and parent_id = parent_id_var and label = 'Schedule Service';

  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, parent_id_var, 'Collision Center', '/collision', 20, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id = parent_id_var and label = 'Collision Center'
  );
  update public.navigation_items
     set url = '/collision', sort_order = 20, is_active = true
   where menu_id = header_id and parent_id = parent_id_var and label = 'Collision Center';

  -- 4. Finance
  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, null, 'Finance', '/finance', 40, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id is null and label = 'Finance'
  );
  update public.navigation_items
     set url = '/finance', sort_order = 40, is_active = true
   where menu_id = header_id and parent_id is null and label = 'Finance';

  select id into parent_id_var from public.navigation_items
   where menu_id = header_id and parent_id is null and label = 'Finance';

  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, parent_id_var, 'Credit', '/credit', 10, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id = parent_id_var and label = 'Credit'
  );
  update public.navigation_items set url='/credit', sort_order=10, is_active=true
   where menu_id = header_id and parent_id = parent_id_var and label = 'Credit';

  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, parent_id_var, 'Insurance', '/insurance', 20, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id = parent_id_var and label = 'Insurance'
  );
  update public.navigation_items set url='/insurance', sort_order=20, is_active=true
   where menu_id = header_id and parent_id = parent_id_var and label = 'Insurance';

  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, parent_id_var, 'Value Your Trade', '/value-your-trade', 30, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id = parent_id_var and label = 'Value Your Trade'
  );
  update public.navigation_items set url='/value-your-trade', sort_order=30, is_active=true
   where menu_id = header_id and parent_id = parent_id_var and label = 'Value Your Trade';

  -- 5. Why Cavender
  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, null, 'Why Cavender', '/why-cavender', 50, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id is null and label = 'Why Cavender'
  );
  update public.navigation_items set url='/why-cavender', sort_order=50, is_active=true
   where menu_id = header_id and parent_id is null and label = 'Why Cavender';

  -- Clean up old "Why Cavender?" variant if present
  update public.navigation_items set is_active = false
   where menu_id = header_id and parent_id is null and label = 'Why Cavender?';

  select id into parent_id_var from public.navigation_items
   where menu_id = header_id and parent_id is null and label = 'Why Cavender';

  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, parent_id_var, 'Cavender Commitment', '/cavender-commitment', 10, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id = parent_id_var and label = 'Cavender Commitment'
  );
  update public.navigation_items set url='/cavender-commitment', sort_order=10, is_active=true
   where menu_id = header_id and parent_id = parent_id_var and label = 'Cavender Commitment';

  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, parent_id_var, 'Cavender Cares', '/cavender-cares', 20, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id = parent_id_var and label = 'Cavender Cares'
  );
  update public.navigation_items set url='/cavender-cares', sort_order=20, is_active=true
   where menu_id = header_id and parent_id = parent_id_var and label = 'Cavender Cares';

  -- 6. About Us
  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, null, 'About Us', '/about-us', 60, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id is null and label = 'About Us'
  );
  update public.navigation_items set url='/about-us', sort_order=60, is_active=true
   where menu_id = header_id and parent_id is null and label = 'About Us';

  select id into parent_id_var from public.navigation_items
   where menu_id = header_id and parent_id is null and label = 'About Us';

  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, parent_id_var, 'Cavender History', '/cavender-history', 10, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id = parent_id_var and label = 'Cavender History'
  );
  update public.navigation_items set url='/cavender-history', sort_order=10, is_active=true
   where menu_id = header_id and parent_id = parent_id_var and label = 'Cavender History';

  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, parent_id_var, 'Meet the Team', '/meet-the-team', 20, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id = parent_id_var and label = 'Meet the Team'
  );
  update public.navigation_items set url='/meet-the-team', sort_order=20, is_active=true
   where menu_id = header_id and parent_id = parent_id_var and label = 'Meet the Team';

  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, parent_id_var, 'Locations', '/locations', 30, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id = parent_id_var and label = 'Locations'
  );
  update public.navigation_items set url='/locations', sort_order=30, is_active=true
   where menu_id = header_id and parent_id = parent_id_var and label = 'Locations';

  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, parent_id_var, 'Careers', '/careers', 40, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id = parent_id_var and label = 'Careers'
  );
  update public.navigation_items set url='/careers', sort_order=40, is_active=true
   where menu_id = header_id and parent_id = parent_id_var and label = 'Careers';

  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, parent_id_var, 'Contact the Cavenders', '/contact-the-cavenders', 50, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id = parent_id_var and label = 'Contact the Cavenders'
  );
  update public.navigation_items set url='/contact-the-cavenders', sort_order=50, is_active=true
   where menu_id = header_id and parent_id = parent_id_var and label = 'Contact the Cavenders';

  -- 7. Stories
  insert into public.navigation_items (menu_id, parent_id, label, url, sort_order, is_active)
  select header_id, null, 'Stories', '/stories', 70, true
  where not exists (
    select 1 from public.navigation_items
     where menu_id = header_id and parent_id is null and label = 'Stories'
  );
  update public.navigation_items set url='/stories', sort_order=70, is_active=true
   where menu_id = header_id and parent_id is null and label = 'Stories';

  -- Deactivate legacy top-level items no longer in the spec
  update public.navigation_items
     set is_active = false
   where menu_id = header_id
     and parent_id is null
     and label in ('Shop Vehicles', 'Collision', 'Finance Center', 'Español', 'Our Locations');
end $$;
