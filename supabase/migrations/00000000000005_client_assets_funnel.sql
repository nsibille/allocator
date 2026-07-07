-- Patrimoine : enrichit client_assets pour le funnel par classe d'actif.
-- envelope : enveloppe fiscale (PEA, CTO, assurance-vie…) — informatif.
-- geography : zone géographique déclarée (rend la consolidation exacte).
alter table public.client_assets
  add column if not exists envelope text,
  add column if not exists geography text;
