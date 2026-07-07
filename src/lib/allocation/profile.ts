import type {
  InvestorProfile,
  ProfileSubScore,
  QualificationInput,
  RiskProfile,
  StrategyBucket,
} from "@/types/domain";
import { RISK_WEIGHTS } from "@/lib/allocation/engine";
import { BUCKET_ORDER } from "@/lib/funds";

/* =========================================================================
   Profil type & score de dynamisme (récap du funnel) — logique pure et
   déterministe. À partir des réponses de qualification, calcule six sous-scores
   (0..100), un score de dynamisme global, le profil dérivé et l'allocation
   stratégique recommandée par poche. Aucune dépendance UI.
   ========================================================================= */

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const round = (v: number) => Math.round(clamp(v));

/** Capacité de perte : part du patrimoine mobilisable sans impact sur le train de vie. */
function lossCapacityScore(input: QualificationInput): number {
  switch (input.lossCapacity) {
    case "lt_10":
      return 25;
    case "10_25":
      return 50;
    case "25_50":
      return 75;
    case "gt_50":
      return 100;
    default: {
      // Repli : ratio enveloppe / patrimoine financier.
      const ratio =
        input.patrimoine && input.patrimoine > 0
          ? input.envelope / input.patrimoine
          : 0.2;
      if (ratio < 0.1) return 25;
      if (ratio < 0.25) return 50;
      if (ratio < 0.5) return 75;
      return 100;
    }
  }
}

/** Horizon & liquidité : durée de détention + capacité d'immobilisation. */
function horizonScore(input: QualificationInput): number {
  const h = input.horizonYears;
  let s = 30 + ((h - 5) / 10) * 60; // 5 ans → 30, 15 ans → 90
  if (input.immobilisation === "faible") s -= 15;
  else if (input.immobilisation === "forte") s += 10;
  if (input.callCapacity) s += 10;
  return clamp(s);
}

/** Tolérance au risque : profil déclaré + réaction comportementale à une baisse. */
function riskToleranceScore(input: QualificationInput): number {
  const base: Record<RiskProfile, number> = {
    prudent: 20,
    equilibre: 45,
    dynamique: 70,
    offensif: 95,
  };
  let s = base[input.riskProfile];
  if (input.reactionBaisse === "vendre") s -= 15;
  else if (input.reactionBaisse === "renforcer") s += 10;
  return clamp(s);
}

/** Taille du patrimoine : échelle logarithmique (100 k€ → bas, ≥ 5 M€ → haut). */
function wealthScore(input: QualificationInput): number {
  const p = input.patrimoine;
  if (!p || p <= 0) return 50;
  const lo = Math.log10(100000);
  const hi = Math.log10(5000000);
  const s = ((Math.log10(p) - lo) / (hi - lo)) * 100;
  return clamp(s, 10, 100);
}

/** Préférences ESG : intégration durable + objectif d'impact. */
function esgScore(input: QualificationInput): number {
  let s = 20;
  if (input.esg) s += 40;
  if (input.objectives.includes("impact")) s += 25;
  return clamp(s);
}

/** Stabilité des revenus du foyer. */
function stabilityScore(input: QualificationInput): number {
  switch (input.revenusStability) {
    case "stable":
      return 100;
    case "variable":
      return 60;
    case "irregulier":
      return 30;
    default:
      return 70;
  }
}

/** Poids des sous-scores dans le score de dynamisme global. */
const DYNAMISM_WEIGHTS: Record<string, number> = {
  tolerance: 0.3,
  loss: 0.25,
  horizon: 0.2,
  wealth: 0.15,
  stability: 0.1,
};

/** Bandes de profil dérivé à partir du score de dynamisme. */
function profileFromScore(score: number): { label: string; risk: RiskProfile } {
  if (score < 35) return { label: "Prudent", risk: "prudent" };
  if (score < 58) return { label: "Équilibré", risk: "equilibre" };
  if (score < 78) return { label: "Dynamique", risk: "dynamique" };
  return { label: "Offensif", risk: "offensif" };
}

/**
 * Calcule le profil type complet : sous-scores, score de dynamisme, profil
 * dérivé, cohérence avec le profil déclaré et allocation recommandée par poche.
 */
export function computeProfile(input: QualificationInput): InvestorProfile {
  const loss = lossCapacityScore(input);
  const horizon = horizonScore(input);
  const tolerance = riskToleranceScore(input);
  const wealth = wealthScore(input);
  const esg = esgScore(input);
  const stability = stabilityScore(input);

  const subScores: ProfileSubScore[] = [
    { key: "loss", label: "Capacité de perte", value: round(loss) },
    { key: "horizon", label: "Horizon & liquidité", value: round(horizon) },
    { key: "tolerance", label: "Tolérance au risque", value: round(tolerance) },
    { key: "wealth", label: "Taille patrimoine", value: round(wealth) },
    { key: "esg", label: "Préférences ESG", value: round(esg) },
    { key: "stability", label: "Stabilité revenus", value: round(stability) },
  ];

  const dynamismScore = round(
    tolerance * DYNAMISM_WEIGHTS.tolerance +
      loss * DYNAMISM_WEIGHTS.loss +
      horizon * DYNAMISM_WEIGHTS.horizon +
      wealth * DYNAMISM_WEIGHTS.wealth +
      stability * DYNAMISM_WEIGHTS.stability,
  );

  const derived = profileFromScore(dynamismScore);

  // Allocation recommandée : poids de poches du profil DÉCLARÉ (celui qui
  // pilote effectivement le moteur d'allocation), ordonnés par convention.
  const weights = RISK_WEIGHTS[input.riskProfile];
  const recommendedBuckets = BUCKET_ORDER.map((bucket: StrategyBucket) => ({
    bucket,
    weight: weights[bucket],
  })).filter((b) => b.weight > 0);

  return {
    dynamismScore,
    profileLabel: derived.label,
    profileRisk: derived.risk,
    subScores,
    recommendedBuckets,
    coherent: derived.risk === input.riskProfile,
  };
}
