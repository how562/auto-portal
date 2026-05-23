-- Split HomeNet pricing into separate internet_price / msrp / sale_price
-- columns and stop persisting $0 as a real price.
--
-- Background: HomeNet routinely sends `Internet_Price=0` on new vehicles
-- where the actual numbers live under `SellingPrice` and `MSRP`. The
-- previous importer collapsed all three into one column and could end
-- up writing 0, which made cards display "$0".
--
-- New rule (mirrors lib/import/dealerSendMap.ts and lib/format.ts):
--
--   internet_price  = first POSITIVE value among
--                       Internet_Price, SellingPrice — else NULL
--   msrp            = first POSITIVE value among
--                       MSRP, OriginalMSRP — else NULL
--   sale_price      = first POSITIVE value of SellingPrice — else NULL
--
--   Display priority: internet_price > 0 → msrp > 0 → "Call for Price".
--
-- Treats 0, blanks, and missing as null EVERYWHERE so $0 cannot leak
-- back into the UI.

-- 1. Make sure msrp / sale_price columns exist. The Frontier project
--    already has both as numeric, so this is a no-op there but keeps
--    the migration runnable on fresh environments.
alter table public.vehicles
  add column if not exists msrp numeric,
  add column if not exists sale_price numeric;

-- 2. Demote any current $0 internet_price to NULL. Customers must
--    never see $0 — the UI fallback will pick up MSRP or "Call for
--    Price" once this is null.
update public.vehicles
set internet_price = null
where internet_price is not null
  and internet_price <= 0;

-- Same defensive cleanup for msrp / sale_price (in case older imports
-- ever wrote a 0).
update public.vehicles set msrp = null where msrp is not null and msrp <= 0;
update public.vehicles
  set sale_price = null
  where sale_price is not null and sale_price <= 0;

-- 3. Backfill the three price columns from source_raw whenever the
--    column is currently empty. POSITIVE values only — 0 stays NULL.
with parsed as (
  select
    v.id,
    nullif(
      regexp_replace(coalesce(v.source_raw->>'Internet_Price', ''), '[^0-9.]', '', 'g'),
      ''
    )::numeric as internet_raw,
    nullif(
      regexp_replace(coalesce(v.source_raw->>'SellingPrice', ''), '[^0-9.]', '', 'g'),
      ''
    )::numeric as selling_raw,
    nullif(
      regexp_replace(coalesce(v.source_raw->>'MSRP', ''), '[^0-9.]', '', 'g'),
      ''
    )::numeric as msrp_raw,
    nullif(
      regexp_replace(coalesce(v.source_raw->>'OriginalMSRP', ''), '[^0-9.]', '', 'g'),
      ''
    )::numeric as original_msrp_raw
  from public.vehicles v
  where v.source_raw is not null
)
update public.vehicles v
set
  internet_price = coalesce(
    v.internet_price,
    case when parsed.internet_raw > 0 then parsed.internet_raw end,
    case when parsed.selling_raw  > 0 then parsed.selling_raw  end
  ),
  msrp = coalesce(
    v.msrp,
    case when parsed.msrp_raw          > 0 then parsed.msrp_raw          end,
    case when parsed.original_msrp_raw > 0 then parsed.original_msrp_raw end
  ),
  sale_price = coalesce(
    v.sale_price,
    case when parsed.selling_raw > 0 then parsed.selling_raw end
  )
from parsed
where v.id = parsed.id;

-- 4. Recompute data_quality_score with the updated "price exists" rule.
--    A vehicle counts as having pricing data when EITHER internet_price
--    or msrp is positive — that's exactly the test the UI uses to
--    decide whether to show a price or "Call for Price".
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
    + (case
         when (v.internet_price is not null and v.internet_price > 0)
           or (v.msrp is not null and v.msrp > 0)
         then 10 else 0
       end)
    + (case when v.mileage is not null then 10 else 0 end)
    + (case when v.trim is not null and btrim(v.trim) <> '' then 5 else 0 end)
    + (case when computed.has_description then 5 else 0 end)
    + (case when v.exterior_color is not null and btrim(v.exterior_color) <> '' then 5 else 0 end)
    + (case when v.interior_color is not null and btrim(v.interior_color) <> '' then 5 else 0 end)
from computed
where v.id = computed.id;

-- 5. Optional: a safety guard at the column level. internet_price MUST
--    never be 0 once this migration runs. The check is permissive
--    (NULL allowed) so legitimately price-less vehicles still write.
alter table public.vehicles
  drop constraint if exists vehicles_internet_price_positive;

alter table public.vehicles
  add constraint vehicles_internet_price_positive
  check (internet_price is null or internet_price > 0)
  not valid;

alter table public.vehicles
  validate constraint vehicles_internet_price_positive;
