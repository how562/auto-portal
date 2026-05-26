-- Align notes table with admin scratchpad (archived + shared notes without auth user).

alter table public.notes add column if not exists archived boolean not null default false;

-- Legacy installs required user_id; admin API uses shared notes without Supabase Auth.
alter table public.notes alter column user_id drop not null;

drop index if exists public.notes_list_idx;
create index if not exists notes_list_idx
  on public.notes (archived, pinned desc, updated_at desc);
