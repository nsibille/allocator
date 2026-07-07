import type { ClientAssetRow, PacingProfile } from "@/types/domain";
import { assetClassFor } from "@/lib/catalog";
import { getTransparence } from "@/lib/fonds/transparence";

/* =========================================================================
   Consolidation patrimoniale totale — croise le patrimoine déclaré
   (client_assets) et les souscriptions Private Corner (transparisées) pour
   donner une vue d'exposition sur l'ENSEMBLE du patrimoine du client :
   classe d'actif, coté / non coté, géographie. Logique pure.

   Le non-coté Private Corner est ventilé en look-through (transparisation
   réelle). Les avoirs déclarés cotés utilisent une grille d'hypothèses coarse
   (`SUPPORT_MODEL`) — indicative, à afficher comme telle.
   ========================================================================= */

export interface WealthSlice {
  label: string;
  /** Montant absolu en euros. */
  value: number;
}

export interface WealthConsolidation {
  total: number;
  declaredTotal: number;
  privateCornerTotal: number;
  byAssetClass: WealthSlice[];
  byListing: WealthSlice[];
  byGeography: WealthSlice[];
}

/** Une souscription Private Corner du client (pour la consolidation). */
export interface PcHolding {
  slug: string;
  amount: number;
  pacing: PacingProfile;
}

type Listing = "Coté" | "Non coté";

interface SupportModel {
  assetClass: string;
  listing: Listing;
  geography: string;
}

/** Grille d'hypothèses par support déclaré (indicative). */
const SUPPORT_MODEL: Record<string, SupportModel> = {
  residence_principale: { assetClass: "Immobilier", listing: "Non coté", geography: "France" },
  immobilier_locatif: { assetClass: "Immobilier", listing: "Non coté", geography: "France" },
  scpi: { assetClass: "Immobilier", listing: "Non coté", geography: "Europe" },
  etf: { assetClass: "Actions cotées", listing: "Coté", geography: "Mondial diversifié" },
  actions: { assetClass: "Actions cotées", listing: "Coté", geography: "Mondial diversifié" },
  opcvm: { assetClass: "Fonds diversifiés", listing: "Coté", geography: "Mondial diversifié" },
  private_equity: { assetClass: "Private Equity", listing: "Non coté", geography: "Mondial diversifié" },
  fonds_euro: { assetClass: "Obligations & dette", listing: "Coté", geography: "Europe" },
  obligations: { assetClass: "Obligations & dette", listing: "Coté", geography: "Europe" },
  produits_structures: { assetClass: "Produits structurés", listing: "Coté", geography: "Mondial diversifié" },
  crypto: { assetClass: "Cryptoactifs", listing: "Coté", geography: "Mondial diversifié" },
  liquidites: { assetClass: "Liquidités", listing: "Coté", geography: "France" },
  autre: { assetClass: "Autre", listing: "Non coté", geography: "Mondial diversifié" },
};

/** Classe d'actif Private Corner → classe d'actif patrimoniale globale. */
const PC_ASSET_CLASS: Record<string, string> = {
  "Private Equity": "Private Equity",
  Secondaire: "Private Equity",
  "Dette privée": "Obligations & dette",
  Infrastructure: "Infrastructure",
};

/** Zones de transparisation → géographie patrimoniale coarse. */
const GEO_COARSE: Record<string, string> = {
  "Europe de l'Ouest": "Europe",
  "Europe du Nord": "Europe",
  "Amérique du Nord": "Amérique du Nord",
  Asie: "Asie",
  "Mondial diversifié": "Mondial diversifié",
};

function add(map: Map<string, number>, key: string, v: number) {
  map.set(key, (map.get(key) ?? 0) + v);
}

function toSlices(map: Map<string, number>): WealthSlice[] {
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
}

/**
 * Consolide le patrimoine total : avoirs déclarés + souscriptions Private
 * Corner (avec transparisation look-through pour la géographie du non-coté).
 */
export function consolidatePatrimoine(
  assets: ClientAssetRow[],
  pcHoldings: PcHolding[],
): WealthConsolidation {
  const ac = new Map<string, number>();
  const li = new Map<string, number>();
  const geo = new Map<string, number>();
  let declaredTotal = 0;
  let privateCornerTotal = 0;

  // Avoirs déclarés (grille d'hypothèses).
  for (const a of assets) {
    const v = Number(a.value);
    if (!(v > 0)) continue;
    declaredTotal += v;
    const m = SUPPORT_MODEL[a.support] ?? SUPPORT_MODEL.autre;
    add(ac, m.assetClass, v);
    add(li, m.listing, v);
    add(geo, m.geography, v);
  }

  // Souscriptions Private Corner (non coté, géographie transparisée).
  for (const h of pcHoldings) {
    const v = Number(h.amount);
    if (!(v > 0)) continue;
    privateCornerTotal += v;
    const globalClass = PC_ASSET_CLASS[assetClassFor(h.pacing)] ?? "Private Equity";
    add(ac, globalClass, v);
    add(li, "Non coté", v);

    const t = getTransparence(h.slug);
    if (t && t.geography.length > 0) {
      for (const z of t.geography) {
        add(geo, GEO_COARSE[z.label] ?? z.label, v * z.weight);
      }
    } else {
      add(geo, "Mondial diversifié", v);
    }
  }

  return {
    total: declaredTotal + privateCornerTotal,
    declaredTotal,
    privateCornerTotal,
    byAssetClass: toSlices(ac),
    byListing: toSlices(li),
    byGeography: toSlices(geo),
  };
}
