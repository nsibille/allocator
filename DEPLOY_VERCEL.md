# Déploiement Vercel — Private Corner

Runbook de mise en production. Le projet est prêt (`next build` vert, 9 routes).
Toutes les étapes sont côté Vercel / Supabase (aucune n'est faisable depuis les sessions
Claude Code, dont l'egress réseau vers `vercel.com` et `supabase.co` est bloqué par policy).

## 1. Connecter le dépôt à Vercel
1. [vercel.com/new](https://vercel.com/new) → **Import** le dépôt `nsibille/allocator`.
2. Framework détecté automatiquement : **Next.js**. Laisser les réglages par défaut
   (build `next build`, output géré par Vercel). Ne rien surcharger.
3. Brancher la production sur la branche voulue (`main` après merge de la PR, ou la branche
   de la PR pour une preview).

## 2. Variables d'environnement (Project Settings → Environment Variables)
| Clé | Valeur | Portée |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hphdxmqcdscpacbkcdpt.supabase.co` | Production + Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_JbM1_tIVifvwD2NOmgm8yQ_J36zEJmm` | Production + Preview |

> Ces deux clés sont **publiques** (injectées côté navigateur) — aucun secret ici.
> La `service_role` n'est **jamais** utilisée par l'app et ne doit pas être ajoutée.

## 3. Configuration Supabase Auth (indispensable pour que le login fonctionne)
Dashboard Supabase → **Authentication → URL Configuration** :
- **Site URL** : l'URL de production Vercel (ex. `https://allocator.vercel.app`).
- **Redirect URLs** : ajouter l'URL de production + le motif de preview
  (`https://*.vercel.app` si tu utilises les previews).

Dashboard Supabase → **Authentication → Providers → Email** :
- **Confirm email** : pour la démo, **désactiver** cette option afin que l'inscription
  ouvre immédiatement une session (le trigger `handle_new_user` rattache alors le nouvel
  utilisateur au cabinet de démonstration et les données apparaissent derrière la RLS dès
  la 1re connexion — comportement attendu, cf. `SETUP_SUPABASE.md`).
  Si tu la laisses activée, il faut configurer un SMTP et l'utilisateur devra cliquer le
  lien de confirmation avant de pouvoir se connecter.

## 4. Déployer et vérifier
Après le premier déploiement :
1. Ouvrir l'URL → redirection vers `/login` (proxy d'auth).
2. **Créer un compte** (email + mot de passe) → arrivée sur le tableau de bord (cabinet
   de démonstration rattaché, 12 fonds visibles dans le funnel).
3. Parcours complet : `/allocations/new` (funnel) → note d'allocation (édition live +
   projections) → `Exporter la note (PDF)` → `Générer les bulletins` → `/…/souscriptions`.

## Notes techniques
- **Middleware** : fichier `proxy.ts` (convention Next 16) — refresh de session SSR.
- **Routes PDF** (`/api/pdf/*`) : runtime **Node.js** (par défaut) ; `@react-pdf/renderer`
  est déclaré dans `serverExternalPackages` (`next.config.ts`).
- **Polices / logo** : fallbacks (Hanken Grotesk / Newsreader, Helvetica en PDF) et
  monogramme placeholder. Remplacer par les assets officiels sous licence en production
  (cf. `DESIGN_SYSTEM.md` §9).
- **Région** : Supabase est en `eu-central-1` ; choisir une région Vercel proche
  (ex. `fra1`) pour minimiser la latence.
