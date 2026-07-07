-- Patrimoine de l'investisseur : avoirs hors gamme Private Corner.
-- Enveloppes (immobilier, PEA, PER, assurance-vie, PE, CTO, liquidités…) et
-- supports (RP, locatif, SCPI, ETF, actions, fonds, fonds euro…). Métadonnées
-- déclaratives saisies par le CGP. RLS scopée cabinet.

create table if not exists public.client_assets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  cabinet_id uuid not null references public.cabinets(id) on delete cascade,
  category text not null,
  support text not null default 'autre',
  label text not null,
  value numeric not null default 0,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.client_assets enable row level security;

drop policy if exists client_assets_rw on public.client_assets;
create policy client_assets_rw on public.client_assets for all
  using (cabinet_id = public.current_cabinet_id())
  with check (cabinet_id = public.current_cabinet_id());

create index if not exists idx_client_assets_client on public.client_assets(client_id);

drop trigger if exists trg_client_assets_touch on public.client_assets;
create trigger trg_client_assets_touch before update on public.client_assets
  for each row execute function public.touch_updated_at();
