/* Métadonnées des 6 étapes du funnel (rail + en-têtes). Le mot-clé Saol est balisé par l'UI. */

export interface StepMeta {
  slug: string;
  eyebrow: string;
  /** Titre avec, éventuellement, un mot-clé rendu en Saol italic (index `accentWord`). */
  title: string;
  accentWord?: string;
  subtitle: string;
}

export const STEPS: StepMeta[] = [
  {
    slug: "funnel-step-cabinet",
    eyebrow: "Étape 1 · Cabinet & client",
    title: "Votre client",
    accentWord: "client",
    subtitle:
      "Le client HNWI final n'accède pas au portail : il n'est représenté que par une référence anonymisée.",
  },
  {
    slug: "funnel-step-capital",
    eyebrow: "Étape 2 · Patrimoine & enveloppe",
    title: "L'enveloppe dédiée",
    accentWord: "enveloppe",
    subtitle:
      "Part du patrimoine financier net à allouer aux marchés privés.",
  },
  {
    slug: "funnel-step-risk",
    eyebrow: "Étape 3 · Profil de risque",
    title: "La tolérance au risque",
    accentWord: "risque",
    subtitle: "Profil d'investisseur et expérience du non-coté.",
  },
  {
    slug: "funnel-step-horizon",
    eyebrow: "Étape 4 · Horizon & liquidité",
    title: "L'horizon de détention",
    accentWord: "horizon",
    subtitle:
      "Durée d'immobilisation et capacité à honorer les appels de fonds échelonnés.",
  },
  {
    slug: "funnel-step-objectives",
    eyebrow: "Étape 5 · Objectifs & thèmes",
    title: "Les objectifs visés",
    accentWord: "objectifs",
    subtitle: "Ce que le client attend de son allocation non-cotée.",
  },
  {
    slug: "funnel-step-diversification",
    eyebrow: "Étape 6 · Diversification",
    title: "L'ampleur du portefeuille",
    accentWord: "portefeuille",
    subtitle: "Nombre de compartiments cible pour la sélection.",
  },
  {
    slug: "funnel-step-profile",
    eyebrow: "Étape 7 · Profil type",
    title: "Le profil investisseur",
    accentWord: "profil",
    subtitle:
      "Synthèse de la qualification : score de dynamisme et allocation stratégique recommandée.",
  },
  {
    slug: "funnel-step-selection",
    eyebrow: "Étape 8 · Sélection des fonds",
    title: "Les fonds retenus",
    accentWord: "fonds",
    subtitle:
      "Parmi les fonds éligibles à la catégorisation, laissez le moteur choisir ou composez la sélection.",
  },
];
