-- =============================================================================
-- VDP pricing debug — inspect source_raw vs mapped columns
-- Run in Supabase SQL Editor (temporary helper; not a migration).
--
-- Matches keys related to: price, msrp, selling, rebate, incentive, cash,
-- allowance, bonus, fee, doc, discount (case-insensitive).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) QUICK START — key/value rows for selected vehicles
--    Uncomment ONE filter block at the bottom (vin, id, or sample limit).
-- -----------------------------------------------------------------------------
with pricing_rows as (
  select
    v.id,
    v.vin,
    v.stock_number,
    v.condition,
    v.year,
    v.make,
    v.model,
    v.internet_price,
    v.msrp,
    v.sale_price,
    kv.key   as source_key,
    kv.value as source_value
  from public.vehicles v
  cross join lateral jsonb_each_text(v.source_raw) as kv(key, value)
  where v.source_raw is not null
    and kv.key ~* '(price|msrp|selling|rebate|incentive|cash|allowance|bonus|fee|doc|discount)'
    -- --- pick your scope (uncomment one) ---
    -- and v.vin = '1HGBH41JXMN109186'
    -- and v.id = '00000000-0000-0000-0000-000000000000'::uuid
    and v.status = 'active'
)
select *
from pricing_rows
order by vin nulls last, source_key
limit 200;


-- -----------------------------------------------------------------------------
-- 2) PER-VEHICLE SUMMARY — mapped columns + all matching source_raw keys
--    Good for comparing feed vs DB columns side-by-side.
-- -----------------------------------------------------------------------------
/*
with scoped_vehicles as (
  select v.*
  from public.vehicles v
  where v.source_raw is not null
    and v.status = 'active'
    -- and v.vin = '1HGBH41JXMN109186'
  order by v.imported_at desc nulls last
  limit 20
),
pricing_kv as (
  select
    sv.id,
    kv.key,
    kv.value
  from scoped_vehicles sv
  cross join lateral jsonb_each_text(sv.source_raw) as kv(key, value)
  where kv.key ~* '(price|msrp|selling|rebate|incentive|cash|allowance|bonus|fee|doc|discount)'
)
select
  sv.id,
  sv.vin,
  sv.stock_number,
  sv.condition,
  sv.year,
  sv.make,
  sv.model,
  sv.internet_price,
  sv.msrp,
  sv.sale_price,
  coalesce(
    jsonb_object_agg(pk.key, pk.value order by pk.key)
      filter (where pk.key is not null),
    '{}'::jsonb
  ) as pricing_source_raw,
  count(pk.key) as pricing_key_count
from scoped_vehicles sv
left join pricing_kv pk on pk.id = sv.id
group by
  sv.id,
  sv.vin,
  sv.stock_number,
  sv.condition,
  sv.year,
  sv.make,
  sv.model,
  sv.internet_price,
  sv.msrp,
  sv.sale_price
order by sv.vin nulls last;
*/


-- -----------------------------------------------------------------------------
-- 3) COLUMN vs FEED CHECK — common HomeNet keys vs mapped columns
--    Surfaces mismatches (e.g. Internet_Price in raw but internet_price null).
-- -----------------------------------------------------------------------------
/*
select
  v.id,
  v.vin,
  v.stock_number,
  v.condition,
  v.internet_price,
  v.msrp,
  v.sale_price,
  nullif(btrim(v.source_raw->>'Internet_Price'), '')   as raw_internet_price,
  nullif(btrim(v.source_raw->>'InternetPrice'), '')    as raw_internetprice,
  nullif(btrim(v.source_raw->>'SellingPrice'), '')      as raw_selling_price,
  nullif(btrim(v.source_raw->>'MSRP'), '')              as raw_msrp,
  nullif(btrim(v.source_raw->>'OriginalMSRP'), '')      as raw_original_msrp,
  nullif(btrim(v.source_raw->>'Price'), '')             as raw_price,
  nullif(btrim(v.source_raw->>'DealerPrice'), '')       as raw_dealer_price
from public.vehicles v
where v.source_raw is not null
  and v.status = 'active'
  -- and v.vin = '1HGBH41JXMN109186'
order by v.imported_at desc nulls last
limit 50;
*/


-- -----------------------------------------------------------------------------
-- 4) INVENTORY-WIDE KEY DISCOVERY — which pricing keys exist in your feed?
--    Run once to see every distinct key name before mapping in the importer.
-- -----------------------------------------------------------------------------
/*
select
  kv.key,
  count(*) as row_count,
  count(*) filter (where nullif(btrim(kv.value), '') is not null) as non_empty_count,
  min(kv.value) as example_value
from public.vehicles v
cross join lateral jsonb_each_text(v.source_raw) as kv(key, value)
where v.source_raw is not null
  and v.status = 'active'
  and kv.key ~* '(price|msrp|selling|rebate|incentive|cash|allowance|bonus|fee|doc|discount)'
group by kv.key
order by row_count desc, kv.key;
*/


-- -----------------------------------------------------------------------------
-- 5) VEHICLES WITH NO PRICING KEYS IN source_raw (sanity check)
-- -----------------------------------------------------------------------------
/*
select
  v.id,
  v.vin,
  v.stock_number,
  v.internet_price,
  v.msrp,
  v.sale_price,
  v.source_raw is null as missing_source_raw
from public.vehicles v
where v.status = 'active'
  and (
    v.source_raw is null
    or not exists (
      select 1
      from jsonb_each_text(v.source_raw) kv(key, value)
      where kv.key ~* '(price|msrp|selling|rebate|incentive|cash|allowance|bonus|fee|doc|discount)'
    )
  )
order by v.imported_at desc nulls last
limit 50;
*/
