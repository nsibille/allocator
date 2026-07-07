/* =========================================================================
   Configuration du patrimoine — funnel piloté par la CLASSE D'ACTIF.
   L'utilisateur choisit d'abord une classe, puis seuls les champs pertinents
   s'affichent (enveloppe fiscale, type de support, zone géographique). Fini les
   combinaisons absurdes (CTO × résidence principale). Table : client_assets
   (category = classe d'actif, support = type, envelope + geography optionnels).
   ========================================================================= */

export interface OptionDef {
  key: string;
  label: string;
}

/** Une classe d'actif = une étape du funnel + ses champs contextuels. */
export interface AssetClassDef {
  key: string;
  label: string;
  description: string;
  /** Un pictogramme emoji léger pour la carte (pas de dépendance icône). */
  glyph: string;
  /** Types de support proposés (obligatoire). */
  supports: OptionDef[];
  /** Enveloppes fiscales (uniquement pour les titres cotés). */
  envelopes?: OptionDef[];
  /** Demander une zone géographique (rend la consolidation exacte). */
  geography?: boolean;
}

export const ASSET_CLASSES: AssetClassDef[] = [
  {
    key: "immobilier",
    label: "Immobilier",
    description: "Résidence principale, locatif, SCPI, commercial",
    glyph: "🏠",
    supports: [
      { key: "residence_principale", label: "Résidence principale" },
      { key: "immobilier_locatif", label: "Immobilier locatif" },
      { key: "scpi", label: "SCPI / SCI" },
      { key: "immobilier_commercial", label: "Immobilier commercial" },
    ],
  },
  {
    key: "actions_fonds",
    label: "Actions & Fonds cotés",
    description: "Titres cotés via PEA, compte-titres, assurance-vie…",
    glyph: "📈",
    envelopes: [
      { key: "cto", label: "Compte-titres (CTO)" },
      { key: "pea", label: "PEA" },
      { key: "pea_pme", label: "PEA-PME" },
      { key: "assurance_vie", label: "Assurance-vie" },
      { key: "per", label: "PER" },
      { key: "pee", label: "PEE / épargne salariale" },
    ],
    supports: [
      { key: "etf", label: "ETF" },
      { key: "actions", label: "Actions en direct" },
      { key: "opcvm", label: "Fonds (OPCVM)" },
      { key: "fonds_euro", label: "Fonds euro" },
      { key: "obligations", label: "Obligations" },
      { key: "produits_structures", label: "Produits structurés" },
    ],
    geography: true,
  },
  {
    key: "private_equity",
    label: "Private Equity & non coté",
    description: "Fonds de PE externes, startups & PME, crowdlending",
    glyph: "🚀",
    supports: [
      { key: "private_equity", label: "Fonds de Private Equity" },
      { key: "startups_pme", label: "Startups & PME" },
      { key: "crowdlending", label: "Crowdlending" },
    ],
    geography: true,
  },
  {
    key: "epargne",
    label: "Épargne & liquidités",
    description: "Livrets, fonds euro, comptes courants & à terme",
    glyph: "💶",
    supports: [
      { key: "livret", label: "Livret (A, LDD, LEP…)" },
      { key: "fonds_euro", label: "Fonds euro" },
      { key: "compte_courant", label: "Compte courant" },
      { key: "compte_terme", label: "Compte à terme" },
    ],
  },
  {
    key: "crypto",
    label: "Cryptoactifs",
    description: "Bitcoin, Ethereum, exchanges & wallets",
    glyph: "₿",
    supports: [{ key: "crypto", label: "Cryptoactifs" }],
  },
  {
    key: "autres",
    label: "Autres actifs",
    description: "Métaux précieux, montres, actifs exotiques",
    glyph: "💎",
    supports: [
      { key: "metaux", label: "Métaux précieux" },
      { key: "montres", label: "Montres & objets de collection" },
      { key: "autre", label: "Autre" },
    ],
  },
];

/** Zones géographiques proposées (alignées sur la consolidation). */
export const GEO_ZONES: OptionDef[] = [
  { key: "France", label: "France" },
  { key: "Europe", label: "Europe" },
  { key: "Amérique du Nord", label: "Amérique du Nord" },
  { key: "Asie", label: "Asie" },
  { key: "Mondial diversifié", label: "Mondial diversifié" },
];

/* ------------------------------------------------------------------ Lookups */

export function assetClassDef(key: string): AssetClassDef | undefined {
  return ASSET_CLASSES.find((c) => c.key === key);
}

const ALL_SUPPORTS: OptionDef[] = ASSET_CLASSES.flatMap((c) => c.supports);
const ALL_ENVELOPES: OptionDef[] = ASSET_CLASSES.flatMap((c) => c.envelopes ?? []);

export const CLASS_LABEL: Record<string, string> = Object.fromEntries(
  ASSET_CLASSES.map((c) => [c.key, c.label]),
);
const SUPPORT_LABEL: Record<string, string> = Object.fromEntries(
  ALL_SUPPORTS.map((s) => [s.key, s.label]),
);
const ENVELOPE_LABEL: Record<string, string> = Object.fromEntries(
  ALL_ENVELOPES.map((e) => [e.key, e.label]),
);

export function classLabel(key: string): string {
  return CLASS_LABEL[key] ?? key;
}
export function supportLabel(key: string): string {
  return SUPPORT_LABEL[key] ?? key;
}
export function envelopeLabel(key: string | null): string {
  return key ? (ENVELOPE_LABEL[key] ?? key) : "";
}

/** Clés valides (validation Zod). */
export const CATEGORY_KEYS = ASSET_CLASSES.map((c) => c.key);
export const SUPPORT_KEYS = Array.from(new Set(ALL_SUPPORTS.map((s) => s.key)));
export const ENVELOPE_KEYS = Array.from(
  new Set(ALL_ENVELOPES.map((e) => e.key)),
);
export const GEO_KEYS = GEO_ZONES.map((z) => z.key);
