-- Add structured image array column for HomeNet inventory and backfill key
-- vehicle fields from source_raw so the portal renders images, mileage,
-- prices, and dealer/store linkage without waiting for the next import.

alter table public.vehicles
  add column if not exists image_urls jsonb;

-- ---------------------------------------------------------------------------
-- Backfill primary_image_url + image_urls from HomeNet ImageList
-- ImageList is a comma-separated string of absolute https URLs.
-- ---------------------------------------------------------------------------

with parsed as (
  select
    v.id,
    -- Split the comma list, trim whitespace, drop blanks / non-http entries.
    (
      select coalesce(jsonb_agg(url order by ordinality), '[]'::jsonb)
      from (
        select btrim(part) as url, ordinality
        from unnest(string_to_array(v.source_raw->>'ImageList', ',')) with ordinality as t(part, ordinality)
      ) parts
      where url <> ''
        and (url like 'http://%' or url like 'https://%' or url like '//%')
    ) as urls
  from public.vehicles v
  where v.source_raw is not null
    and coalesce(v.source_raw->>'ImageList', '') <> ''
)
update public.vehicles v
set
  image_urls = parsed.urls,
  primary_image_url = coalesce(
    nullif(v.primary_image_url, ''),
    parsed.urls->>0
  )
from parsed
where v.id = parsed.id
  and jsonb_array_length(parsed.urls) > 0;

-- ---------------------------------------------------------------------------
-- Backfill mileage from source_raw->>'Miles' when missing.
-- ---------------------------------------------------------------------------

update public.vehicles v
set mileage = nullif(regexp_replace(v.source_raw->>'Miles', '[^0-9]', '', 'g'), '')::int
where v.mileage is null
  and v.source_raw is not null
  and coalesce(v.source_raw->>'Miles', '') ~ '[0-9]';

-- ---------------------------------------------------------------------------
-- Backfill internet_price: prefer Internet_Price, then SellingPrice, then MSRP.
-- New vehicles in the HomeNet feed often have Internet_Price=0 with the real
-- number sitting under SellingPrice or MSRP.
-- ---------------------------------------------------------------------------

update public.vehicles v
set internet_price = sub.price
from (
  select
    id,
    coalesce(
      nullif(regexp_replace(coalesce(source_raw->>'Internet_Price', ''), '[^0-9.]', '', 'g'), '')::numeric,
      0
    ) as internet_raw,
    coalesce(
      nullif(regexp_replace(coalesce(source_raw->>'SellingPrice', ''),  '[^0-9.]', '', 'g'), '')::numeric,
      0
    ) as selling_raw,
    coalesce(
      nullif(regexp_replace(coalesce(source_raw->>'MSRP', ''),          '[^0-9.]', '', 'g'), '')::numeric,
      0
    ) as msrp_raw,
    case
      when nullif(regexp_replace(coalesce(source_raw->>'Internet_Price', ''), '[^0-9.]', '', 'g'), '')::numeric > 0
        then nullif(regexp_replace(source_raw->>'Internet_Price', '[^0-9.]', '', 'g'), '')::numeric
      when nullif(regexp_replace(coalesce(source_raw->>'SellingPrice', ''), '[^0-9.]', '', 'g'), '')::numeric > 0
        then nullif(regexp_replace(source_raw->>'SellingPrice', '[^0-9.]', '', 'g'), '')::numeric
      when nullif(regexp_replace(coalesce(source_raw->>'MSRP', ''), '[^0-9.]', '', 'g'), '')::numeric > 0
        then nullif(regexp_replace(source_raw->>'MSRP', '[^0-9.]', '', 'g'), '')::numeric
      else null
    end as price
  from public.vehicles
  where source_raw is not null
) sub
where v.id = sub.id
  and sub.price is not null
  and (v.internet_price is null or v.internet_price = 0);

-- ---------------------------------------------------------------------------
-- Backfill store_id by matching source_raw->>'DealerName' to stores.name.
-- Skips rows that would collide with the (store_id, vin) unique constraint —
-- typically duplicates of an earlier seed row at the same store.
-- ---------------------------------------------------------------------------

update public.vehicles v
set store_id = s.id
from public.stores s
where v.store_id is null
  and v.source_raw is not null
  and coalesce(v.source_raw->>'DealerName', '') <> ''
  and lower(btrim(v.source_raw->>'DealerName')) = lower(btrim(s.name))
  and not exists (
    select 1
    from public.vehicles v2
    where v2.id <> v.id
      and v2.store_id = s.id
      and v2.vin is not distinct from v.vin
  );
