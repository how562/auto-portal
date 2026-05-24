-- Seed smart_match_rules for all lifestyle categories.
-- Safe to re-run: deletes existing rows for these keys, then inserts fresh.
-- Matching is intentionally inclusive (OR logic, broad coverage).

BEGIN;

DELETE FROM public.smart_match_rules
WHERE key IN (
  'family',
  'work',
  'luxury',
  'budget',
  'first-vehicle',
  'fuel-efficient',
  'weekend-ready',
  'everyday-drive'
);

INSERT INTO public.smart_match_rules
  (key, label_en, label_es, body_styles, makes, model_keywords, trim_keywords,
   min_price, max_price, condition, priority, is_active)
VALUES
  ('family', 'Family', 'Familiar',
   ARRAY['suv','crossover','minivan'],
   NULL,
   ARRAY['tahoe','yukon','explorer','pilot','highlander'],
   ARRAY['family','xl','l'],
   NULL, NULL, 'any', 10, TRUE),

  ('work', 'Work', 'Trabajo',
   ARRAY['truck'],
   NULL,
   ARRAY['silverado','sierra','f150','ram'],
   ARRAY['work','wt','xl','towing','utility'],
   NULL, NULL, 'any', 20, TRUE),

  ('luxury', 'Luxury', 'Lujo',
   ARRAY['suv','sedan'],
   ARRAY['cadillac','land rover','jaguar'],
   ARRAY['escalade','xt5','xt6','range rover'],
   ARRAY['premium','luxury','platinum','denali'],
   40000, NULL, 'any', 30, TRUE),

  ('budget', 'Budget', 'Económico',
   ARRAY['sedan','compact','suv'],
   NULL,
   ARRAY['corolla','civic','sentra','elantra'],
   ARRAY['base','value'],
   NULL, 30000, 'any', 40, TRUE),

  ('first-vehicle', 'First Vehicle', 'Primer Vehículo',
   ARRAY['sedan','compact','small suv'],
   NULL,
   ARRAY['corolla','civic','sentra','forte'],
   ARRAY['base','entry'],
   NULL, 25000, 'any', 50, TRUE),

  ('fuel-efficient', 'Fuel Efficient', 'Eficiente en Combustible',
   ARRAY['sedan','compact','hybrid','electric'],
   NULL,
   ARRAY['prius','leaf','bolt','tesla'],
   ARRAY['hybrid','ev','electric'],
   NULL, NULL, 'any', 60, TRUE),

  ('weekend-ready', 'Weekend Ready', 'Listo para el Fin de Semana',
   ARRAY['truck','suv'],
   NULL,
   ARRAY['bronco','wrangler','4runner','tacoma'],
   ARRAY['offroad','trail','4x4'],
   NULL, NULL, 'any', 70, TRUE),

  ('everyday-drive', 'Everyday Drive', 'Manejo Diario',
   ARRAY['sedan','compact suv'],
   NULL,
   ARRAY['camry','accord','crv','rogue'],
   ARRAY['standard','reliable'],
   NULL, NULL, 'any', 80, TRUE);

COMMIT;
