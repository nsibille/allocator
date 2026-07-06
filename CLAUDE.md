# Private Corner — Portail d'allocation CGP

Portail de démonstration et de production destiné aux Conseillers en Gestion de Patrimoine (CGP)
qui pratiquent la gestion déléguée pour le compte de clients HNWI, pour la société de gestion
Private Corner. Funnel de qualification → moteur d'allocation multi-fonds → projections temps réel
→ export PDF → génération des bulletins de souscription.

## Ordre de lecture obligatoire (à chaque session)
1. Lis `SETUP_SUPABASE.md` — runbook autonome de provisioning de la base (à exécuter en premier, une seule action humaine = l'OAuth du connecteur).
2. Lis `CLAUDE_CODE_PROMPT.md` **intégralement** — surtout les sections 2 (bootstrap), 6 (schéma SQL), 7 (seed), 8 (features), 9 (auth).
3. Lis `design_handoff_private_corner/README.md` — **source de vérité visuelle** (tokens définitifs, high-fidelity). Ouvre `design_handoff_private_corner/Design System Private Corner.dc.html` dans un navigateur pour la référence visuelle (ignore `<x-dc>` et `support.js`).
4. Lis `DESIGN_SYSTEM.md` (pont d'implémentation : tokens en `@theme`, registres, index des slugs) avant de toucher à **tout** composant UI. En cas de conflit, le handoff prime.
5. Ne code rien avant d'avoir validé le point d'étape de `SETUP_SUPABASE.md` / section 2.

## Règles permanentes
- Stack imposée : Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase. Aucune autre lib UI (pas de shadcn, pas de MUI, pas de Chakra).
- **Design** : respecter scrupuleusement le handoff. Accent **corail #FB4D58 unique** (signale, ne décore pas ; pas de vert/orange de statut). Typo **Neue Montreal partout** (chiffres compris, pas de mono) + **Saol Display en italique sur 1–2 mots-clés** de titre uniquement. Boutons **pilule** à **chevron double**, cartes `radius:18px`, champs `radius:12px`, focus **corail**, grille `1160px`. Fallbacks Hanken Grotesk / Newsreader si polices sous licence absentes.
- Slugs : avant chaque composant, consulter l'index de `DESIGN_SYSTEM.md`. Slug existant → réutiliser. Inexistant → créer + documenter (section + index) AVANT d'implémenter. Convention `[domaine]-[type]-[variante]`.
- Zéro hex hardcodé dans les composants. Toutes les couleurs via variables CSS (tokens du handoff).
- Aucun secret dans le code source. `service_role` JAMAIS exposée côté client.
- MCP-first : toute opération DB passe par le serveur MCP Supabase, jamais de SQL copié-collé à l'aveugle.
- Instance Supabase : project_ref `hphdxmqcdscpacbkcdpt` (org basiliq.sas@gmail.com, région eu-central-1). Vérifier sa visibilité via `list_projects` à l'étape 2.
