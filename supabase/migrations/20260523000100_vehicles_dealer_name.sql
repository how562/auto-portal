-- Denormalized dealer/store label for inventory cards. Sourced either from
-- the matched store row (when store_id resolves) or from the raw HomeNet
-- `DealerName` payload (when no UUID exists). Avoids selecting the full
-- source_raw blob just to render a store badge.

alter table public.vehicles
  add column if not exists dealer_name text;

update public.vehicles v
set dealer_name = nullif(btrim(v.source_raw->>'DealerName'), '')
where v.dealer_name is null
  and v.source_raw is not null
  and coalesce(v.source_raw->>'DealerName', '') <> '';

update public.vehicles v
set dealer_name = s.name
from public.stores s
where v.dealer_name is null
  and v.store_id is not null
  and v.store_id = s.id;
