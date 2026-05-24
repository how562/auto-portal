-- VDP admin presentation tables.
-- Admin controls labels, visibility, ordering ONLY. All vehicle values
-- (msrp, price, specs, etc.) come from inventory feeds and are NOT
-- editable here.

BEGIN;

-- Reusable touch-updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 1) portal_vdp_ctas -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_vdp_ctas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label        text NOT NULL,
  action_type  text NOT NULL,                       -- e.g. lead_form, call, text, finance, schedule, trade, external
  applies_to   text NOT NULL DEFAULT 'all'
                 CHECK (applies_to IN ('new','used','all')),
  is_primary   boolean NOT NULL DEFAULT false,
  sort_order   integer NOT NULL DEFAULT 0,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portal_vdp_ctas_order_idx
  ON public.portal_vdp_ctas (sort_order);
DROP TRIGGER IF EXISTS portal_vdp_ctas_touch ON public.portal_vdp_ctas;
CREATE TRIGGER portal_vdp_ctas_touch BEFORE UPDATE ON public.portal_vdp_ctas
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2) portal_pricing_config (singleton row) -------------------------------
CREATE TABLE IF NOT EXISTS public.portal_pricing_config (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  show_msrp                boolean NOT NULL DEFAULT true,
  show_discount            boolean NOT NULL DEFAULT true,
  show_doc_fee             boolean NOT NULL DEFAULT false,
  doc_fee_label            text    NOT NULL DEFAULT 'Doc Fee',
  price_label              text    NOT NULL DEFAULT 'Internet Price',
  disclaimer_text          text,
  show_conditional_offers  boolean NOT NULL DEFAULT true,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS portal_pricing_config_touch ON public.portal_pricing_config;
CREATE TRIGGER portal_pricing_config_touch BEFORE UPDATE ON public.portal_pricing_config
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed one row if empty
INSERT INTO public.portal_pricing_config (show_msrp)
SELECT true
WHERE NOT EXISTS (SELECT 1 FROM public.portal_pricing_config);

-- 3) portal_vdp_sections -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_vdp_sections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key  text NOT NULL UNIQUE,                -- e.g. gallery, pricing, specs, features, smart_match, trust, finance, contact, similar
  label        text,
  is_active    boolean NOT NULL DEFAULT true,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portal_vdp_sections_order_idx
  ON public.portal_vdp_sections (sort_order);
DROP TRIGGER IF EXISTS portal_vdp_sections_touch ON public.portal_vdp_sections;
CREATE TRIGGER portal_vdp_sections_touch BEFORE UPDATE ON public.portal_vdp_sections
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.portal_vdp_sections (section_key, label, sort_order)
VALUES
  ('gallery',     'Gallery',         10),
  ('pricing',     'Pricing',         20),
  ('smart_match', 'Smart Match',     30),
  ('specs',       'Specs',           40),
  ('features',    'Features',        50),
  ('trust',       'Trust Badges',    60),
  ('finance',     'Finance',         70),
  ('contact',     'Contact',         80),
  ('similar',     'Similar Vehicles',90)
ON CONFLICT (section_key) DO NOTHING;

-- 4) portal_trust_badges -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_trust_badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label       text NOT NULL,
  icon        text,                                 -- lucide icon name or URL
  sort_order  integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portal_trust_badges_order_idx
  ON public.portal_trust_badges (sort_order);
DROP TRIGGER IF EXISTS portal_trust_badges_touch ON public.portal_trust_badges;
CREATE TRIGGER portal_trust_badges_touch BEFORE UPDATE ON public.portal_trust_badges
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS: admin-only write, public read (VDP needs to render these) ---------
ALTER TABLE public.portal_vdp_ctas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_vdp_sections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_trust_badges   ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'portal_vdp_ctas','portal_pricing_config',
    'portal_vdp_sections','portal_trust_badges'
  ] LOOP
    EXECUTE format($f$
      DROP POLICY IF EXISTS "%1$s_read"  ON public.%1$I;
      DROP POLICY IF EXISTS "%1$s_admin" ON public.%1$I;
      CREATE POLICY "%1$s_read"  ON public.%1$I FOR SELECT USING (true);
      CREATE POLICY "%1$s_admin" ON public.%1$I FOR ALL
        USING (public.has_role(auth.uid(), 'admin'))
        WITH CHECK (public.has_role(auth.uid(), 'admin'));
    $f$, t);
  END LOOP;
END $$;

COMMIT;
