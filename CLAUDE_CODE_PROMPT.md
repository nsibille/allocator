# CLAUDE_CODE_PROMPT — Private Corner · Portail d'allocation CGP

> Fichier de specs à lire intégralement avant tout code. Source de vérité fonctionnelle et technique.

---

## 1. Contexte produit

Private Corner est une société de gestion qui démocratise l'accès au non-coté. Ce portail est destiné
aux **Conseillers en Gestion de Patrimoine (CGP)** qui exercent en **gestion déléguée** pour le compte
de leurs clients **HNWI**. Le CGP est l'utilisateur ; le client HNWI final n'a pas accès au portail et
n'est représenté que par une **référence anonymisée**.

Parcours cible : le CGP qualifie le besoin via un funnel → le moteur propose une allocation détaillée
sur la gamme Private Corner → le CGP ajuste et visualise les projections en temps réel → il exporte la
note d'allocation en PDF → il initialise les souscriptions (un bulletin par compartiment).

Un CGP appartient à un **cabinet**. Toutes les données (clients, allocations, souscriptions) sont
cloisonnées par cabinet via RLS (multi-tenant).

---

## 2. Bootstrap — ordre strict (à exécuter avant tout code)

**Instance Supabase cible (déjà créée).**
- project_ref : `hphdxmqcdscpacbkcdpt`
- région : `eu-central-1` (Francfort)
- org : basiliq.sas@gmail.com (FREE)

1. **Lecture**
   - Lis `CLAUDE.md`, ce fichier (sections 6 et 8 en priorité), puis `DESIGN_SYSTEM.md`.

2. **Vérification MCP Supabase**
   - Liste les outils MCP. Appelle `list_projects` et confirme que `hphdxmqcdscpacbkcdpt` est bien visible.
     Si ce n'est pas le cas, le connecteur est authentifié sur le mauvais compte Supabase : STOP et
     signale-le-moi (il faut connecter le compte basiliq.sas@gmail.com).
   - Vérifie via `list_tables` (schéma `public`) que le projet est **vide** avant tout DDL. S'il ne l'est
     pas, STOP et attends mes instructions.

3. **Initialisation base de données**
   - Récupère `NEXT_PUBLIC_SUPABASE_URL` via `get_project_url`.
   - Récupère `NEXT_PUBLIC_SUPABASE_ANON_KEY` via `get_publishable_keys`.
   - Crée `.env.local` avec ces valeurs (ne PAS committer). Crée aussi `.env.example` sans valeurs.
   - Exécute le schéma complet de la **section 6** via `apply_migration` (nom : `initial_schema`).
   - Écris le même SQL dans `supabase/migrations/00000000000000_initial_schema.sql` pour versionner.
   - Exécute le seed des fonds de la **section 7** (`apply_migration` nom : `seed_funds`).
   - Lance `get_advisors` (type `security`) : aucune table sans RLS ne doit remonter.
   - Génère les types via `generate_typescript_types` → `src/types/database.types.ts`.

4. **Point d'étape** (obligatoire, avant bootstrap Next.js)
   - MCP OK ✅/❌ · project_ref utilisé
   - Migrations appliquées (initial_schema, seed_funds) ✅/❌
   - RLS validées (get_advisors clean) ✅/❌
   - Types TS générés ✅/❌
   - Liste des tables créées + nombre de fonds seedés (attendu : 12)
   - **Attends ma validation avant de continuer.**

---

## 3. Direction artistique (résumé — source de vérité : le handoff)

**Source de vérité visuelle : `design_handoff_private_corner/README.md`** (high-fidelity, définitif) +
la maquette `Design System Private Corner.dc.html`. `DESIGN_SYSTEM.md` en est le pont d'implémentation
(tokens `@theme`, registres, index des slugs). En cas de conflit, le handoff prime.

