import type {
  AllocationInput,
  AllocationLine,
  Fund,
  RiskProfile,
  StrategyBucket,
} from "@/types/domain";
import { activeFunds, DIVERSIFICATION_RANGE } from "@/lib/funds";

/* =========================================================================
   Moteur d'allocation (CLAUDE_CODE_PROMPT §8.2) — logique pure et déterministe.
   Entrée : réponses du funnel + gamme. Sortie : { fundId, amount }[] en tickets entiers.
   ========================================================================= */

/** Matrice des poids de poches par profil de risque (§8.2). */
export const RISK_WEIGHTS: Record<
  RiskProfile,
  Record<StrategyBucket, number>
> = {
  prudent: { defensif: 0.45, coeur: 0.4, croissance: 0.15, satellite: 0 },
  equilibre: { defensif: 0.25, coeur: 0.45, croissance: 0.25, satellite: 0.05 },
  dynamique: { defensif: 0.15, coeur: 0.4, croissance: 0.3, satellite: 0.15 },
  offensif: { defensif: 0.05, coeur: 0.35, croissance: 0.35, satellite: 0.25 },
};

/**
 * Score d'un fonds = poids de sa poche × boosts (§8.2).
 * Boosts : durable ×1.5 · stratégie souhaitée ×1.5 · rendement (credit/infra/gpstakes) ×1.3 ·
 * impact (esg_score>0) ×1.4 · croissance (croissance/satellite) ×1.25 ·
 * décorrélation (infra/credit/secondary) ×1.2.
 */
export function scoreFund(fund: Fund, input: AllocationInput): number {
  const weights = RISK_WEIGHTS[input.riskProfile];
  let score = weights[fund.bucket];
  if (score <= 0) return 0;

  const objectives = new Set(input.objectives);
  const strategies = new Set(input.strategies);
  const esgScore = fund.esg_score ?? 0;

  if (input.esg && esgScore > 0) score *= 1 + 0.5 * 1; // ×1.5
  if (strategies.has(fund.pacing)) score *= 1.5;
  if (
    objectives.has("rendement") &&
    (fund.pacing === "credit" ||
      fund.pacing === "infra" ||
      fund.pacing === "gpstakes")
  ) {
    score *= 1.3;
  }
  if (objectives.has("impact") && esgScore > 0) score *= 1.4;
  if (
    objectives.has("croissance") &&
    (fund.bucket === "croissance" || fund.bucket === "satellite")
  ) {
    score *= 1.25;
  }
  if (
    objectives.has("decorrelation") &&
    (fund.pacing === "infra" ||
      fund.pacing === "credit" ||
      fund.pacing === "secondary")
  ) {
    score *= 1.2;
  }
  return score;
}

/** Cap de concentration par fonds (§8.2). */
export function concentrationCap(envelope: number): number {
  return Math.max(200000, 0.3 * envelope);
}

interface Scored {
  fund: Fund;
  score: number;
}

/**
 * Compose une allocation en tickets entiers :
 *  1. amorçage — couverture d'un fonds par poche à poids > 0 (meilleur score) ;
 *  2. complément jusqu'à la diversification minimale (meilleurs scores) ;
 *  3. distribution du solde par score, orientée vers les poches sous leur cible,
 *     en respectant min_ticket et le cap de concentration.
 */
