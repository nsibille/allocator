/* =========================================================================
   Configuration du patrimoine de l'investisseur (avoirs hors gamme Private
   Corner). Deux axes : l'enveloppe (compte / poche patrimoniale) et le support
   (nature de l'actif détenu). Pilote les libellés et les <select> du formulaire.
   Table : public.client_assets (déclaratif, RLS cabinet).
   ========================================================================= */

/** Enveloppe patrimoniale (compte / poche). */
export interface CategoryDef {
  key: string;
  label: string;
  /** Aide contextuelle (placeholder de libellé). */
  hint?: string;
}

/** Nature du support détenu. */
export interface SupportDef {
  key: string;
  label: string;
}

/** Enveloppes patrimoniales (ordre d'affichage). */
export const ASSET_CATEGORIES: CategoryDef[] = [
  { key: "immobilier", label: "Immobilier", hint: "Ex. Résidence principale, appartement locatif" },
  { key: "private_equity", label: "Private Equity (hors Private Corner)", hint: "Ex. Fonds Ardian VIII" },
  { key: "assurance_vie", label: "Assurance-vie", hint: "Ex. Contrat Generali" },
  { key: "pea", label: "PEA", hint: "Ex. PEA Bourse Direct" },
  { key: "pea_pme", label: "PEA-PME" },
  { key: "per", label: "PER", hint: "Ex. PER individuel" },
  { key: "compte_titres", label: "Compte-titres (CTO)" },
  { key: "livrets", label: "Livrets & liquidités", hint: "Ex. Livret A, compte courant" },
  { key: "autre", label: "Autre" },
];

/** Supports (nature de l'actif). */
export const ASSET_SUPPORTS: SupportDef[] = [
  { key: "residence_principale", label: "Résidence principale" },
  { key: "immobilier_locatif", label: "Immobilier locatif" },
  { key: "scpi", label: "SCPI / SCI" },
  { key: "etf", label: "ETF" },
  { key: "actions", label: "Actions en direct" },
  { key: "opcvm", label: "Fonds (OPCVM)" },
  { key: "private_equity", label: "Fonds de Private Equity" },
  { key: "fonds_euro", label: "Fonds euro" },
  { key: "obligations", label: "Obligations" },
  { key: "produits_structures", label: "Produits structurés" },
  { key: "crypto", label: "Cryptoactifs" },
  { key: "liquidites", label: "Liquidités" },
  { key: "autre", label: "Autre" },
];

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  ASSET_CATEGORIES.map((c) => [c.key, c.label]),
);

export const SUPPORT_LABEL: Record<string, string> = Object.fromEntries(
  ASSET_SUPPORTS.map((s) => [s.key, s.label]),
);

export function categoryLabel(key: string): string {
  return CATEGORY_LABEL[key] ?? key;
}

export function supportLabel(key: string): string {
  return SUPPORT_LABEL[key] ?? key;
}

/** Clés valides (validation). */
export const CATEGORY_KEYS = ASSET_CATEGORIES.map((c) => c.key);
export const SUPPORT_KEYS = ASSET_SUPPORTS.map((s) => s.key);
