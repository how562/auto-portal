-- File-pattern → store mapping table for the HomeNet importer.
-- Lets ops route incoming files to the right dealership without code changes.
-- Admin-only; never used to edit vehicle data.

CREATE TABLE IF NOT EXISTS public.feed_file_mappings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_pattern  text NOT NULL,
  store_id      uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  is_active     boolean NOT NULL DEFAULT true,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feed_file_mappings_store_idx
  ON public.feed_file_mappings (store_id);
CREATE INDEX IF NOT EXISTS feed_file_mappings_active_idx
  ON public.feed_file_mappings (is_active);
CREATE UNIQUE INDEX IF NOT EXISTS feed_file_mappings_pattern_store_uniq
  ON public.feed_file_mappings (file_pattern, store_id);

ALTER TABLE public.feed_file_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feed_file_mappings read all" ON public.feed_file_mappings;
DROP POLICY IF EXISTS "feed_file_mappings write authenticated" ON public.feed_file_mappings;

-- Admin app uses authenticated session; tighten as roles are introduced.
CREATE POLICY "feed_file_mappings read all"
  ON public.feed_file_mappings FOR SELECT
  USING (true);

CREATE POLICY "feed_file_mappings write authenticated"
  ON public.feed_file_mappings FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);
