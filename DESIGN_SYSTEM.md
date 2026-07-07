# DESIGN_SYSTEM — Private Corner · Portail CGP

> ⚠️ **Source de vérité visuelle = `design_handoff_private_corner/README.md`** (+ la maquette
> `design_handoff_private_corner/Design System Private Corner.dc.html`, à ouvrir dans un navigateur
> pour référence). Ce handoff est **high-fidelity et définitif** : couleurs, typo, espacements et
> composants sont à reproduire au pixel près.
>
> Ce fichier-ci est le **pont d'implémentation** : il traduit les tokens du handoff en variables CSS /
> `@theme` Tailwind v4, applique les registres du site à nos écrans applicatifs (funnel, note
> d'allocation, dashboard), et tient l'**index des slugs** propres à l'app.
>
> En cas de doute ou de conflit, le handoff prime sur ce fichier. Règle de slug inchangée :
> `[domaine]-[type]-[variante]`. Zéro hex hardcodé dans les composants — tout via tokens.

Le `.dc.html` embarque une balise `<x-dc>` et un runtime `support.js` : ce sont des détails de maquette,
**à ignorer**. Seules comptent les valeurs.

---

## 1. Direction artistique (résumé du handoff)

Registre institutionnel, premium, digital native. **Un seul accent : le corail** — il signale (CTA,
liens, emphase, sections pleines), il ne décore jamais. Pas de couleurs de statut multiples (ni vert ni
orange) : le positif se signale en corail, le neutre en gris. Socle sombre teal/ink, sections claires
crème. La **signature de marque** est typographique : titres en Neue Montreal avec **un ou deux
mots-clés en Saol Display italique**.

Trois registres de fond à faire vivre :
1. **Hero sombre** — `hero-gradient`, texte blanc, carte glassmorphism, CTA corail.
2. **Section claire** — fond `cream`, texte `slate`, titre corail avec mots en Saol italic.
3. **Bandeau corail plein** — fond `coral`, titre `slate-deep`, citation blanche.

Domaines de slugs : `funnel` · `alloc` · `proj` · `doc` · `fund` · `client` · `ui` · `layout` · `auth`.

---

## 2. Tokens (globals.css — Tailwind v4 `@theme`)

```css
@theme {
  /* Accent unique */
  --color-coral:       #FB4D58;
  --color-coral-deep:  #E23C48;
  --color-coral-wash:  rgba(251, 77, 88, 0.14);

  /* Socle sombre */
  --color-ink:   #131E23;   /* fond le plus sombre */
  --color-base:  #16232A;   /* fond de page sombre par défaut */
  --color-teal:  #33454C;   /* surfaces / cartes sur sombre */

  /* Sections claires */
  --color-cream:   #ECEBE7;
  --color-cream-2: #E3E2DD;

  /* Texte */
  --color-slate:      #3A4D56;  /* texte principal sur clair ; texte sur corail */
  --color-slate-deep: #2A373D;  /* texte renforcé sur corail, guillemets */
  --color-white:      #F4F5F3;  /* texte principal sur sombre (blanc cassé) */
  --color-mist:       #A9B4B9;  /* texte secondaire sur sombre */
  --color-muted:      #6E7C82;  /* texte tertiaire, labels, légendes */

  /* Lignes (sur fond sombre) */
  --color-line:   rgba(255, 255, 255, 0.14);
  --color-line-2: rgba(255, 255, 255, 0.07);

  /* Poches d'allocation (data-viz) — voir §2.b */
  --color-bucket-defensif:   #6E7C82;  /* muted */
  --color-bucket-coeur:      #33454C;  /* teal */
  --color-bucket-croissance: #FB4D58;  /* coral */
  --color-bucket-satellite:  #E23C48;  /* coral-deep */

  /* Typographie */
  --font-sans:         "Neue Montreal", "Hanken Grotesk", sans-serif;  /* TOUT le texte + les chiffres */
  --font-accent:       "Saol Display", "Newsreader", Georgia, serif;   /* italique 400, mots-clés uniquement */
  --tracking-base:     0.1px;

  /* Rayons */
  --radius:        18px;   /* cartes / surfaces */
  --radius-field:  12px;   /* champs de formulaire */
  --radius-glass:  26px;   /* carte verre du hero */
  --radius-pill:   999px;  /* boutons, badges, chips */

  /* Grille & espacement (base 4 : 4·8·16·24·40·64·96) */
  --container:  1160px;
  --gutter:     24px;
  --margin-x:   40px;

  /* Hero gradient */
  --hero-gradient: linear-gradient(140deg, #3B4D55 0%, #1B2A31 55%, #0E171C 100%);
}
```

### 2.a Polices
Import des fallbacks (Google Fonts) dans `<head>` (ou `next/font`) :
```html
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&display=swap" rel="stylesheet">
```
Si les licences **Neue Montreal** et **Saol Display** sont fournies : les charger en `@font-face` en tête
de stack (`public/fonts/`), les fallbacks Hanken Grotesk / Newsreader restant en second.
`letter-spacing` global léger `0.1px`. Poids Neue Montreal : 300 · 400 (courant) · 500 (titres/labels) ·
600/700 (rares).

**Saol Display : uniquement en italique 400, sur 1–2 mots-clés d'un titre par ailleurs en Neue Montreal.**
Jamais en roman, jamais pour du texte courant, jamais un titre entier. Helper : `<em class="pc">mot</em>`.
Exemples : *Private* Markets Wealth *Corner* · Une *mission* · Nos partenaires *témoignent*.

### 2.b Réconciliation data-viz (donut par poche, timeline)
Le handoff impose **un seul accent**. Pour distinguer les 4 poches d'allocation sans introduire de
nouvelles teintes, on utilise une rampe tirée de la palette : plus la poche est orientée croissance,
plus elle tend vers le corail ; les poches protectrices restent en neutres (teal / muted).
- défensif → `muted` · cœur → `teal` · croissance → `coral` · satellite → `coral-deep`.
Les graphiques Recharts lisent ces variables via JS, pas de hex en dur. À valider par toi si tu veux une
autre logique (ex. monochrome teal + une seule tranche corail).

### 2.c Tokens dark
Le système est **nativement sombre** (socle ink/base/teal) autant que clair (cream). Pas de bascule
`.dark` séparée : chaque écran choisit son registre (voir §3). Les tokens ci-dessus couvrent les deux.

---

## 3. Application des registres aux écrans de l'app

Le handoff est pensé pour un site ; voici comment le décliner sur un outil B2B dense :
- **Écrans de travail** (funnel, saisie, tables, note d'allocation éditable) → **registre clair `cream`**
  pour la lisibilité : texte `slate`, cartes bordées, CTA corail, focus corail. Titres d'étape avec un
  mot-clé en Saol italic.
- **Couverture de la note d'allocation + panneau discours + KPIs de synthèse** → **registre sombre**
  (`hero-gradient` / `base`), texte blanc/`mist`, carte glassmorphism, chiffres en Neue Montreal 500 avec
  unité en corail.
- **Bandeau d'accroche / citation gérant** (optionnel) → **registre corail plein**.
- Corail réservé aux signaux : CTA, onglet actif, focus, tranche/emphase de croissance, statut « en levée ».

---

## 4. Échelle typographique (du handoff)
| Rôle | Taille / interligne | Poids | Notes |
|---|---|---|---|
| Display | 92 / 0.98 (hero interne 66) | 500 | `letter-spacing:-.02em`, `text-wrap:balance`, mots-clés Saol italic |
| H1 | 42 / 46 | 500 | `-.01em` |
| H2 | 26 / 32 | 500 | |
| Body | 17 / 26 | 400 | `mist` (sombre) ou `slate`/`#4A5A62` (clair) |
| Eyebrow | 12 | 400 | `letter-spacing:.24em`, uppercase, couleur `coral` |
| Label / nav | 12–13 | 400/500 | `.06em–.16em`, souvent uppercase |
| Stat / chiffre | 26–46 | 500 | **Neue Montreal** (pas de mono), `-.02em`, unité en `coral` |

> Correction vs version précédente : les montants/pourcentages sont en **Neue Montreal 500**, pas en
> police mono. Aucune police monospace dans ce système.

---

## 5. Iconographie
- **Chevron double** = icône signature des CTA :
  ```html
  <svg width="22" height="12" viewBox="0 0 22 12" fill="none"><path d="M2 1l5 5-5 5M10 1l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  ```
- Icônes fonctionnelles : Lucide React, trait 1.5px, `currentColor` (jamais de hex).
- **Logo / monogramme** : le monogramme du bundle est un **placeholder** → remplacer par le logo officiel
  Private Corner en production. Wordmark « PRIVATE » / « CORNER » sur deux lignes, `letter-spacing:.30–.34em`,
  uppercase, poids 500.

---

## 6. Index des composants (slugs) — mappés sur les patterns du handoff

### `layout`
| Slug | Rôle | Notes handoff |
|---|---|---|
| `layout-app-header` | Barre (monogramme+wordmark, nav uppercase `.06em`, langue EN\|FR) | registres clair et sombre |
| `layout-page-shell` | Conteneur `1160px`, marge `40px`, gutter `24px` | |
| `layout-sidebar-progress` | Rail de progression du funnel | |

### `ui`
| Slug | Rôle | États / notes |
|---|---|---|
| `ui-button-primary` | CTA corail, texte blanc, **chevron double**, pilule `999px`, `15px 28px` | hover `coral-deep`, disabled `#1E2E36`/`muted` |
| `ui-button-secondary` | Transparent, bordure `line`, texte blanc | hover bordure blanche |
| `ui-button-light` | Sur fond corail : fond `cream`, texte corail | hover `#fff` |
| `ui-button-ghost` | Lien corail + chevron | hover opacité |
| `ui-eyebrow-label` | Sur-titre `coral`, `.24em`, uppercase | |
| `ui-title-accent` | Titre Neue Montreal avec `<em class="pc">` en Saol italic | 1–2 mots max |
| `ui-stat` | Chiffre Neue Montreal 500 + unité corail | |
| `ui-field-text` | Champ fond `base`, bordure `line`, `radius:12px` | **focus → bordure `coral`** |
| `ui-field-currency` | Champ + suffixe « € » aligné droite | min 100 000 € |
| `ui-select` | Champ + chevron `▾` | focus corail |
| `ui-segmented` | Pilules côte à côte | actif = bordure `coral` + fond `coral-wash` |
| `ui-checkbox` | Carré 20px `radius:6px` | coché = fond `coral` + ✓ blanc |
| `ui-tabs` | Rangée texte, `border-bottom` `line-2` | actif = texte blanc + `border-bottom:2px coral` |
| `ui-badge-outline` | Pilule bordure+texte corail, uppercase `.14em` | ex. « Tier One » |
| `ui-badge-status` | Fond `coral-wash`, texte corail, puce ronde corail | « En cours de levée » |
| `ui-badge-neutral` | Fond `#1E2E36`, texte `mist`, bordure `line-2` | « Fermé » |
| `ui-card-glass` | Glassmorphism `rgba(255,255,255,.05)` + `blur(4px)` + bordure `.10` | hero sombre |
| `ui-empty-state` / `ui-skeleton` / `ui-toast` | états système | pas d'ombres portées, contraste + bordures fines |

### `auth`
| Slug | Rôle | Notes |
|---|---|---|
| `auth-login-panel` | Connexion email/mot de passe | focus corail |
| `auth-login-google` | OAuth Google | **V2 uniquement** (identifiants Google Cloud manuels) |

### `funnel`
| Slug | Rôle |
|---|---|
| `funnel-stepper-rail` · `funnel-step-cabinet` · `funnel-step-capital` · `funnel-step-risk` · `funnel-step-horizon` · `funnel-step-objectives` · `funnel-step-diversification` · `funnel-nav-footer` | 6 étapes, registre clair `cream`, champs `ui-field-*`, choix `ui-segmented`, CTA `ui-button-primary` |

### `alloc`
| Slug | Rôle | Notes |
|---|---|---|
| `alloc-kpi-strip` | 5 KPI (registre sombre, `ui-stat`) | unités corail |
| `alloc-fund-row` | Ligne éditable (réutilise motif `fund-card-summary`) | |
| `alloc-stepper-ticket` | +/- au pas du ticket | |
| `alloc-bucket-donut` | Donut par poche (tokens `--color-bucket-*`, §2.b) | |
| `alloc-vintage-timeline` | Timeline des millésimes | points corail sur emphase |
| `alloc-fund-picker` | Ajout de fonds | pilules |
| `alloc-total-indicator` | Total vs enveloppe | écart signalé en corail (pas de rouge/vert) |
| `alloc-exposure-consolidation` | Exposition consolidée du portefeuille en look-through (géo · secteur · stade), pondérée par le capital, **recalculée en temps réel** à chaque ajustement de la répartition | réutilise `fund-exposure-bars` ; logique `lib/allocation/exposure.ts` ; aussi dans la note PDF |
| `alloc-exposure-steering` | **Pilotage inverse multi-axes** : active géo / secteur / stade, curseurs de cible par zone, re-répartition en temps réel des fonds pour approcher toutes les cibles (moindres carrés empilés sur le simplexe, `steerMultiAxis`). Affiche cible vs atteint (faisabilité) | ne re-répartit que le panier courant, montants au pas du ticket |
| `fund-exposure-bars` | Un axe d'exposition en barres horizontales corail (poids décroissant), présentation pure | partagé fiche fonds ↔ éditeur |

### `proj`
| Slug | Rôle | Notes |
|---|---|---|
| `proj-controls-scenario` | Onglets `ui-tabs` prudent/central/optimiste | actif souligné corail |
| `proj-controls-pace` | Curseur rythme distributions | poignée corail |
| `proj-chart-cashflow` | Appels/distributions/VL (Recharts) | couleurs = tokens, appels en `muted`, distributions en `teal`, VL ligne corail |
| `proj-chart-jcurve` | Courbe en J (aire + ligne zéro) | aire corail-wash, ligne corail |
| `proj-chart-tooltip` | Tooltip commun | fond `base`, bordure `line` |
| `proj-narrative-panel` | Discours d'accompagnement | **registre sombre** `hero-gradient`, mots-clés Saol italic |

### `doc`
| Slug | Rôle |
|---|---|
| `doc-header-brand` · `doc-proposal-pdf` · `doc-bulletin-card` · `doc-mentions` | Export @react-pdf : couverture registre sombre, corps clair, mention agrément AMF |

### `client`
Écrans de gestion des clients (registre clair `cream`, entité centrale du portail côté Distributeur).
Réutilisent `ui-tabs`, `ui-field-*`, `ui-select`, `ui-segmented`, `ui-checkbox`, `ui-badge-*`,
`ui-button-*`, `ui-empty-state`, `ui-title-accent`, `layout-page-shell`. Aucun nouveau token/hex.
| Slug | Rôle | Notes |
|---|---|---|
| `client-list-table` | Listing des clients (nom+référence, statut, patrimoine, pistes, souscriptions) | CTA « Nouveau client », lignes cliquables |
| `client-form-identity` | Formulaire identité nominative + attributs de base (création/édition) | champs `light`, statut en `ui-segmented` |
| `client-detail-tabs` | Fiche investisseur à onglets (Profil · Qualification · Documents · Souscriptions · Pistes) | motif `ui-tabs`, souligné corail |
| `client-kpi-strip` | Bandeau de synthèse (patrimoine, pistes, souscriptions, complétude qualification) | `ui-stat`, unités corail |
| `client-questionnaire-form` | Rendu générique d'un questionnaire piloté par la config (`questionnaires.config.ts`) | KYC / adéquation / ESG / fiscalité |
| `client-documents-checklist` | Checklist documentaire (nom, type, statut) — métadonnées seules | statut en `ui-badge-*` (pas de vert/orange) |
| `client-patrimoine` | Onglet Patrimoine : avoirs déclarés hors gamme Private Corner (enveloppe × support × valorisation) + synthèse par enveloppe en barres. Ajout / édition / suppression | table `client_assets` (RLS cabinet) ; config `lib/client/patrimoine.config.ts` |
| `client-patrimoine-consolidation` | Vue patrimoniale **totale** : croise avoirs déclarés + souscriptions Private Corner (transparisées) → exposition globale par classe d'actif, coté / non coté, géographie | `lib/client/wealth.ts` ; non-coté PC en look-through réel, coté déclaré via grille d'hypothèses indicative ; réutilise `fund-exposure-bars` |
| `client-leads-list` | Pistes d'investissement du client (allocations/simulations) + CTA « Nouvelle piste » | liens vers `alloc` |
| `client-activity-timeline` | Timeline relationnelle (CRM data-driven) : fil groupé par jour, rail vertical, pastille icône par catégorie | accent corail réservé aux signaux (souscription/flux) |
| `client-event-item` | Item de timeline : icône Lucide (trait 1.5, `currentColor`), acteur, heure, pastilles montant/état, corps | pas de couleurs de statut multiples |
| `client-event-composer` | Composeur d'événement manuel (type, date, intitulé, montant, état, détail) | champs `light`, CTA `ui-button-primary` |

### `fund`
Gamme de promotion (registre clair `cream`) : page catalogue `/fonds`, page commerciale
`/fonds/[slug]`, initiation de souscription `/fonds/[slug]/souscrire`. Réutilisent
`ui-badge-*`, `ui-eyebrow-label`, `ui-title-accent`, `ui-button-*`, `layout-page-shell`.
Aucun hex : les visuels passent par `fund-cover-illustration` (dégradés = tokens CSS).
> **Repères factuels officiels** (`lib/catalog.ts`) : chaque fonds est à **100 000 € minimum**
> et donne accès à un gérant institutionnel. L'**architecture varie** (`structureType`, voir
> transparisation) : feeder mono-gérant · fonds multi-gérants · fonds secondaire — **pas
> uniquement du fonds de fonds**. `fundFacts(fund)` expose `assetClass` (Private Equity ·
> Secondaire · Dette privée · Infrastructure, dérivée du `pacing`), `positioning` (Satellite ·
> Cœur de portefeuille), `sector` et `geography`. Ces repères s'affichent partout où un fonds
> est montré (cartes, fiche, souscription, note PDF, ligne d'allocation). Catalogue **groupé
> par classe d'actif** via `ASSET_CLASS_ORDER`. Le positionnement commercial (2 niveaux) reste
> distinct de la poche interne d'allocation `fund.bucket` (4 niveaux, moteur + donut). Les
> objectifs de multiple/TRI ne figurent pas sur la source publique : hypothèses internes de
> projection, réservées à la fiche commerciale.
>
> **Transparisation** (`lib/fonds/transparence.ts`, `fund-composition`) : donnée *illustrative*
> de composition en look-through par slug — `structureType`, millésime, note de risque (1–5),
> illiquidité, devise, **sous-jacents** (fonds maîtres / paniers, poids) et **expositions**
> géographie / secteur / stade normalisées à 100 %. Affichée sur la fiche `/fonds/[slug]` via
> `fund-composition` (barres corail, aucune lib de graphe). Avertissement méthodologique
> obligatoire (`TRANSPARENCE_DISCLAIMER`).
| Slug | Rôle | Notes |
|---|---|---|
| `fund-badge-strategy` | Badge stratégie | corail si actif, neutre sinon (pas 4 couleurs de statut) |
| `fund-card-summary` | Carte de fonds : eyebrow classe d'actif corail + badge statut, titre (mot Saol italic), stats grille 2 col, CTA pleine largeur | radius `18px`, bordure `line` |
| `fund-cover-illustration` | Visuel abstrait génératif d'un fonds (SVG déterministe par seed) — dégradés teal/ink/coral/muted issus des tokens, arcs concentriques « architecture » | aucune image externe, zéro hex |
| `fund-catalog` | Page `/fonds` : hero, grille des fonds ouverts, section « nouveaux fonds » (CTA infos/conventionnement), liste des fonds archivés | 3 registres de contenu |
| `fund-card-new` | Carte d'un fonds en préparation : badge « Nouveau », CTA « Demander des informations » + « Me conventionner » + lien page commerciale | pas de souscription |
| `fund-archive-row` | Ligne d'un fonds clôturé : vignette, millésime, performances réalisées (TVPI/DPI/TRI) | registre neutre |
| `fund-commercial-page` | Page commerciale `/fonds/[slug]` : bandeau visuel, accroche, points clés, stratégie, documentation, bandeau d'action sombre (CTA souscription) | mention AMF |
| `fund-subscribe-form` | Initiation de souscription mono-fonds : choix investisseur (client existant / nouveau), montant au pas du ticket, création de la note d'allocation | statut « proposée » |
| `fund-composition` | Transparisation d'un fonds sur `/fonds/[slug]` : repères d'architecture, sous-jacents (fonds maîtres / paniers), expositions géo/secteur/stade en barres | donnée illustrative, avertissement obligatoire |

### `portal`
Écrans de gestion back-office du cabinet (registre clair `cream`), accessibles depuis
`layout-app-header`. Données **de démonstration statiques** (`lib/portal/demo.ts`), aucune
dépendance base. Réutilisent `layout-page-shell`, `ui-eyebrow-label`, `ui-title-accent`,
`ui-stat`, `ui-badge-*`, `ui-button-*`. Statuts : ton `active` (corail) / `neutral` (gris)
uniquement — jamais de vert/orange (règle corail unique).
> **Investisseur = client.** Terme canonique retenu : **client**. L'entrée de menu
> « Clients » est la fonctionnalité réelle `client-*` (`/clients`, RLS-scopée) ; pas de
> page de démo « investisseurs » séparée. « Nouvelle allocation » n'est pas une entrée de
> menu : elle se lance uniquement depuis la fiche d'un client (`/allocations/new?client=<id>`),
> y compris depuis le tableau de bord qui renvoie d'abord au choix du client.
| Slug | Rôle | Notes |
|---|---|---|
| `portal-advisors-table` | Page `/conseillers` : conseillers du cabinet (rôle, portefeuille investisseurs, encours, dernier accès, statut) + KPI | CTA « Inviter un conseiller » |
| `portal-documents-browser` | Page `/documents` : index des dossiers à gauche, liste des pièces à droite (nom, dossier, date, taille) + recherche | métadonnées seules, non téléchargeables |
| `portal-subscriptions-table` | Page `/souscriptions` : bandeau KPI (engagement, appelé, distribué, NAV) + tableau détaillé (fonds/part, investisseur, montants, statut) | export CSV (démo) |
| `portal-retrocessions-table` | Page `/retrocessions` : rétrocessions dues (référence, type, statut de facturation, date paiement, montant) + KPI réglé/en attente | droits d'entrée & frais de gestion |
| `portal-offers-table` | Page `/offres` : offres de distribution groupées par fonds puis par part (ISIN, ticket min, valorisation, frais d'entrée, statut) | mention AMF promotionnelle |

---

## 7. Règles de composant
- Boutons et badges : **toujours** pilule `999px`. Cartes : `radius` (18px). Champs : `radius-field` (12px).
- Focus visible = bordure/anneau **corail** (obligatoire, accessibilité clavier).
- Pas d'ombres portées marquées : le système repose sur contrastes de fond + bordures fines (`line`/`line-2`).
- Couleurs uniquement via tokens ; les couleurs de poche via `--color-bucket-*`.
- Responsive : conteneur `1160px` centré ; grilles 3/2 colonnes → 1 colonne sous ~900px ; display réduit sur mobile.
- `prefers-reduced-motion` respecté ; transitions hover ~150ms.

## 8. Signature
Deux signatures se cumulent : la **signature de marque** (Neue Montreal + mot-clé en Saol italic + accent
corail unique + chevron double) et la **signature produit** (la paire `proj-chart-jcurve` +
`alloc-vintage-timeline`). Dépenser la boldness sur ces deux points, garder tout le reste sobre.

## 9. Assets à récupérer
- Logo Private Corner officiel (le monogramme du bundle est un placeholder).
- Polices sous licence Neue Montreal + Saol Display (sinon fallbacks Google Fonts).
- Agrément AMF **GP-20000038** et copy réelle disponibles dans le handoff.
