-- Additional portal copy keys for homepage, inventory, and discovery sections.
insert into public.portal_text_settings (text_key, label_en, label_es, category) values
  (
    'homepage.title',
    'Cavender Confidence.' || E'\n' || 'Driven by Impact.',
    'Confianza Cavender.' || E'\n' || 'Impulsados por el impacto.',
    'homepage'
  ),
  (
    'homepage.subtitle',
    'At Cavender Auto Group, every vehicle we sell supports the people and causes that make our communities stronger. Together, we''re driving more than change — we''re building a better tomorrow.',
    'En Cavender Auto Group, cada vehículo que vendemos apoya a las personas y causas que fortalecen nuestras comunidades. Juntos impulsamos algo más que cambio: construimos un mejor mañana.',
    'homepage'
  ),
  (
    'inventory.title',
    'Inventory Command Center',
    'Centro de comando de inventario',
    'inventory'
  ),
  (
    'discovery.heading',
    'How do you drive?',
    '¿Cómo manejas?',
    'discovery'
  )
on conflict (text_key) do nothing;
