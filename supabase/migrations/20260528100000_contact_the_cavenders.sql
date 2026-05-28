-- Contact The Cavenders — leadership message submissions

create table if not exists public.contact_the_cavenders_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  location text not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'reviewed', 'archived')),
  reviewed boolean not null default false
);

create index if not exists contact_the_cavenders_submissions_created_at_idx
  on public.contact_the_cavenders_submissions (created_at desc);

alter table public.contact_the_cavenders_submissions enable row level security;

-- Submissions are written via service-role API route only (no public policies).

comment on table public.contact_the_cavenders_submissions is
  'Messages from /contact-the-cavenders for Cavender leadership review.';
