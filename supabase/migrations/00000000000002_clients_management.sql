-- Gestion des clients côté Distributeur (client-first).
-- Enrichit public.clients (identité nominative + questionnaires JSONB + statut),
-- ajoute public.client_documents (checklist KYC, métadonnées seules).
-- Non destructif : toutes les colonnes ajoutées sont nullables ou avec valeur par défaut.

-- Enums (guards idempotents)
do $$ begin
  create type client_status as enum ('prospect','actif','archive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type document_status as enum ('manquant','recu','valide','expire');
exception when duplicate_object then null; end $$;

-- Colonnes clients : identité nominative
alter table public.clients
  add column if not exists first_name  text,
  add column if not exists last_name   text,
  add column if not exists email        text,
  add column if not exists phone        text,
  add column if not exists address      text,
  add column if not exists birth_date   date,
  add column if not exists nationality  text;

-- Statut d'administration
alter table public.clients
  add column if not exists status client_status not null default 'prospect';

-- Questionnaires de qualification (JSONB structuré, pilotés par la config applicative)
alter table public.clients
  add column if not exists kyc          jsonb not null default '{}'::jsonb,
  add column if not exists adequacy     jsonb not null default '{}'::jsonb,
  add column if not exists esg_profile  jsonb not null default '{}'::jsonb,
  add column if not exists tax          jsonb not null default '{}'::jsonb;

-- updated_at + trigger (réutilise public.touch_updated_at du schéma initial)
alter table public.clients
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_clients_touch on public.clients;
create trigger trg_clients_touch before update on public.clients
  for each row execute function public.touch_updated_at();

-- Documents (métadonnées seules : checklist KYC, pas d'upload fichier)
create table if not exists public.client_documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  cabinet_id uuid not null references public.cabinets(id) on delete cascade,
  name text not null,
  doc_type text not null default 'autre',
  status document_status not null default 'manquant',
  note text,
  created_at timestamptz not null default now()
);

alter table public.client_documents enable row level security;

drop policy if exists client_documents_rw on public.client_documents;
create policy client_documents_rw on public.client_documents for all
  using (cabinet_id = public.current_cabinet_id())
  with check (cabinet_id = public.current_cabinet_id());

create index if not exists idx_client_docs_client on public.client_documents(client_id);
