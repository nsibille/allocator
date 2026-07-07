-- Refonte du funnel de création de simulation.
-- 1) Métadonnées d'éligibilité réglementaire sur la gamme (véhicule + gating MiFID).
-- 2) Qualification enrichie de l'allocation (entrées funnel + score de dynamisme + périmètre choisi).

-- 1. Éligibilité des fonds.
alter table public.funds
  add column if not exists vehicle text not null default 'eltif',
  add column if not exists professional_only boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'funds_vehicle_check'
  ) then
    alter table public.funds
      add constraint funds_vehicle_check
      check (vehicle in ('eltif', 'fcpr', 'fcpi', 'fip', 'feeder'));
  end if;
end $$;

-- Répartition réaliste sur la gamme réelle (majorité ELTIF, quelques variantes).
update public.funds set vehicle = 'fcpr'   where slug = 'pc-credit-yield';
update public.funds set vehicle = 'feeder' where slug in ('blue-owl-gp-stakes', 'pc-secondary-2026');
-- Fonds à risque maximal réservés aux investisseurs professionnels (gating MiFID).
update public.funds set professional_only = true
  where slug in ('merieux-innovation-ii', 'pc-european-semiconductor');

-- 2. Qualification enrichie de l'allocation.
--    jsonb : { mifidStatus, acceptedVehicles[], ticketMin, revenusStability, lossCapacity,
--              reactionBaisse, autoSelect, dynamismScore, subScores{}, selectedFundIds[] }.
alter table public.allocations
  add column if not exists qualification jsonb;
