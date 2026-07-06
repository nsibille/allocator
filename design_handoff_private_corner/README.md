# Handoff — Design System Private Corner (v1.0)

## Overview
Design system de **Private Corner**, société de gestion agréée AMF spécialisée dans l'accès aux actifs non cotés (private equity, infrastructure, dette privée) pour les clients privés. Registre : institutionnel, premium, digital native. Ce document permet de construire une application **en respectant scrupuleusement** l'identité visuelle.

## À propos des fichiers de ce bundle
Le fichier `Design System Private Corner.dc.html` est une **référence de design produite en HTML** — une maquette montrant l'apparence et le comportement voulus, **pas du code de production à copier tel quel**. La tâche est de **recréer ce système dans l'environnement cible** (React, Vue, Next, SwiftUI, etc.) avec ses patterns établis. Si aucun environnement n'existe encore, choisir le framework le plus adapté (React + Tailwind recommandé) et y implémenter le système.

> ⚠️ C'est un **fichier `.dc.html`** (Design Component). Ouvre-le dans un navigateur pour le voir ; ignore la balise `<x-dc>` et le runtime `support.js` — ce ne sont que des détails de la maquette. Ce qui compte, ce sont les **valeurs** ci-dessous.

## Fidélité
**High-fidelity.** Couleurs, typographie, espacements et composants sont définitifs. Reproduire au pixel près en s'appuyant sur les tokens exacts listés plus bas.

---

## Design Tokens

### Couleurs
| Token | Hex | Usage |
|---|---|---|
| `coral` | `#FB4D58` | **Accent unique.** Actions, liens, CTA, emphase, sections pleines. Signale — ne décore jamais. |
| `coral-deep` | `#E23C48` | État hover des surfaces corail. |
| `coral-wash` | `rgba(251,77,88,0.14)` | Fonds de badges/puces, chips « en levée ». |
| `ink` | `#131E23` | Encre — fond le plus sombre. |
| `base` | `#16232A` | Fond de page sombre par défaut. |
| `teal` | `#33454C` | Surface teal, cartes sur fond sombre. |
| `hero-gradient` | `linear-gradient(140deg,#3B4D55 0%,#1B2A31 55%,#0E171C 100%)` | Fond des hero sombres. |
| `cream` | `#ECEBE7` | Fond des sections claires. |
| `cream-2` | `#E3E2DD` | Variante crème, surfaces secondaires claires. |
| `slate` | `#3A4D56` | **Texte principal sur fond clair** (rgb 58,77,86). Aussi texte sur fond corail. |
| `slate-deep` | `#2A373D` | Texte renforcé sur corail, guillemets. |
| `white` | `#F4F5F3` | Texte principal sur fond sombre (blanc cassé). |
| `mist` | `#A9B4B9` | Texte secondaire sur fond sombre. |
| `muted` | `#6E7C82` | Texte tertiaire, légendes, labels. |
| `line` | `rgba(255,255,255,0.14)` | Bordures sur fond sombre. |
| `line-2` | `rgba(255,255,255,0.07)` | Bordures/séparateurs discrets sur fond sombre. |

**Règle corail :** un seul accent. Ne pas multiplier les couleurs de statut (pas de vert/orange). Positif comme signal = corail ; états neutres = gris `muted`/`line`.

### Typographie
Deux familles, jamais interverties.

- **Neue Montreal** (grotesque) — TOUT le texte : titres, paragraphes, nav, données, boutons.
  - Police sous licence. Fallback web chargé : **Hanken Grotesk**.
  - Stack CSS : `'Neue Montreal','Hanken Grotesk', sans-serif`
  - Poids utilisés : 300, 400 (courant), 500 (titres/labels), 600/700 (rares).
  - `letter-spacing` global léger : `0.1px`.
- **Saol Display** (serif haute-contraste) — **UNIQUEMENT en italique**, sur **un ou deux mots-clés** au sein d'un titre par ailleurs en Neue Montreal. C'est LA signature de la marque.
  - Police sous licence. Fallback web chargé : **Newsreader** (italic).
  - Stack CSS : `'Saol Display','Newsreader', Georgia, serif` + `font-style: italic; font-weight: 400;`
  - Classe helper dans la maquette : `em.pc`.
  - Exemples : *Private* Markets Wealth *Corner* · Une *mission* : développer vos activités sur les *marchés privés* · Un service *premium* · Nos partenaires *témoignent*.
  - ❌ Ne jamais mettre Saol en roman, ni l'utiliser pour du texte courant, ni pour un titre entier.

