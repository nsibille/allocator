-- Timeline d'activité relationnelle par client (CRM data-driven).
-- Journalise les événements du cycle de vie : consultation, relation, qualification,
-- souscription, flux (appels/distributions), notes CGP, mises à jour.

-- Acteur à l'origine de l'événement
do $$ begin
  create type event_actor as enum ('conseiller','client','systeme');
exception when duplicate_object then null; end $$;

-- Types d'événements (large, couvrant le cycle de vie)
do $$ begin
  create type client_event_type as enum (
    'client_created',
    'login',
    'fund_viewed',
    'document_viewed',
    'document_downloaded',
    'document_added',
    'document_updated',
    'proposal_created',
    'proposal_sent',
    'proposal_viewed',
    'questionnaire_updated',
    'profile_updated',
    'status_changed',
    'contact_added',
    'phone_call',
    'meeting',
    'email',
    'note',
    'subscription_created',
    'subscription_signed',
    'capital_call',
    'distribution',
    'other'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.client_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  cabinet_id uuid not null references public.cabinets(id) on delete cascade,
  type client_event_type not null,
  actor event_actor not null default 'conseiller',
  title text,
  body text,
  -- Données spécifiques à l'événement (fonds, document, montant, état de flux…)
  data jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.client_events enable row level security;

drop policy if exists client_events_rw on public.client_events;
create policy client_events_rw on public.client_events for all
  using (cabinet_id = public.current_cabinet_id())
  with check (cabinet_id = public.current_cabinet_id());

create index if not exists idx_client_events_client
  on public.client_events(client_id, occurred_at desc);