Identité institutionnelle premium : **accent corail `#FB4D58` unique** (signale, ne décore jamais — ni
vert ni orange de statut), socle sombre teal/ink, sections claires crème, texte slate `#3A4D56`. Typo
**Neue Montreal partout** (titres, corps, données — aucune police mono) + **Saol Display en italique sur
1–2 mots-clés** de titre (signature de marque ; fallbacks Hanken Grotesk / Newsreader). Boutons pilule à
chevron double, cartes `radius:18px`, champs `radius:12px`, focus corail, grille `1160px`. Trois registres
de fond à faire vivre : hero teal sombre (glassmorphism), section crème, bandeau corail plein. Signature
produit complémentaire : la courbe en J + la timeline des millésimes.

---

## 4. Stack technique (imposée)

- **Next.js 16** App Router, Server Components par défaut, Client Components ciblés (funnel, charts, steppers).
- **TypeScript** strict.
- **Tailwind CSS v4** (config via `@theme` inline, tokens = variables CSS). Aucune autre lib UI.
- **Supabase** : Postgres + Auth + RLS + (Realtime optionnel V2). Client SSR via `@supabase/ssr`.
- **TanStack Query v5** pour le cache serveur/état async.
- **Zustand** pour l'état du funnel et de l'allocation en cours d'édition (non persisté tant que non sauvegardé).
- **React Hook Form + Zod** pour la validation des étapes du funnel.
- **Recharts** pour les graphiques (cashflow, courbe en J, donut de répartition).
- **@react-pdf/renderer** pour l'export PDF réel (note d'allocation + bulletins). Pas de `window.print`.
- **Lucide React** (icônes), **date-fns** (locale `fr`).
- **Polices** : Neue Montreal + Saol Display (sous licence, `@font-face` dans `public/fonts/` si fournies) ; sinon fallbacks **Hanken Grotesk** + **Newsreader** via `next/font/google`. Voir `design_handoff_private_corner/README.md` et `DESIGN_SYSTEM.md` §2.a.
- **Design** : les tokens de `globals.css` (`@theme`) reprennent exactement la palette et les valeurs du handoff (voir `DESIGN_SYSTEM.md` §2). Recharts lit les couleurs via variables CSS, aucun hex en dur.
- Auth : Supabase Auth, **Google OAuth** + email/mot de passe. Voir section 9.
- Déploiement **Vercel**.

Middleware Next 16 : fichier `proxy.ts` (et non `middleware.ts`) pour le refresh de session Supabase SSR.

---

## 5. Architecture des fichiers

```
src/
  app/
    (auth)/login/page.tsx
    (app)/
      layout.tsx                 # layout-app-header + garde d'auth
      page.tsx                   # tableau de bord : liste des allocations du cabinet
      allocations/
        new/page.tsx             # funnel (client)
        [id]/page.tsx            # note d'allocation : édition + projections
        [id]/souscriptions/page.tsx
      clients/page.tsx
    api/
      pdf/proposal/[id]/route.ts # rendu PDF note d'allocation
      pdf/bulletins/[id]/route.ts
    layout.tsx
    globals.css                  # tokens @theme (repris du handoff — voir DESIGN_SYSTEM.md §2)
  components/
    funnel/                      # funnel-*
    allocation/                  # alloc-*
    projection/                  # proj-*
    document/                    # doc-*
    fund/                        # fund-*
    ui/                          # ui-*
    layout/                      # layout-*
  lib/
    supabase/{client,server,proxy}.ts
    allocation/engine.ts         # moteur d'allocation (section 8.2)
    projection/engine.ts         # moteur de projection J-curve (section 8.4)
    narrative/build.ts           # discours d'accompagnement (section 8.5)
    funds.ts                     # helpers gamme + pacing
  stores/
    funnel.store.ts              # Zustand
    allocation.store.ts
  types/
    database.types.ts            # généré
    domain.ts                    # types métier (Fund, Allocation, ProjectionRow…)
supabase/
  migrations/
public/
  fonts/                         # Neue Montreal / Saol Display si sous licence (sinon fallbacks Google)
design_handoff_private_corner/   # SOURCE DE VÉRITÉ VISUELLE (README.md + .dc.html + screenshots)
```

---

## 6. Schéma SQL (idempotent — à exécuter via apply_migration)

```sql
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
```

> Note RLS : `current_cabinet_id()` renvoie NULL tant que le profil n'a pas de cabinet. Prévoir un
> flux d'onboarding (création/rattachement de cabinet au premier login) — voir section 9. Pour la
> démo, un cabinet seed peut être rattaché manuellement au profil de test.

