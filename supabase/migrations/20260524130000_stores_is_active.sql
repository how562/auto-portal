-- Batch 1: optional store toggle for public inventory filtering (idempotent).
alter table public.stores
  add column if not exists is_active boolean not null default true;

create index if not exists stores_is_active_idx
  on public.stores (is_active);

update public.stores
set is_active = true
where is_active is null;
