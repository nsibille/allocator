-- Extensions
create extension if not exists "pgcrypto";

-- Enums (guards idempotents)
do $$ begin
  create type risk_profile as enum ('prudent','equilibre','dynamique','offensif');
exception when duplicate_object then null; end $$;

do $$ begin
  create type strategy_bucket as enum ('defensif','coeur','croissance','satellite');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pacing_profile as enum ('buyout','growth','innovation','credit','infra','secondary','gpstakes');
exception when duplicate_object then null; end $$;

do $$ begin
  create type allocation_status as enum ('draft','proposed','validated','subscribed','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type bulletin_status as enum ('generated','sent','signed','received');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_role as enum ('conseiller','admin');
exception when duplicate_object then null; end $$;

-- Cabinets
create table if not exists public.cabinets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  orias text,
  created_at timestamptz not null default now()
);

-- Profils (1-1 avec auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  cabinet_id uuid references public.cabinets(id) on delete set null,
  full_name text,
  email text,
  role app_role not null default 'conseiller',
  created_at timestamptz not null default now()
);

-- Clients HNWI (référence anonymisée)
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references public.cabinets(id) on delete cascade,
  conseiller_id uuid references public.profiles(id) on delete set null,
  reference text not null,
  patrimoine_financier numeric(14,2),
  risk_profile risk_profile,
  experience text,
  horizon_years int,
  liquidity text,
  notes text,
  created_at timestamptz not null default now()
);

-- Gamme de fonds (référentiel partagé, lecture pour tout authentifié)
create table if not exists public.funds (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  manager text not null,
  strategy text not null,
  bucket strategy_bucket not null,
  pacing pacing_profile not null,
  min_ticket numeric(12,2) not null default 100000,
  closing_label text not null,
  closing_date date,
  risk_score int check (risk_score between 1 and 5),
  esg_score int default 0 check (esg_score between 0 and 2),
  target_multiple numeric(4,2) not null,
  target_gross_irr numeric(4,3) not null,
  is_active boolean not null default true,
  sort_order int not null default 0
);

-- Allocations
create table if not exists public.allocations (
  id uuid primary key default gen_random_uuid(),
  cabinet_id uuid not null references public.cabinets(id) on delete cascade,
  conseiller_id uuid references public.profiles(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  name text not null default 'Nouvelle allocation',
  envelope_amount numeric(14,2) not null,
  risk_profile risk_profile not null,
  horizon_years int not null default 10,
  objectives jsonb not null default '[]'::jsonb,
  strategies jsonb not null default '[]'::jsonb,
  esg boolean not null default false,
  diversification text not null default 'equilibre',
  scenario text not null default 'central',
  dist_pace int not null default 0,
  status allocation_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lignes d'allocation
create table if not exists public.allocation_lines (
  id uuid primary key default gen_random_uuid(),
  allocation_id uuid not null references public.allocations(id) on delete cascade,
  fund_id uuid not null references public.funds(id) on delete restrict,
  amount numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (allocation_id, fund_id)
);

-- Bulletins de souscription
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  allocation_id uuid not null references public.allocations(id) on delete cascade,
  fund_id uuid not null references public.funds(id) on delete restrict,
  cabinet_id uuid not null references public.cabinets(id) on delete cascade,
  reference text not null,
  amount numeric(14,2) not null,
  status bulletin_status not null default 'generated',
  generated_at timestamptz not null default now()
);

-- updated_at auto
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_alloc_touch on public.allocations;
create trigger trg_alloc_touch before update on public.allocations
  for each row execute function public.touch_updated_at();

-- Création auto du profil à l'inscription + rattachement au cabinet de démo
-- (UUID fixe seedé en section 7). Pour une prod multi-cabinet, retirer le cabinet_id
-- par défaut et brancher un vrai onboarding (voir section 9).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, cabinet_id)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email),
          '00000000-0000-0000-0000-0000000000c1')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers RLS
create or replace function public.current_cabinet_id()
returns uuid language sql stable security definer set search_path = public as $$
  select cabinet_id from public.profiles where id = auth.uid();
$$;

-- Activation RLS
alter table public.cabinets         enable row level security;
alter table public.profiles         enable row level security;
alter table public.clients          enable row level security;
alter table public.funds            enable row level security;
alter table public.allocations      enable row level security;
alter table public.allocation_lines enable row level security;
alter table public.subscriptions    enable row level security;

-- Policies : profiles
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select
  using (id = auth.uid() or cabinet_id = public.current_cabinet_id());
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Policies : cabinets (membres du cabinet en lecture)
drop policy if exists cabinets_member_select on public.cabinets;
create policy cabinets_member_select on public.cabinets for select
  using (id = public.current_cabinet_id());

-- Policies : funds (référentiel, lecture pour tout authentifié)
drop policy if exists funds_read on public.funds;
create policy funds_read on public.funds for select
  using (auth.role() = 'authenticated');

-- Policies génériques scoping par cabinet
drop policy if exists clients_rw on public.clients;
create policy clients_rw on public.clients for all
  using (cabinet_id = public.current_cabinet_id())
  with check (cabinet_id = public.current_cabinet_id());

drop policy if exists allocations_rw on public.allocations;
create policy allocations_rw on public.allocations for all
  using (cabinet_id = public.current_cabinet_id())
  with check (cabinet_id = public.current_cabinet_id());

drop policy if exists alloc_lines_rw on public.allocation_lines;
create policy alloc_lines_rw on public.allocation_lines for all
  using (exists (select 1 from public.allocations a
                 where a.id = allocation_id and a.cabinet_id = public.current_cabinet_id()))
  with check (exists (select 1 from public.allocations a
                 where a.id = allocation_id and a.cabinet_id = public.current_cabinet_id()));

drop policy if exists subscriptions_rw on public.subscriptions;
create policy subscriptions_rw on public.subscriptions for all
  using (cabinet_id = public.current_cabinet_id())
  with check (cabinet_id = public.current_cabinet_id());

-- Index
create index if not exists idx_alloc_cabinet on public.allocations(cabinet_id);
create index if not exists idx_lines_alloc on public.allocation_lines(allocation_id);
create index if not exists idx_clients_cabinet on public.clients(cabinet_id);
create index if not exists idx_subs_alloc on public.subscriptions(allocation_id);