Import Google Fonts (fallbacks) :
```html
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&display=swap" rel="stylesheet">
```
> Si les licences Neue Montreal / Saol Display sont disponibles, les charger en `@font-face` en tête de stack ; sinon les fallbacks ci-dessus donnent un rendu très proche.

### Échelle typographique
| Rôle | Taille / interligne | Poids | Notes |
|---|---|---|---|
| Display | 92px / 0.98 (hero interne 66px) | 500 | `letter-spacing:-.02em`, `text-wrap:balance`. Mots-clés en Saol italic. |
| H1 | 42px / 46 | 500 | `letter-spacing:-.01em` |
| H2 | 26px / 32 | 500 | |
| Body | 17px / 26 (1.5–1.6) | 400 | Couleur `mist` (sombre) ou `slate`/`#4A5A62` (clair) |
| Eyebrow | 12px | 400 | `letter-spacing:.24em`, `text-transform:uppercase`, couleur `coral` |
| Label / nav | 12–13px | 400/500 | `letter-spacing:.06em–.16em`, souvent uppercase |
| Stat / chiffre | 26–46px | 500 | Neue Montreal, `letter-spacing:-.02em` ; unité en `coral` |

### Espacement — base 4px
Échelle : `4 · 8 · 16 · 24 · 40 · 64 · 96`. Padding de sections : 64px vertical. Padding interne cartes : 24–32px. Padding hero : 64–76px.

### Grille
12 colonnes · largeur max conteneur **1160px** · gutter **24px** · marge latérale **40px**.

### Rayons & bordures
- **Boutons : pilule = `border-radius: 999px` (toujours).**
- Cartes / surfaces : `18px` (token `radius`, plage 0–28).
- Panneaux showcase : `radius + 6px` (~24px).
- Card verre (hero) : `26px`.
- Champs de formulaire : `12px`.
- Bordures sombres : 1px `line` / `line-2`.

### Ombres & effets
- **Glassmorphism** sur cartes de hero sombre : `background: rgba(255,255,255,0.05); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.10);`
- Pas d'ombres portées marquées — le système repose sur les contrastes de fond et les bordures fines, pas sur l'élévation.

### Iconographie
- **Chevron double** = icône signature des CTA. SVG :
  ```html
  <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
    <path d="M2 1l5 5-5 5M10 1l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  ```
- **Monogramme / logo** (deux boucles entrelacées, stand-in) :
  ```html
  <svg viewBox="0 0 40 28" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M4 7 C4 3 22 3 22 14 C22 25 4 25 4 21"/>
    <path d="M16 7 C16 3 34 3 34 14 C34 25 16 25 16 21"/>
  </svg>
  ```
  > ⚠️ Placeholder. Remplacer par le **vrai logo Private Corner** (fichier officiel) en production.
- Wordmark : « PRIVATE » sur « CORNER », deux lignes, `letter-spacing:.30–.34em`, uppercase, poids 500.

---

## Composants

### Boutons (toujours pilule `999px`, `padding:15px 28px`, `font-size:15px`, poids 500)
- **Primaire** : fond `coral`, texte blanc, chevron double blanc. Hover → `coral-deep`.
- **Secondaire** : transparent, bordure 1px `line`, texte blanc. Hover → bordure blanche.
- **Clair sur fond corail** : fond `cream`, texte `coral`, chevron `coral`. Hover → `#fff`.
- **Lien / ghost** : transparent, texte `coral`, chevron. Hover → opacité.
- **Désactivé** : fond `#1E2E36`, texte `muted`, bordure `line-2`, `cursor:not-allowed`.
- CTA en pleine largeur dans les cartes de fonds.

### Badges / chips (pilule `999px`)
- Outline : bordure + texte `coral`, uppercase `.14em` (ex. « Tier One »).
- Statut actif : fond `coral-wash`, texte `coral`, puce ronde `coral` (ex. « En cours de levée »).
- Neutre : fond `#1E2E36`, texte `mist`, bordure `line-2` (ex. « Fermé »).
- Clair : fond `cream`, texte `slate`.

