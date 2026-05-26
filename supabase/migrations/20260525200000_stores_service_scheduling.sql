-- Service scheduling fields for dealership locations (public read; admin via service role).
alter table public.stores
  add column if not exists address text,
  add column if not exists brand text,
  add column if not exists service_phone text,
  add column if not exists service_schedule_url text;

comment on column public.stores.address is 'Street or full mailing address for public location pages';
comment on column public.stores.brand is 'Primary brand label (e.g. Chevrolet, Ford)';
comment on column public.stores.service_phone is 'Service department direct line';
comment on column public.stores.service_schedule_url is 'External online service scheduling URL';
