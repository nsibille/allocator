# SETUP_SUPABASE — Runbook autonome (Claude Code)

Objectif : permettre à Claude Code de provisionner entièrement la base sans question intermédiaire.
Une seule étape est humaine par nature (l'autorisation OAuth du connecteur, un login navigateur).
Tout le reste est déterministe et idempotent.

## Coordonnées de l'instance (déjà créée)
| Clé | Valeur |
|---|---|
| project_ref | `hphdxmqcdscpacbkcdpt` |
| region | `eu-central-1` (Francfort) |
| API URL | `https://hphdxmqcdscpacbkcdpt.supabase.co` |
| org / owner | basiliq.sas@gmail.com (FREE) |
| anon / publishable key | à récupérer via MCP (`get_publishable_keys`) — ne pas deviner |

---

## Étape 0 — Connexion MCP (unique action humaine, une fois)

```bash
claude mcp add --transport http supabase \
  "https://mcp.supabase.com/mcp?project_ref=hphdxmqcdscpacbkcdpt"
```

Au premier appel, une page OAuth s'ouvre : **se connecter avec le compte basiliq.sas@gmail.com**
(le compte propriétaire du projet). C'est le seul geste manuel. Une fois autorisé, Claude Code a la
main sur le projet et enchaîne tout seul les étapes suivantes.

> Alternative sans OAuth : créer un PAT sur le compte basiliq, copier `.mcp.json.example` en
> `.mcp.json` et y coller le PAT. `.mcp.json` ne doit jamais être committé.

---

## Étapes 1→7 — Exécutées par Claude Code, sans intervention

Claude Code doit dérouler cette séquence dans l'ordre, en s'arrêtant uniquement si un contrôle échoue.

1. **Confirmer le bon compte.** `list_projects` → vérifier que `hphdxmqcdscpacbkcdpt` est présent.
   Absent ⇒ le connecteur est sur le mauvais compte Supabase : STOP, demander de refaire l'étape 0
   avec basiliq.sas@gmail.com.

2. **Vérifier que le projet est vide.** `list_tables` (schéma `public`).
   Des tables applicatives déjà présentes ⇒ STOP et demander confirmation avant tout DDL.

3. **Appliquer le schéma.** `apply_migration` name=`initial_schema`, query = tout le SQL de la
   **section 6** de `CLAUDE_CODE_PROMPT.md` (enums, tables, triggers, helpers, RLS, index).
   Écrire aussi ce SQL dans `supabase/migrations/00000000000000_initial_schema.sql`.

4. **Seeder.** `apply_migration` name=`seed_funds`, query = SQL des **sections 7.a (cabinet de démo +
   rattachement rétroactif) puis 7.b (12 fonds)** de `CLAUDE_CODE_PROMPT.md`.
   Écrire dans `supabase/migrations/00000000000001_seed.sql`.

5. **Récupérer les clés runtime et écrire l'environnement.**
   - `get_project_url` → `NEXT_PUBLIC_SUPABASE_URL` (attendu : `https://hphdxmqcdscpacbkcdpt.supabase.co`).
   - `get_publishable_keys` → prendre la clé `sb_publishable_...` (à défaut l'anon legacy non désactivée)
     pour `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Créer `.env.local` (ne pas committer) :
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://hphdxmqcdscpacbkcdpt.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<clé publishable récupérée>
     ```
   - Créer `.env.example` avec les mêmes clés, valeurs vides.
   - S'assurer que `.gitignore` contient `.env.local`, `.env*.local`, `.mcp.json`, `.next/`, `node_modules/`.

6. **Générer les types.** `generate_typescript_types` → écrire dans `src/types/database.types.ts`.

7. **Contrôles.** `get_advisors` type=`security` : aucune table sans RLS ne doit remonter.
   `get_advisors` type=`performance` : traiter les index manquants si signalés.

---

## Point d'étape (à présenter avant de bootstrapper Next.js)
- Compte MCP correct (`hphdxmqcdscpacbkcdpt` visible) ✅/❌
- `initial_schema` appliquée (7 tables) ✅/❌
- `seed` appliqué : 1 cabinet de démo + 12 fonds ✅/❌
- `.env.local` + `.env.example` écrits ✅/❌
- Types TS générés ✅/❌
- `get_advisors` sécurité clean ✅/❌
- Puis attendre validation.

## Notes
- Tout le SQL est idempotent (guards enum, `if not exists`, `on conflict`) : réexécutable sans casse.
- Auth par défaut email/mot de passe (aucun provider externe). Le premier utilisateur inscrit est
  rattaché automatiquement au cabinet de démo → données visibles derrière la RLS dès la 1re connexion.
- Google OAuth = V2 (exige des identifiants Google Cloud manuels), volontairement non activé ici.