### Onglets
Rangée de boutons texte, séparateur `border-bottom` 1px `line-2`. Actif : texte blanc + `border-bottom:2px solid coral`. Inactif : texte `muted`.

### Formulaires
- Label : 13px, `mist`, `margin-bottom:9px`.
- Champ : fond `#16232A`, bordure 1px `line`, `radius:12px`, `padding:14px 16px`, texte blanc. **Focus → bordure `coral`.**
- Suffixe d'unité (« € ») aligné à droite dans le champ.
- Select : même style + chevron `▾`.
- Choix segmentés : pilules côte à côte ; sélectionné = bordure `coral` + fond `coral-wash`.
- Checkbox : carré 20px `radius:6px`, coché = fond `coral` + ✓ blanc.

### Cartes
- **Carte de fonds** : bordure `line`, `radius:18px`, en-tête (eyebrow classe d'actif en `coral` + badge statut, titre avec mot en Saol italic, sous-titre `muted`), zone de stats en grille 2 col (chiffre 26px + label 11px `muted`), CTA pleine largeur en bas.
- **Carte proposition** : monogramme corail, titre (mot Saol italic), texte `mist`, lien « En savoir plus » corail + chevron.
- **Carte témoignage** : fond **corail plein**, texte `slate-deep`, gros guillemet Saol italic, corps 15px, attribution en bas.

### Navigation
Barre : logo (monogramme + wordmark) à gauche ; liens uppercase `.06em` au centre (Identité, Offre, Durabilité, Newsroom, Contact) ; « My Corner » en `coral` souligné à droite ; sélecteur langue « EN | FR ». Déclinée sur fond clair (`cream`, texte `slate`) et sombre.

### Indicateurs / stats
Grille 3 colonnes séparée par `line-2`, sur `teal`/`#182831`. Chiffre 46px poids 500, unité en `coral`, label `muted` en dessous.

---

## Registres de mise en page (3 fonds)
Le site alterne trois ambiances — les respecter :
1. **Hero sombre** : dégradé teal (`hero-gradient`), texte blanc, carte glassmorphism, CTA corail.
2. **Section claire** : fond `cream`, texte `slate`, **titre en `coral` avec mots en Saol italic**, illustration au trait corail, CTA corail.
3. **Bandeau corail plein** : fond `coral`, titre `slate-deep`, citation blanche, pagination à points, CTA clair.

## Interactions & comportement
- Hover boutons : transition de fond/opacité ~150ms.
- Focus champs : bordure `coral`.
- Onglets : changement de contenu au clic (state local).
- Carrousel témoignages : pagination à points (point actif blanc), navigation chevrons `«` `»`.
- Responsive : conteneur max 1160px centré ; grilles 3/2 colonnes à replier en 1 colonne sous ~900px ; hero title réduit sur mobile.

## State management
Léger. Onglets = index actif local. Carrousel = index de slide. Formulaires = valeurs contrôlées + validation (montant min 100 000 €, case pro obligatoire). Pas de global store imposé.

## Assets
- **Logo Private Corner** : à récupérer en officiel (le monogramme du bundle est un placeholder).
- **Polices** : Neue Montreal + Saol Display (sous licence) ; fallbacks Hanken Grotesk + Newsreader (Google Fonts).
- Illustrations au trait (cadenas, cercles) : reproduites en SVG corail 1–2px, ou à fournir en officiel.
- Copy : textes réels issus du site (mission, témoignages, agrément AMF GP-20000038).

## Fichiers
- `Design System Private Corner.dc.html` — maquette complète (fondations + composants + 3 écrans d'exemple). Ouvrir dans un navigateur pour référence visuelle.

---

### Prompt suggéré pour Claude Code
> « Construis l'application en respectant SCRUPULEUSEMENT le design system décrit dans `design_handoff_private_corner/README.md` : palette (accent corail #FB4D58 unique, socle teal, neutres crème, texte slate #3A4D56), typographie Neue Montreal partout + Saol Display en italique uniquement sur les mots-clés de titres, boutons en pilule avec chevron double, cartes radius 18px, grille 1160px. Reproduis les trois registres de fond (hero teal sombre, section crème, bandeau corail). Utilise les fallbacks Hanken Grotesk / Newsreader si les polices sous licence sont absentes. »
