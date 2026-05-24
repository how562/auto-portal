-- Add is_active toggle to stores so dealerships can be turned on/off
-- without deleting any data. Safe to re-run.

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS stores_is_active_idx
  ON public.stores (is_active);

-- Backfill: any existing rows default to active (true).
UPDATE public.stores SET is_active = true WHERE is_active IS NULL;
