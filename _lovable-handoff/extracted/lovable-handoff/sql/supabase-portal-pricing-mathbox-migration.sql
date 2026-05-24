-- Math Box admin presentation table.
-- Admin controls labels, ordering, grouping, visibility, conditional flag,
-- applies_to, and disclaimer ONLY. All money values come from feeds.

BEGIN;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TABLE IF NOT EXISTS public.portal_pricing_mathbox_config (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_key        text NOT NULL UNIQUE,            -- stable identifier, e.g. msrp, dealer_discount, doc_fee, final_price
  label           text NOT NULL,                   -- admin-editable display label
  group_name      text NOT NULL DEFAULT 'standard'
                    CHECK (group_name IN ('standard','discounts','conditional','fees','final')),
  line_type       text NOT NULL DEFAULT 'charge'
                    CHECK (line_type IN ('charge','discount','subtotal','final','info')),
  sort_order      integer NOT NULL DEFAULT 0,
  is_active       boolean NOT NULL DEFAULT true,
  is_conditional  boolean NOT NULL DEFAULT false,
  applies_to      text NOT NULL DEFAULT 'all'
                    CHECK (applies_to IN ('new','used','all')),
  disclaimer      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portal_pricing_mathbox_config_order_idx
  ON public.portal_pricing_mathbox_config (group_name, sort_order);

DROP TRIGGER IF EXISTS portal_pricing_mathbox_config_touch
  ON public.portal_pricing_mathbox_config;
CREATE TRIGGER portal_pricing_mathbox_config_touch
  BEFORE UPDATE ON public.portal_pricing_mathbox_config
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.portal_pricing_mathbox_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mathbox_read"  ON public.portal_pricing_mathbox_config;
DROP POLICY IF EXISTS "mathbox_write" ON public.portal_pricing_mathbox_config;

CREATE POLICY "mathbox_read"
  ON public.portal_pricing_mathbox_config FOR SELECT USING (true);

CREATE POLICY "mathbox_write"
  ON public.portal_pricing_mathbox_config FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Seed common math box lines (no money values; presentation only)
INSERT INTO public.portal_pricing_mathbox_config
  (line_key, label, group_name, line_type, sort_order, is_conditional, applies_to)
VALUES
  ('msrp',             'MSRP',                       'standard',    'charge',   10, false, 'new'),
  ('selling_price',    'Selling Price',              'standard',    'charge',   20, false, 'all'),
  ('dealer_discount',  'Dealer Discount',            'discounts',   'discount', 30, false, 'all'),
  ('manufacturer_rebate','Manufacturer Rebate',      'discounts',   'discount', 40, false, 'new'),
  ('subtotal',         'Subtotal',                   'discounts',   'subtotal', 50, false, 'all'),
  ('military_rebate',  'Military Rebate',            'conditional', 'discount', 60, true,  'new'),
  ('college_rebate',   'College Grad Rebate',        'conditional', 'discount', 70, true,  'new'),
  ('finance_rebate',   'Finance Rebate (w/ OEM)',    'conditional', 'discount', 80, true,  'new'),
  ('doc_fee',          'Doc Fee',                    'fees',        'charge',   90, false, 'all'),
  ('final_price',      'Your Price',                 'final',       'final',   100, false, 'all')
ON CONFLICT (line_key) DO NOTHING;

COMMIT;
