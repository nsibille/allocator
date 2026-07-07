/* =========================================================================
   Transparisation de la gamme — composition en look-through des fonds.
   Source : base_fonds_transparisee (fournie par Private Corner). Donnée
   ILLUSTRATIVE construite à partir des stratégies réelles connues des gérants
   cités : elle n'engage pas les sociétés de gestion et ne reflète pas les
   portefeuilles réels. Clé de jointure : slug du fonds (= gamme `funds`).

   Trois architectures (⇒ logique de transparisation) :
   - « Feeder mono-gérant » : remonte à un fonds maître unique.
   - « Fonds multi-gérants » : ventile sur plusieurs sous-jacents.
   - « Fonds secondaire »   : ventile sur des paniers de parts secondaires.

   Les expositions géo / secteur / stade sont normalisées à 100 % par fonds
   pour permettre une consolidation pondérée au niveau d'une allocation.
   ========================================================================= */

/** Architecture du véhicule (pilote la lecture de la transparisation). */
export type StructureType =
  | "Feeder mono-gérant"
  | "Fonds multi-gérants"
  | "Fonds secondaire";

/** Une tranche d'exposition sur un axe (poids 0–1, somme 1 par fonds). */
export interface ExposureSlice {
  label: string;
  /** Poids en look-through (0–1). */
  weight: number;
}

/** Un sous-jacent (fonds maître ou panier) porté par le véhicule. */
export interface Holding {
  name: string;
  manager: string;
  /** Poids dans le fonds (0–1). */
  weight: number;
  vintage: string;
}

/** Fiche de transparisation complète d'un fonds. */
export interface FundTransparence {
  structureType: StructureType;
  vintage: string;
  coeurSatellite: "Cœur" | "Satellite";
  /** Note de risque interne 1 (prudent) – 5 (agressif). */
  riskNote: number;
  /** Durée d'illiquidité indicative (années). */
  illiquidityYears: number;
  currency: "EUR" | "USD";
  geography: ExposureSlice[];
  sector: ExposureSlice[];
  stage: ExposureSlice[];
  holdings: Holding[];
}

/** Avertissement méthodologique à afficher avec toute donnée transparisée. */
export const TRANSPARENCE_DISCLAIMER =
  "Donnée illustrative construite à partir des stratégies réelles connues des gérants cités. Elle n'engage pas les sociétés de gestion et ne reflète pas les portefeuilles réels. Un feeder ajoute une couche de frais (frais Private Corner + frais du fonds maître) à expliciter auprès de l'investisseur.";

