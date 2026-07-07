import type { Database } from "./database.types";

/* Types métier dérivés du schéma (source : database.types.ts généré). */

export type RiskProfile = Database["public"]["Enums"]["risk_profile"];
export type StrategyBucket = Database["public"]["Enums"]["strategy_bucket"];
export type PacingProfile = Database["public"]["Enums"]["pacing_profile"];
export type AllocationStatus = Database["public"]["Enums"]["allocation_status"];
export type BulletinStatus = Database["public"]["Enums"]["bulletin_status"];
export type ClientStatus = Database["public"]["Enums"]["client_status"];
export type DocumentStatus = Database["public"]["Enums"]["document_status"];
export type ClientEventType = Database["public"]["Enums"]["client_event_type"];
export type EventActor = Database["public"]["Enums"]["event_actor"];

export type Fund = Database["public"]["Tables"]["funds"]["Row"];
export type AllocationRow = Database["public"]["Tables"]["allocations"]["Row"];
export type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
export type ClientDocumentRow =
  Database["public"]["Tables"]["client_documents"]["Row"];
export type ClientEventRow =
  Database["public"]["Tables"]["client_events"]["Row"];
export type ClientAssetRow =
  Database["public"]["Tables"]["client_assets"]["Row"];

/**
 * Réponses d'un questionnaire de qualification (KYC, adéquation, ESG, fiscalité).
 * Stockées telles quelles dans les colonnes JSONB du client ; le rendu et la
 * sémantique des clés sont pilotés par `lib/client/questionnaires.config.ts`.
 * Valeurs : chaîne (choix mono / texte), tableau (multi-sélection) ou nombre.
 */
export type QuestionnaireAnswers = Record<
  string,
  string | string[] | number | null
>;

/** Identifiant d'un des quatre questionnaires portés par le client. */
export type QuestionnaireKind = "kyc" | "adequacy" | "esg" | "tax";

/** Diversification souhaitée (nombre de compartiments cible). */
export type Diversification = "concentre" | "equilibre" | "large";

/** Enveloppe / véhicule réglementaire d'un fonds (colonne `funds.vehicle`). */
export type Vehicle = "eltif" | "fcpr" | "fcpi" | "fip" | "feeder";

/** Catégorisation MiFID de l'investisseur. */
export type MifidStatus = "non_professionnel" | "professionnel" | "contrepartie";

/** Expérience du non-coté (étape profil). */
export type Experience = "novice" | "initie" | "averti";

/** Capacité à immobiliser les sommes (étape horizon). */
export type Immobilisation = "faible" | "moyenne" | "forte";

/** Stabilité des revenus du foyer (étape patrimoine). */
export type RevenusStability = "stable" | "variable" | "irregulier";

/** Part du patrimoine mobilisable sans impact sur le train de vie (capacité de perte). */
export type LossCapacity = "lt_10" | "10_25" | "25_50" | "gt_50";

/** Réaction déclarée à une forte baisse de marché (tolérance comportementale). */
export type ReactionBaisse = "vendre" | "attendre" | "renforcer";

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

/**
 * Entrées de qualification enrichies servant au calcul du profil type et du
 * score de dynamisme (indépendantes du store, réutilisables serveur/PDF).
 */
export interface QualificationInput {
  patrimoine: number | null;
  envelope: number;
  riskProfile: RiskProfile;
  experience: Experience | null;
  horizonYears: number;
  immobilisation: Immobilisation | null;
  callCapacity: boolean;
  objectives: Objective[];
  esg: boolean;
  revenusStability: RevenusStability | null;
  lossCapacity: LossCapacity | null;
  reactionBaisse: ReactionBaisse | null;
}

/** Un axe du profil type (barre de sous-score 0..100). */
export interface ProfileSubScore {
  key: string;
  label: string;
  value: number;
}

/** Profil type de l'investisseur synthétisé à partir de la qualification. */
export interface InvestorProfile {
  /** Score de dynamisme global 0..100. */
  dynamismScore: number;
  /** Libellé du profil dérivé du score (Prudent … Offensif). */
  profileLabel: string;
  /** Profil de risque dérivé du score (pour l'allocation recommandée). */
  profileRisk: RiskProfile;
  subScores: ProfileSubScore[];
  /** Allocation stratégique recommandée par poche (poids 0..1). */
  recommendedBuckets: { bucket: StrategyBucket; weight: number }[];
  /** Le profil déclaré est cohérent avec le profil calculé. */
  coherent: boolean;
}

/**
 * Bloc `allocations.qualification` (jsonb) : entrées enrichies + score calculé
 * + périmètre de fonds choisi (constant), tel que persisté par le funnel.
 */
export interface AllocationQualification {
  mifidStatus: MifidStatus;
  acceptedVehicles: Vehicle[];
  ticketMin: number;
  experience: Experience | null;
  revenusStability: RevenusStability | null;
  lossCapacity: LossCapacity | null;
  reactionBaisse: ReactionBaisse | null;
  immobilisation: Immobilisation | null;
  callCapacity: boolean;
  patrimoine: number | null;
  autoSelect: boolean;
  dynamismScore: number;
  profileLabel: string;
  subScores: ProfileSubScore[];
  selectedFundIds: string[];
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
