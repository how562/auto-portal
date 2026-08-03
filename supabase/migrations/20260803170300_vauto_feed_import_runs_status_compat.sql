-- Forward-only companion: ensure feed_import_runs.status allows portal values.
-- Idempotent if already applied via 20260803170100 on environments that include that block.
-- Applied on live as `vauto_feed_import_runs_status_check` + search_path harden.

alter table public.feed_import_runs
  drop constraint if exists feed_import_runs_status_check;

alter table public.feed_import_runs
  add constraint feed_import_runs_status_check
  check (
    status in ('pending', 'running', 'success', 'partial', 'failed')
  );

alter table public.feed_import_runs
  alter column status set default 'running';

comment on column public.feed_import_runs.status is
  'Portal: running|success|partial|failed. Legacy pending retained for historical rows.';

alter function public.feed_import_run_items_compat_bi() set search_path = public;