/** Composition transparisée par slug de fonds. */
export const FUND_TRANSPARENCE: Record<string, FundTransparence> = {
  "pc-buyout-eqt": {
    structureType: "Feeder mono-gérant",
    vintage: "2026",
    coeurSatellite: "Satellite",
    riskNote: 4,
    illiquidityYears: 8,
    currency: "EUR",
    geography: [{ label: "Europe de l'Ouest", weight: 0.45 }, { label: "Europe du Nord", weight: 0.35 }, { label: "Amérique du Nord", weight: 0.15 }, { label: "Asie", weight: 0.05 }],
    sector: [{ label: "Technologie", weight: 0.3 }, { label: "Santé", weight: 0.25 }, { label: "Services B2B", weight: 0.25 }, { label: "Industrie", weight: 0.2 }],
    stage: [{ label: "Buyout mature", weight: 0.85 }, { label: "Growth", weight: 0.15 }],
    holdings: [
      { name: "EQT X", manager: "EQT", weight: 1.0, vintage: "2025" },
    ],
  },
  "pc-european-semiconductor": {
    structureType: "Feeder mono-gérant",
    vintage: "2026",
    coeurSatellite: "Satellite",
    riskNote: 5,
    illiquidityYears: 8,
    currency: "EUR",
    geography: [{ label: "Europe de l'Ouest", weight: 0.4 }, { label: "Amérique du Nord", weight: 0.35 }, { label: "Asie", weight: 0.25 }],
    sector: [{ label: "Technologie / Semi-conducteurs", weight: 1.0 }],
    stage: [{ label: "Growth", weight: 0.4 }, { label: "Buyout mature", weight: 0.6 }],
    holdings: [
      { name: "Ardian Semiconductor Fund I", manager: "Ardian", weight: 1.0, vintage: "2026" },
    ],
  },
  "european-midmarket-opportunities": {
    structureType: "Fonds multi-gérants",
    vintage: "2027",
    coeurSatellite: "Cœur",
    riskNote: 3,
    illiquidityYears: 9,
    currency: "EUR",
    geography: [{ label: "Europe de l'Ouest", weight: 0.7 }, { label: "Europe du Nord", weight: 0.2 }, { label: "Amérique du Nord", weight: 0.1 }],
    sector: [{ label: "Consommation", weight: 0.25 }, { label: "Santé", weight: 0.2 }, { label: "Services B2B", weight: 0.25 }, { label: "Industrie", weight: 0.15 }, { label: "Technologie", weight: 0.15 }],
    stage: [{ label: "Buyout mature", weight: 0.8 }, { label: "Growth", weight: 0.2 }],
    holdings: [
      { name: "PAI Partners VIII", manager: "PAI Partners", weight: 0.3, vintage: "2025" },
      { name: "Keensight VII", manager: "Keensight Capital", weight: 0.25, vintage: "2026" },
      { name: "Eurazeo Mid Cap V", manager: "Eurazeo", weight: 0.25, vintage: "2025" },
      { name: "General Atlantic Europe", manager: "General Atlantic", weight: 0.2, vintage: "2026" },
    ],
  },
  "pc-keensight-nova-vii": {
    structureType: "Feeder mono-gérant",
    vintage: "2026",
    coeurSatellite: "Satellite",
    riskNote: 4,
    illiquidityYears: 8,
    currency: "EUR",
    geography: [{ label: "Europe de l'Ouest", weight: 0.75 }, { label: "Europe du Nord", weight: 0.15 }, { label: "Amérique du Nord", weight: 0.1 }],
    sector: [{ label: "Technologie", weight: 0.55 }, { label: "Santé", weight: 0.45 }],
    stage: [{ label: "Growth", weight: 0.7 }, { label: "Buyout mature", weight: 0.3 }],
    holdings: [
      { name: "Keensight Nova VII", manager: "Keensight Capital", weight: 1.0, vintage: "2026" },
    ],
  },
  "tikehau-decarbonization-ii": {
    structureType: "Feeder mono-gérant",
    vintage: "2026",
    coeurSatellite: "Satellite",
    riskNote: 4,
    illiquidityYears: 9,
    currency: "EUR",
    geography: [{ label: "Europe de l'Ouest", weight: 0.55 }, { label: "Europe du Nord", weight: 0.25 }, { label: "Amérique du Nord", weight: 0.2 }],
    sector: [{ label: "Transition énergétique", weight: 0.45 }, { label: "Industrie", weight: 0.3 }, { label: "Infrastructure", weight: 0.25 }],
    stage: [{ label: "Buyout mature", weight: 0.7 }, { label: "Growth", weight: 0.3 }],
    holdings: [
      { name: "Tikehau Decarbonization Fund II", manager: "Tikehau Capital", weight: 1.0, vintage: "2026" },
    ],
  },
  "pc-wealth-buyout-2026": {
    structureType: "Feeder mono-gérant",
    vintage: "2026",
    coeurSatellite: "Satellite",
    riskNote: 3,
    illiquidityYears: 9,
    currency: "EUR",
    geography: [{ label: "Europe de l'Ouest", weight: 0.55 }, { label: "Europe du Nord", weight: 0.2 }, { label: "Amérique du Nord", weight: 0.25 }],
    sector: [{ label: "Consommation", weight: 0.2 }, { label: "Santé", weight: 0.2 }, { label: "Services B2B", weight: 0.25 }, { label: "Industrie", weight: 0.2 }, { label: "Technologie", weight: 0.15 }],
    stage: [{ label: "Buyout mature", weight: 0.9 }, { label: "Growth", weight: 0.1 }],
    holdings: [
      { name: "Ardian Buyout VIII", manager: "Ardian", weight: 1.0, vintage: "2026" },
    ],
  },
  "us-midcap-buyout": {
    structureType: "Fonds multi-gérants",
    vintage: "2027",
    coeurSatellite: "Satellite",
    riskNote: 3,
    illiquidityYears: 9,
    currency: "USD",
    geography: [{ label: "Amérique du Nord", weight: 1.0 }],
    sector: [{ label: "Services B2B", weight: 0.3 }, { label: "Industrie", weight: 0.25 }, { label: "Santé", weight: 0.2 }, { label: "Consommation", weight: 0.15 }, { label: "Technologie", weight: 0.1 }],
    stage: [{ label: "Buyout mature", weight: 1.0 }],
    holdings: [
      { name: "NB Select US Mid-Cap A", manager: "Neuberger Berman", weight: 0.35, vintage: "2026" },
      { name: "NB Select US Mid-Cap B", manager: "Neuberger Berman", weight: 0.35, vintage: "2026" },
      { name: "NB Co-invest US", manager: "Neuberger Berman", weight: 0.3, vintage: "2027" },
    ],
  },
  "merieux-innovation-ii": {
    structureType: "Feeder mono-gérant",
    vintage: "2026",
    coeurSatellite: "Satellite",
    riskNote: 5,
    illiquidityYears: 8,
    currency: "EUR",
    geography: [{ label: "Europe de l'Ouest", weight: 0.8 }, { label: "Amérique du Nord", weight: 0.2 }],
    sector: [{ label: "Santé (hors biotech)", weight: 1.0 }],
    stage: [{ label: "Growth", weight: 0.8 }, { label: "Buyout mature", weight: 0.2 }],
    holdings: [
      { name: "Mérieux Innovation II", manager: "Mérieux Equity Partners", weight: 1.0, vintage: "2026" },
    ],
  },
  "blue-owl-gp-stakes": {
    structureType: "Feeder mono-gérant",
    vintage: "2027",
    coeurSatellite: "Cœur",
    riskNote: 3,
    illiquidityYears: 10,
    currency: "USD",
    geography: [{ label: "Amérique du Nord", weight: 0.7 }, { label: "Europe de l'Ouest", weight: 0.2 }, { label: "Asie", weight: 0.1 }],
    sector: [{ label: "Gestion d'actifs (GP stakes)", weight: 1.0 }],
    stage: [{ label: "Autre (GP stakes)", weight: 1.0 }],
    holdings: [
      { name: "Blue Owl GP Stakes VI", manager: "Blue Owl Capital", weight: 1.0, vintage: "2026" },
    ],
  },
  "pc-secondary-2026": {
    structureType: "Fonds secondaire",
    vintage: "2026",
    coeurSatellite: "Cœur",
    riskNote: 2,
    illiquidityYears: 7,
    currency: "EUR",
    geography: [{ label: "Amérique du Nord", weight: 0.5 }, { label: "Europe de l'Ouest", weight: 0.4 }, { label: "Asie", weight: 0.1 }],
    sector: [{ label: "Technologie", weight: 0.25 }, { label: "Santé", weight: 0.2 }, { label: "Services B2B", weight: 0.2 }, { label: "Consommation", weight: 0.2 }, { label: "Industrie", weight: 0.15 }],
    stage: [{ label: "Secondaire (parts matures)", weight: 1.0 }],
    holdings: [
      { name: "Panier secondaire buyout EU", manager: "Multi-gérants", weight: 0.45, vintage: "2020" },
      { name: "Panier secondaire buyout US", manager: "Multi-gérants", weight: 0.35, vintage: "2019" },
      { name: "Panier secondaire growth", manager: "Multi-gérants", weight: 0.2, vintage: "2021" },
    ],
  },
  "pc-credit-yield": {
    structureType: "Feeder mono-gérant",
    vintage: "2026",
    coeurSatellite: "Cœur",
    riskNote: 2,
    illiquidityYears: 6,
    currency: "EUR",
    geography: [{ label: "Europe de l'Ouest", weight: 0.55 }, { label: "Amérique du Nord", weight: 0.45 }],
    sector: [{ label: "Services B2B", weight: 0.3 }, { label: "Santé", weight: 0.2 }, { label: "Consommation", weight: 0.2 }, { label: "Industrie", weight: 0.15 }, { label: "Technologie", weight: 0.15 }],
    stage: [{ label: "Dette", weight: 1.0 }],
    holdings: [
      { name: "CVC Credit Partners", manager: "CVC", weight: 0.55, vintage: "2026" },
      { name: "GA Credit", manager: "General Atlantic", weight: 0.45, vintage: "2026" },
    ],
  },
  "meridiam-global-infrastructure": {
    structureType: "Feeder mono-gérant",
    vintage: "2026",
    coeurSatellite: "Cœur",
    riskNote: 2,
    illiquidityYears: 12,
    currency: "EUR",
    geography: [{ label: "Europe de l'Ouest", weight: 0.4 }, { label: "Amérique du Nord", weight: 0.25 }, { label: "Asie", weight: 0.15 }, { label: "Mondial diversifié", weight: 0.2 }],
    sector: [{ label: "Infrastructure transport", weight: 0.3 }, { label: "Énergie / Transition", weight: 0.35 }, { label: "Infrastructure sociale", weight: 0.2 }, { label: "Télécom", weight: 0.15 }],
    stage: [{ label: "Actifs réels", weight: 1.0 }],
    holdings: [
      { name: "Meridiam Infrastructure Fund IV", manager: "Meridiam", weight: 1.0, vintage: "2025" },
    ],
  },
};

/** Transparisation d'un fonds (undefined si hors gamme transparisée). */
export function getTransparence(slug: string): FundTransparence | undefined {
  return FUND_TRANSPARENCE[slug];
}

/** Trie une liste d'expositions par poids décroissant (copie). */
export function byWeightDesc(slices: ExposureSlice[]): ExposureSlice[] {
  return [...slices].sort((a, b) => b.weight - a.weight);
}