---

## 7. Seed (apply_migration : seed_funds)

### 7.a Cabinet de démonstration (rattachement auto du premier utilisateur)
```sql
-- UUID fixe référencé par handle_new_user() (section 6)
insert into public.cabinets (id, name, orias)
values ('00000000-0000-0000-0000-0000000000c1', 'Cabinet de démonstration', null)
on conflict (id) do nothing;

-- Rattache rétroactivement tout profil déjà existant sans cabinet
update public.profiles
   set cabinet_id = '00000000-0000-0000-0000-0000000000c1'
 where cabinet_id is null;
```

### 7.b Gamme de fonds
```sql
insert into public.funds
  (slug, name, manager, strategy, bucket, pacing, min_ticket, closing_label, closing_date, risk_score, esg_score, target_multiple, target_gross_irr, sort_order)
values
  ('merieux-innovation-ii','PC Feeder Mérieux Innovation II','Mérieux Equity Partners','Innovation / Accélération capital','satellite','innovation',100000,'Sept. 2026','2026-09-30',5,1,2.60,0.220,1),
  ('pc-european-semiconductor','Private Corner Wealth European Semiconductor','Ardian','Buyout','coeur','buyout',100000,'Oct. 2026','2026-10-31',4,0,2.20,0.180,2),
  ('pc-credit-yield','Private Corner Credit Yield','CVC & General Atlantic','Dette privée','defensif','credit',100000,'Nov. 2026','2026-11-30',2,0,1.50,0.100,3),
  ('pc-buyout-eqt','Private Corner Buyout EQT Strategy','EQT','Buyout','coeur','buyout',100000,'Déc. 2026','2026-12-31',3,1,2.10,0.170,4),
  ('pc-keensight-nova-vii','PC Feeder Keensight Nova VII','Keensight Capital','Growth / Buyout','croissance','growth',100000,'Déc. 2026','2026-12-31',4,0,2.40,0.200,5),
  ('tikehau-decarbonization-ii','Tikehau Decarbonization Fund II – Feeder','Tikehau Capital','Growth Buyout','croissance','growth',100000,'Déc. 2026','2026-12-31',3,2,2.00,0.160,6),
  ('blue-owl-gp-stakes','Blue Owl GP Stakes Strategy','Blue Owl Capital','GP Stakes','coeur','gpstakes',100000,'Mars 2027','2027-03-31',3,0,2.00,0.150,7),
  ('pc-secondary-2026','Private Corner Secondary Fund 2026','Committed Advisors','Secondaire Growth Buyout','coeur','secondary',100000,'Juin 2027','2027-06-30',2,0,1.70,0.150,8),
  ('european-midmarket-opportunities','European MidMarket Opportunities','PAI Partners, Keensight Capital, Eurazeo, General Atlantic','Buyout','coeur','buyout',25000,'Juin 2027','2027-06-30',3,0,2.10,0.170,9),
  ('pc-wealth-buyout-2026','Private Corner Wealth Buyout 2026','Ardian','Buyout','coeur','buyout',100000,'Mars 2028','2028-03-31',3,0,2.10,0.170,10),
  ('us-midcap-buyout','US MidCap Buyout Strategies','Neuberger (sélection de gérants)','Buyout','coeur','buyout',100000,'Mars 2028','2028-03-31',3,0,2.20,0.180,11),
  ('meridiam-global-infrastructure','Meridiam Global Infrastructure Strategies','Meridiam','Infrastructure Core / Core+','defensif','infra',100000,'En continu',null,1,2,1.80,0.110,12)
on conflict (slug) do update set
  name = excluded.name, manager = excluded.manager, strategy = excluded.strategy,
  bucket = excluded.bucket, pacing = excluded.pacing, min_ticket = excluded.min_ticket,
  closing_label = excluded.closing_label, closing_date = excluded.closing_date,
  risk_score = excluded.risk_score, esg_score = excluded.esg_score,
  target_multiple = excluded.target_multiple, target_gross_irr = excluded.target_gross_irr,
  sort_order = excluded.sort_order;
```