export function buildAllocation(
  input: AllocationInput,
  funds: Fund[],
): AllocationLine[] {
  const cap = concentrationCap(input.envelope);
  const weights = RISK_WEIGHTS[input.riskProfile];
  const { min: minN, max: maxN } = DIVERSIFICATION_RANGE[input.diversification];

  // Candidats scorés (poids de poche > 0), triés par score puis ticket croissant.
  const scored: Scored[] = activeFunds(funds)
    .map((fund) => ({ fund, score: scoreFund(fund, input) }))
    .filter((s) => s.score > 0)
    .sort(
      (a, b) => b.score - a.score || a.fund.min_ticket - b.fund.min_ticket,
    );

  if (scored.length === 0) return [];

  const amounts = new Map<string, number>();
  const byId = new Map(scored.map((s) => [s.fund.id, s]));
  const spent = () =>
    [...amounts.values()].reduce((sum, v) => sum + v, 0);
  const remaining = () => input.envelope - spent();

  const canSeed = (s: Scored) =>
    !amounts.has(s.fund.id) &&
    s.fund.min_ticket <= remaining() &&
    s.fund.min_ticket <= cap;

  // 1. Amorçage : meilleur fonds de chaque poche active (poids décroissant).
  const activeBuckets = (
    ["defensif", "coeur", "croissance", "satellite"] as StrategyBucket[]
  )
    .filter((b) => weights[b] > 0)
    .sort((a, b) => weights[b] - weights[a]);

  for (const bucket of activeBuckets) {
    const best = scored.find((s) => s.fund.bucket === bucket && canSeed(s));
    if (best) amounts.set(best.fund.id, best.fund.min_ticket);
  }

  // 2. Complément jusqu'à la diversification minimale.
  for (const s of scored) {
    if (amounts.size >= minN) break;
    if (canSeed(s)) amounts.set(s.fund.id, s.fund.min_ticket);
  }

  // Cibles par poche (euros).
  const bucketTarget: Record<StrategyBucket, number> = {
    defensif: weights.defensif * input.envelope,
    coeur: weights.coeur * input.envelope,
    croissance: weights.croissance * input.envelope,
    satellite: weights.satellite * input.envelope,
  };
  const bucketCurrent = (): Record<StrategyBucket, number> => {
    const acc: Record<StrategyBucket, number> = {
      defensif: 0,
      coeur: 0,
      croissance: 0,
      satellite: 0,
    };
    for (const [id, amt] of amounts) {
      const f = byId.get(id);
      if (f) acc[f.fund.bucket] += amt;
    }
    return acc;
  };

  // 3. Distribution du solde par tickets entiers.
  //    À chaque tour, on ajoute un ticket au fonds éligible de plus forte priorité
  //    (besoin de poche × score), jusqu'à épuisement du solde ou absence d'éligible.
  //    Guard anti-boucle : au plus (envelope / plus petit ticket) tours.
  const minTicket = Math.min(...scored.map((s) => s.fund.min_ticket));
  const maxIterations = Math.ceil(input.envelope / Math.max(1, minTicket)) + 8;

  for (let i = 0; i < maxIterations; i++) {
    const rem = remaining();
    if (rem < minTicket) break;
    const current = bucketCurrent();

    let best: Scored | null = null;
    let bestPriority = -Infinity;

    for (const s of scored) {
      const held = amounts.get(s.fund.id) ?? 0;
      const isNew = held === 0;
      // Ne pas dépasser le nombre max de compartiments en introduisant un nouveau fonds.
      if (isNew && amounts.size >= maxN) continue;
      const step = s.fund.min_ticket;
      if (step > rem) continue;
      if (held + step > cap) continue;

      const bucketNeed = Math.max(0, bucketTarget[s.fund.bucket] - current[s.fund.bucket]);
      // Priorité : poches sous leur cible d'abord (pondérées par le score),
      // sinon simple top-up des meilleurs scores (facteur réduit).
      const priority = bucketNeed > 0 ? bucketNeed * s.score : s.score * 1e-6;
      if (priority > bestPriority) {
        bestPriority = priority;
        best = s;
      }
    }

    if (!best) break;
    amounts.set(best.fund.id, (amounts.get(best.fund.id) ?? 0) + best.fund.min_ticket);
  }

  // Résultat ordonné par sort_order de la gamme.
  return activeFunds(funds)
    .filter((f) => (amounts.get(f.id) ?? 0) > 0)
    .map((f) => ({ fundId: f.id, amount: amounts.get(f.id)! }));
}
