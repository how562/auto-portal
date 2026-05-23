-- Merchandising signals for premium inventory sorting.
--
-- Adds three derived columns:
--   image_count          -- number of usable URLs in image_urls
--   has_images           -- boolean shortcut (image_count > 0)
--   data_quality_score   -- 0–100 weighted completeness score
--
-- The score formula must stay aligned with `computeVehicleQuality` in
-- lib/vehicleQuality.ts. Weights:
--   images present .......... 20
--   each image up to 25 .....  1
--   internet_price > 0 ...... 15
--   mileage is not null ..... 10
--   trim is not empty ....... 10
--   description present ..... 10  (source_raw->>'Description' or Comment1)
--   exterior_color .......... 5
--   interior_color .......... 5
-- Total max .................. 100

alter table public.vehicles
  add column if not exists image_count integer not null default 0,
  add column if not exists has_images boolean not null default false,
  add column if not exists data_quality_score integer not null default 0;

with computed as (
  select
    v.id,
    -- image_count = max(image_urls length, 1 if a primary_image_url is set).
    -- Older seed rows only carry primary_image_url; they still count as "has image".
    greatest(
      case when jsonb_typeof(v.image_urls) = 'array' then jsonb_array_length(v.image_urls) else 0 end,
      case when v.primary_image_url is not null and btrim(v.primary_image_url) <> '' then 1 else 0 end
    ) as ic,
    case
      when v.source_raw is not null
        and coalesce(nullif(btrim(v.source_raw->>'Description'), ''), nullif(btrim(v.source_raw->>'Comment1'), '')) is not null
        then true
      else false
    end as has_description
  from public.vehicles v
)
update public.vehicles v
set
  image_count = computed.ic,
  has_images = computed.ic > 0,
  data_quality_score =
    (case when computed.ic > 0 then 20 else 0 end)
    + least(computed.ic, 25)
    + (case when v.internet_price is not null and v.internet_price > 0 then 15 else 0 end)
    + (case when v.mileage is not null then 10 else 0 end)
    + (case when v.trim is not null and btrim(v.trim) <> '' then 10 else 0 end)
    + (case when computed.has_description then 10 else 0 end)
    + (case when v.exterior_color is not null and btrim(v.exterior_color) <> '' then 5 else 0 end)
    + (case when v.interior_color is not null and btrim(v.interior_color) <> '' then 5 else 0 end)
from computed
where v.id = computed.id;

-- Indexes to keep the most common sort orderings fast at scale.
create index if not exists vehicles_merchandising_idx
  on public.vehicles (has_images desc, data_quality_score desc, image_count desc)
  where status = 'active';

create index if not exists vehicles_image_count_idx
  on public.vehicles (image_count desc)
  where status = 'active';

create index if not exists vehicles_data_quality_score_idx
  on public.vehicles (data_quality_score desc)
  where status = 'active';

create index if not exists vehicles_created_at_idx
  on public.vehicles (created_at desc)
  where status = 'active';