Les multiples et TRI cibles sont des hypothèses par défaut à valider avec Private Corner — ils sont
stockés en base pour être éditables sans toucher au code.

---

## 8. Fonctionnalités détaillées

### 8.1 Funnel de qualification (`components/funnel/`, store Zustand)
Six étapes, validation Zod par étape, barre de progression latérale :
1. **Cabinet & client** — cabinet, conseiller, référence client (anonymisée).
2. **Patrimoine & enveloppe** — patrimoine financier net, montant dédié au non-coté (slider + presets), ratio affiché.
3. **Profil de risque** — prudent/équilibré/dynamique/offensif + expérience non-coté (novice/initié/averti).
4. **Horizon & liquidité** — horizon (5–15 ans), capacité d'immobilisation, capacité à répondre aux appels de fonds.
5. **Objectifs & thèmes** — multi-sélection d'objectifs (croissance, diversification, décorrélation, rendement, impact, accès), stratégies souhaitées, toggle durable.
6. **Diversification** — concentré (3–4) / équilibré (5–6) / large (7–9), récap.
À la validation → appel du moteur d'allocation, création de l'`allocation` + `allocation_lines` en base, redirection vers `/allocations/[id]`.

### 8.2 Moteur d'allocation (`lib/allocation/engine.ts`)
Entrée : réponses du funnel + gamme. Sortie : `{ fundId, amount }[]`.
- Poids de poches par profil (matrice `RISK_WEIGHTS`) : prudent {def .45, cœur .40, croiss .15, sat 0}, équilibré {.25/.45/.25/.05}, dynamique {.15/.40/.30/.15}, offensif {.05/.35/.35/.25}.
- Score par fonds = poids de sa poche × boosts (durable si `esg` et `esg_score>0` ×(1+0.5·esg) ; stratégie souhaitée ×1.5 ; objectif rendement → credit/infra/gpstakes ×1.3 ; impact → esg_score>0 ×1.4 ; croissance → poche croissance/satellite ×1.25 ; décorrélation → infra/credit/secondary ×1.2).
- Allocation en tickets entiers : amorçage (couverture des poches à poids>0), puis distribution du solde par score avec cap de concentration `max(200000, 0.30·enveloppe)`. Respect strict des `min_ticket` (100k, 25k pour European MidMarket).
- Résultat éditable : steppers au pas du ticket, ajout/retrait de fonds, recalcul live.

### 8.3 Note d'allocation (`/allocations/[id]`)
- KPIs : engagement total, TVPI cible, TRI net estimé, valeur projetée, pic de trésorerie.
- Répartition éditable (alloc-fund-row + alloc-stepper-ticket), donut par poche, timeline des millésimes.
- Bloc projections (8.4) + discours (8.5).
- Persistance des ajustements (debounce → update `allocation_lines`).

### 8.4 Moteur de projection (`lib/projection/engine.ts`)
Modèle paramétrique par `pacing` : calendrier d'appels, courbe de distribution (smoothstep de `distStart` à `term`), multiple cible ajusté par scénario (prudent ×0.75, central ×1, optimiste ×1.25 sur `multiple-1`). Agrégation portefeuille.
- Séries annuelles (0→15) : appels, distributions, VL (NAV), valeur totale, trésorerie nette cumulée (courbe en J).
- Métriques : TVPI, TRI net estimé, DPI à terme, pic de trésorerie mobilisée, plus-value.
- Contrôles temps réel : scénario (prudent/central/optimiste), rythme des distributions (curseur -2…+2).
- Rendu Recharts : `proj-chart-cashflow` (barres appels/distributions + ligne VL), `proj-chart-jcurve` (aire trésorerie nette + ligne zéro).

### 8.5 Discours d'accompagnement (`lib/narrative/build.ts`)
Génère 5–7 paragraphes à partir du profil et de l'allocation réelle : cadre, architecture de portefeuille, diversification & lissage des millésimes, gestion de la liquidité/courbe en J, dimension durable (si applicable), profil de performance visé, points d'attention (illiquidité, appels échelonnés, enveloppe de détention). Chiffres injectés dynamiquement.

