-- Idempotent seed for public.smart_match_rules (live schema)
-- Natural key: lifestyle (unique constraint smart_match_rules_lifestyle_key)
-- One row per lifestyle. Safe to rerun via ON CONFLICT (lifestyle) DO UPDATE.

-- Collapse duplicate lifestyle rows if a prior seed created more than one per lifestyle.
delete from public.smart_match_rules a
using public.smart_match_rules b
where a.lifestyle = b.lifestyle
  and a.ctid > b.ctid;

-- Remove composite index from earlier seed drafts; live DB uses lifestyle-only uniqueness.
drop index if exists public.smart_match_rules_lifestyle_priority_uidx;

insert into public.smart_match_rules (
  lifestyle,
  priority,
  label_en,
  label_es,
  body_styles,
  makes,
  model_keywords,
  trim_keywords,
  min_price,
  max_price,
  condition,
  is_active,
  updated_at
)
values
  (
    'family',
    10,
    'Spacious SUV or van fit for family and daily life',
    'SUV o van espaciosa para familia y día a día',
    array['suv', 'crossover', 'van', 'minivan', 'wagon'],
    '{}'::text[],
    array['traverse', 'yukon', 'tahoe', 'suburban', 'acadia', 'equinox'],
    '{}'::text[],
    null,
    null,
    null,
    true,
    now()
  ),
  (
    'work',
    20,
    'Truck or capability-focused match for work and towing',
    'Camioneta o opción con capacidad de trabajo y remolque',
    array['truck', 'pickup'],
    '{}'::text[],
    array['sierra', 'silverado', 'f-150', 'ram', 'tundra', 'tacoma', 'towing', 'tow'],
    '{}'::text[],
    null,
    null,
    null,
    true,
    now()
  ),
  (
    'luxury',
    30,
    'Premium brand, elevated trim, or luxury-band pricing',
    'Marca premium, versión elevada o precio en rango de lujo',
    '{}'::text[],
    array[
      'cadillac', 'land rover', 'jaguar', 'bmw', 'mercedes', 'lexus',
      'audi', 'porsche', 'lincoln', 'genesis', 'acura', 'infiniti'
    ],
    array['premium', 'platinum', 'denali', 'escalade'],
    '{}'::text[],
    45000,
    null,
    null,
    true,
    now()
  ),
  (
    'budget',
    40,
    'Value-forward pricing under $30k',
    'Precio accesible por debajo de $30k',
    '{}'::text[],
    '{}'::text[],
    '{}'::text[],
    '{}'::text[],
    null,
    30000,
    null,
    true,
    now()
  ),
  (
    'first-vehicle',
    50,
    'Approachable pre-owned option for a first vehicle',
    'Seminuevo accesible ideal como primer vehículo',
    '{}'::text[],
    '{}'::text[],
    '{}'::text[],
    '{}'::text[],
    null,
    40000,
    'used',
    true,
    now()
  ),
  (
    'fuel-efficient',
    60,
    'Hybrid, electric, or fuel-efficient daily driver',
    'Híbrido, eléctrico o eficiente para el día a día',
    array['hatch', 'sedan'],
    '{}'::text[],
    array[
      'hybrid', 'electric', 'ev', 'phev', 'plug-in',
      'bolt', 'leaf', 'prius', 'mpg', 'fuel efficient'
    ],
    '{}'::text[],
    null,
    35000,
    null,
    true,
    now()
  ),
  (
    'weekend-ready',
    70,
    'Adventure-ready SUV or truck for weekends and road trips',
    'SUV o camioneta lista para aventuras y viajes',
    array['suv', 'truck', 'pickup', 'crossover'],
    '{}'::text[],
    array[
      'awd', '4wd', '4x4', 'off-road', 'towing',
      'trail', 'adventure', 'roof rack'
    ],
    array['trail', 'off-road', 'adventure'],
    null,
    null,
    null,
    true,
    now()
  ),
  (
    'everyday-drive',
    80,
    'Comfortable, efficient daily driver',
    'Conductor diario cómodo y eficiente',
    array['sedan', 'crossover', 'suv', 'hatch', 'compact'],
    '{}'::text[],
    array['commuter', 'daily', 'mpg', 'hybrid', 'comfort'],
    '{}'::text[],
    null,
    45000,
    null,
    true,
    now()
  )
on conflict (lifestyle) do update set
  priority = excluded.priority,
  label_en = excluded.label_en,
  label_es = excluded.label_es,
  body_styles = excluded.body_styles,
  makes = excluded.makes,
  model_keywords = excluded.model_keywords,
  trim_keywords = excluded.trim_keywords,
  min_price = excluded.min_price,
  max_price = excluded.max_price,
  condition = excluded.condition,
  is_active = excluded.is_active,
  updated_at = now();
