# Private Corner — Portail d'allocation CGP

Portail web permettant à un Conseiller en Gestion de Patrimoine (CGP) de construire, projeter et
initialiser une allocation non-cotée pour un client HNWI en gestion déléguée, à partir de la gamme
de fonds Private Corner.

## Fonctionnalités
- **Funnel de qualification** : cabinet/client, patrimoine & enveloppe, profil de risque, horizon & liquidité, objectifs & thèmes, diversification.
- **Moteur d'allocation** : répartition automatique sur la gamme (4 poches : défensif/rendement, cœur, croissance, satellite), respect des tickets minimums, cap de concentration.
- **Projections temps réel** : courbe en J, appels/distributions/VL, TVPI, TRI net estimé, pic de trésorerie. Scénarios prudent/central/optimiste + rythme des distributions ajustables.
- **Discours d'accompagnement** généré dynamiquement (argumentaire financier & commercial).
- **Export PDF** de la note d'allocation.
- **Initialisation des souscriptions** : mutualisation des données d'onboarding, génération d'un bulletin de souscription par compartiment.

## Stack
Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres + Auth + RLS) · TanStack Query v5 · Zustand · Recharts · React Hook Form + Zod · @react-pdf/renderer · Lucide React · date-fns (locale fr). Déploiement Vercel.

## Démarrage
```bash
# 1. Cloner puis installer
pnpm install

# 2. Config MCP Supabase (nouvelle instance)
claude mcp add --transport http supabase "https://mcp.supabase.com/mcp?project_ref=hphdxmqcdscpacbkcdpt"
#   ou : cp .mcp.json.example .mcp.json  puis renseigner project_ref + PAT

# 3. Variables d'environnement
cp .env.example .env.local
#   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Lancer Claude Code à la racine et suivre CLAUDE_CODE_PROMPT.md
claude

# 5. Dev
pnpm dev
```

## Fichiers à committer / ignorer
| Fichier | Repo |
|---|---|
| `CLAUDE.md`, `CLAUDE_CODE_PROMPT.md`, `DESIGN_SYSTEM.md` | ✅ committer |
| `.mcp.json.example`, `.env.example` | ✅ committer |
| `.mcp.json`, `.env.local` | ❌ ne jamais committer |

`.gitignore` : `.env.local`, `.env*.local`, `.mcp.json`, `.next/`, `node_modules/`.

## Fichiers de préparation
- `CLAUDE.md` — bootstrap de session, règles permanentes.
- `SETUP_SUPABASE.md` — runbook autonome de provisioning de la base (project_ref réel, séquence MCP déterministe).
- `CLAUDE_CODE_PROMPT.md` — specs complètes + schéma SQL exécutable + ordre d'implémentation.
- `DESIGN_SYSTEM.md` — pont d'implémentation (tokens `@theme`, registres, index des slugs).
- `design_handoff_private_corner/` — **source de vérité visuelle** : `README.md` (tokens définitifs), `Design System Private Corner.dc.html` (maquette), `screenshots/`. En cas de conflit, le handoff prime sur `DESIGN_SYSTEM.md`.