### 8.6 Export PDF (`app/api/pdf/*`, @react-pdf/renderer)
- **Note d'allocation** : en-tête Private Corner, méta (cabinet/conseiller/référence), tableau de répartition, argumentaire, mentions réglementaires.
- **Bulletins de souscription** : un bulletin par compartiment, données d'onboarding mutualisées (cabinet, conseiller, référence souscripteur), montant, ticket minimum, closing, zones de signature. Génération en un clic depuis la note → crée les lignes `subscriptions` (status `generated`) puis rend le PDF.

---

## 9. Authentification & onboarding
- **Par défaut : email + mot de passe** (Supabase Auth, aucun provider externe à configurer → autonomie totale). Client SSR via `@supabase/ssr`, refresh de session dans `proxy.ts`.
- Garde d'auth dans `(app)/layout.tsx` : redirige vers `/login` si pas de session. Écran `/login` = `auth-login-panel` (email/mot de passe + inscription).
- **Rattachement cabinet automatique** : le trigger `handle_new_user` (section 6) affecte chaque nouvel utilisateur au cabinet de démo seedé (section 7.a). Donc dès la première connexion, la RLS renvoie un jeu de données non vide, sans intervention manuelle. L'UI garde malgré tout un empty state propre au cas où `cabinet_id` serait NULL.
- **Google OAuth : optionnel, V2.** Ne pas l'activer par défaut : il exige des identifiants Google Cloud (client ID/secret) créés manuellement dans la console Google + configuration du provider côté Supabase — étape non autonome. Slug `auth-login-google` déjà prévu dans le design system si activation ultérieure.
- **Pour une vraie prod multi-cabinet** : retirer le `cabinet_id` par défaut du trigger, retirer le seed 7.a, et brancher un onboarding explicite (création/rattachement de cabinet, invitations).

---

## 10. Gestion des erreurs & états
- Chaque écran gère : loading (skeleton), vide (empty state actionnable), erreur (message dans la voix de l'interface, action de reprise).
- Le funnel bloque la progression tant que le Zod de l'étape n'est pas satisfait ; enveloppe minimale 25 000 €.
- Allocation : signaler visuellement si le total ≠ enveloppe (sous / au-dessus), sans bloquer l'édition.
- Jamais de secret exposé ; toute écriture DB passe par des Server Actions ou Route Handlers avec le client serveur.

---

## 11. Variables d'environnement
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Server-only (jamais NEXT_PUBLIC) :
SUPABASE_SERVICE_ROLE_KEY=      # uniquement si strictement nécessaire côté serveur
```

---

## 12. Ordre d'implémentation
1. Bootstrap section 2 (MCP, schéma, seed, types) → point d'étape.
2. `globals.css` + tokens depuis `DESIGN_SYSTEM.md` + primitives `ui-*` et `layout-*`.
3. Auth + garde + onboarding cabinet minimal.
4. `lib/funds.ts`, `lib/allocation/engine.ts`, `lib/projection/engine.ts`, `lib/narrative/build.ts` (logique pure, testable, sans UI).
5. Funnel (`funnel-*`) + store + persistance de l'allocation.
6. Note d'allocation (`alloc-*`, `proj-*`) + édition live + graphiques.
7. Discours (`proj-narrative-panel` / `doc-*`).
8. Export PDF note + bulletins + écriture `subscriptions`.
9. Tableau de bord (liste des allocations du cabinet) + écran clients.
10. Polissage : empty/loading/error states, responsive, focus clavier, `prefers-reduced-motion`.

## 13. Checklist de sortie
- [ ] `get_advisors` sécurité clean (RLS partout)
- [ ] Seed appliqué : 1 cabinet de démo + 12 fonds (éditables via base)
- [ ] 1er utilisateur rattaché automatiquement au cabinet de démo (données visibles derrière RLS)
- [ ] Funnel complet validé par Zod, allocation persistée
- [ ] Ajustements live persistés (debounce)
- [ ] Projections recalculées en temps réel (scénario + rythme)
- [ ] Discours généré dynamiquement
- [ ] PDF note + bulletins générés, `subscriptions` créées
- [ ] Zéro hex hardcodé, tous slugs documentés
- [ ] Responsive + accessibilité de base
