-- Realign merchandising signals to the admin scoring spec.
--
-- These three columns are admin/back-office fields. Customers never see
-- the raw values or the admin sort labels — they exist solely so the
-- merchandising team can rank inventory and triage data-quality gaps.
--
-- Spec (must stay in sync with `computeVehicleQuality` in
-- lib/vehicleQuality.ts):
--
--   image_count        = number of valid URLs in image_urls
--   has_images         = image_count > 0
--   data_quality_score = +50 has_images
--                        + MIN(image_count, 30)
--                        + 10 internet_price > 0
--                        + 10 mileage IS NOT NULL
--                        +  5 trim
--                        +  5 description (source_raw->>'Description' / 'Comment1')
--                        +  5 exterior_color
--                        +  5 interior_color
--                        ────────────────────
--                        max  120
--
-- Default backend/admin merchandising order:
--   has_images DESC, image_count DESC, data_quality_score DESC,
--   internet_price DESC NULLS LAST

-- 1. Make sure the columns exist with the spec'd defaults. Idempotent;
--    no-op when the previous migration already created them.
alter table public.vehicles
  add column if not exists image_count integer not null default 0,
  add column if not exists has_images boolean not null default false,
  add column if not exists data_quality_score integer not null default 0;

-- 2. Backfill image_urls for legacy rows that only carry primary_image_url.
--    Strict "count valid URLs in image_urls" below would otherwise mark
--    600+ active rows as has_images=false and bury them as "Needs Attention".
update public.vehicles v
set image_urls = jsonb_build_array(v.primary_image_url)
where v.image_urls is null
  and v.primary_image_url is not null
  and btrim(v.primary_image_url) <> '';

-- 3. Recompute the three merchandising columns with the new weights.
with computed as (
  select
    v.id,
    case
      when jsonb_typeof(v.image_urls) = 'array'
        then jsonb_array_length(v.image_urls)
      else 0
    end as ic,
    case
      when v.source_raw is not null
        and coalesce(
              nullif(btrim(v.source_raw->>'Description'), ''),
              nullif(btrim(v.source_raw->>'Comment1'), '')
            ) is not null
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
      (case when computed.ic > 0 then 50 else 0 end)
    + least(computed.ic, 30)
    + (case when v.internet_price is not null and v.internet_price > 0 then 10 else 0 end)
    + (case when v.mileage is not null then 10 else 0 end)
    + (case when v.trim is not null and btrim(v.trim) <> '' then 5 else 0 end)
    + (case when computed.has_description then 5 else 0 end)
    + (case when v.exterior_color is not null and btrim(v.exterior_color) <> '' then 5 else 0 end)
    + (case when v.interior_color is not null and btrim(v.interior_color) <> '' then 5 else 0 end)
from computed
where v.id = computed.id;

-- 4. Swap the merchandising index so the planner can range-scan the
--    spec'd default order in one pass.
drop index if exists public.vehicles_merchandising_idx;

create index vehicles_merchandising_idx
  on public.vehicles (
    has_images desc,
    image_count desc,
    data_quality_score desc,
    internet_price desc nulls last
  )
  where status = 'active';

-- Single-column indexes that back the admin-only sort views remain in place:
--   vehicles_image_count_idx        → "Most Photos"
--   vehicles_data_quality_score_idx → "Needs Attention"
--   vehicles_created_at_idx         → "Newest Added"
