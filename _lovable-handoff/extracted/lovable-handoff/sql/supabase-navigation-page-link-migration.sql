-- Link navigation items to CMS pages OR keep a custom URL
-- Adds optional page_id reference. When set, the item is a "page link".
-- When null, the existing url field is treated as a custom link.
-- Run in Supabase SQL Editor.

alter table public.navigation_items
  add column if not exists page_id uuid
    references public.site_pages(id) on delete set null;

create index if not exists navigation_items_page_id_idx
  on public.navigation_items(page_id);

-- url remains the source of truth for the rendered href.
-- When page_id is set, we keep url in sync with '/' || site_pages.slug via a trigger.
create or replace function public.sync_navigation_item_url()
returns trigger language plpgsql as $$
declare
  page_slug text;
begin
  if new.page_id is not null then
    select slug into page_slug from public.site_pages where id = new.page_id;
    if page_slug is not null then
      new.url := '/' || page_slug;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists navigation_items_sync_url on public.navigation_items;
create trigger navigation_items_sync_url
before insert or update of page_id on public.navigation_items
for each row execute function public.sync_navigation_item_url();

-- Keep url updated if a linked page's slug changes
create or replace function public.sync_navigation_items_on_page_slug()
returns trigger language plpgsql as $$
begin
  if new.slug is distinct from old.slug then
    update public.navigation_items
       set url = '/' || new.slug
     where page_id = new.id;
  end if;
  return new;
end $$;

drop trigger if exists site_pages_sync_navigation_urls on public.site_pages;
create trigger site_pages_sync_navigation_urls
after update of slug on public.site_pages
for each row execute function public.sync_navigation_items_on_page_slug();

-- Backfill: link existing nav items whose url matches a page slug
update public.navigation_items ni
   set page_id = p.id
  from public.site_pages p
 where ni.page_id is null
   and ni.url = '/' || p.slug;
