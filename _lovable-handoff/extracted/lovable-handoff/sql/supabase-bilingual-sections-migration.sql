-- Bilingual editing support for page_sections.
-- Adds Spanish counterparts for the user-editable copy fields.
-- Safe to run multiple times.

alter table public.page_sections
  add column if not exists headline_es    text,
  add column if not exists subheadline_es text,
  add column if not exists body_es        text,
  add column if not exists cta_text_es    text;
