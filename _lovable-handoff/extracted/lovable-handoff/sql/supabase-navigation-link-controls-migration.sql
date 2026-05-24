-- Adds admin controls for nav items: CTA hierarchy + dropdown behavior.
-- Safe to re-run.

alter table public.navigation_items
  add column if not exists cta_style text not null default 'none'
    check (cta_style in ('none','primary','secondary')),
  add column if not exists dropdown_behavior text not null default 'hover'
    check (dropdown_behavior in ('hover','click'));

create index if not exists navigation_items_cta_style_idx
  on public.navigation_items(cta_style)
  where cta_style <> 'none';
