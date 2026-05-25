-- Legacy installs: collections missing sort_order, homepage_sections missing updated_at.

alter table public.collections
  add column if not exists sort_order integer not null default 0;

create index if not exists collections_sort_idx on public.collections (sort_order);

alter table public.homepage_sections
  add column if not exists updated_at timestamptz not null default now();

update public.homepage_sections
set updated_at = created_at
where created_at is not null
  and updated_at < created_at;
