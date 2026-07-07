import type { Database } from "./database.types";

/* Types métier dérivés du schéma (source : database.types.ts généré). */

export type RiskProfile = Database["public"]["Enums"]["risk_profile"];
export type StrategyBucket = Database["public"]["Enums"]["strategy_bucket"];
export type PacingProfile = Database["public"]["Enums"]["pacing_profile"];
export type AllocationStatus = Database["public"]["Enums"]["allocation_status"];
export type BulletinStatus = Database["public"]["Enums"]["bulletin_status"];

export type Fund = Database["public"]["Tables"]["funds"]["Row"];
export type AllocationRow = Database["public"]["Tables"]["allocations"]["Row"];

/** Diversification souhaitée (nombre de compartiments cible). */
export type Diversification = "concentre" | "equilibre" | "large";

/** Objectifs multi-sélection du funnel (étape 5). */
export type Objective =
  | "croissance"
  | "diversification"
  | "decorrelation"
  | "rendement"
  | "impact"
  | "acces";

/** Scénario de projection. */
export type Scenario = "prudent" | "central" | "optimiste";

/** Sortie du funnel consommée par le moteur d'allocation. */
export interface AllocationInput {
  envelope: number;
  riskProfile: RiskProfile;
  objectives: Objective[];
  /** Stratégies souhaitées, exprimées en profils de pacing. */
  strategies: PacingProfile[];
  esg: boolean;
  diversification: Diversification;
}

/** Ligne d'allocation produite par le moteur : montant en euros (multiple du ticket). */
export interface AllocationLine {
  fundId: string;
  amount: number;
}

/** Une année de la projection agrégée (courbe en J). */
export interface ProjectionRow {
  year: number;
  /** Appels de fonds de l'année (flux négatif de trésorerie). */
  calls: number;
  /** Distributions de l'année (flux positif). */
  distributions: number;
  /** Valeur liquidative (NAV) en fin d'année. */
  nav: number;
  /** Valeur totale = NAV + distributions cumulées. */
  totalValue: number;
  /** Trésorerie nette cumulée = distributions cumulées − appels cumulés. */
  netCashCumulative: number;
}

/** Métriques de synthèse d'une projection. */
export interface ProjectionMetrics {
  /** Total Value to Paid-In (NAV terminal + distributions) / capital appelé. */
  tvpi: number;
  /** TRI net estimé (annualisé) issu des flux nets. */
  netIrr: number;
  /** Distributions to Paid-In à terme. */
  dpi: number;
  /** Pic de trésorerie mobilisée (capital net max engagé). */
  peakCapital: number;
  /** Plus-value totale (valeur terminale − capital engagé). */
  gain: number;
  /** Capital total engagé (somme des lignes). */
  committed: number;
  /** Valeur projetée à terme (distributions cumulées + NAV terminal). */
  projectedValue: number;
}

export interface ProjectionResult {
  rows: ProjectionRow[];
  metrics: ProjectionMetrics;
}
