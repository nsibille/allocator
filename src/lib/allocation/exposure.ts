import type { Fund } from "@/types/domain";
import { getTransparence, type ExposureSlice } from "@/lib/fonds/transparence";

/* =========================================================================
   Consolidation des expositions au niveau d'une allocation (look-through).
   Chaque fonds porte des expositions normalisées à 100 % (transparence) ; on
   les pondère par le montant investi pour obtenir l'exposition consolidée du
   portefeuille sur chaque axe (géographie, secteur, stade). Logique pure —
   recalculée en temps réel côté éditeur à chaque changement de montant.
   ========================================================================= */

export type ExposureAxis = "geography" | "sector" | "stage";

export const AXIS_LABEL: Record<ExposureAxis, string> = {
  geography: "Géographie",
  sector: "Secteur d'activité",
  stage: "Stade",
};

export interface ConsolidatedExposure {
  geography: ExposureSlice[];
  sector: ExposureSlice[];
  stage: ExposureSlice[];
  /** Montant investi couvert par la transparisation. */
  covered: number;
  /** Montant total investi (lignes > 0). */
  total: number;
}

const EMPTY: ConsolidatedExposure = {
  geography: [],
  sector: [],
  stage: [],
  covered: 0,
  total: 0,
};

/**
 * Consolide les expositions d'un ensemble de lignes (fondId → montant) en
 * moyenne pondérée par le capital, normalisée sur la part transparisée.
 */
export function consolidateExposures(
  lines: { fundId: string; amount: number }[],
  fundsById: Map<string, Fund>,
): ConsolidatedExposure {
  const total = lines.reduce((s, l) => s + Math.max(0, l.amount), 0);
  if (total <= 0) return EMPTY;

  const acc: Record<ExposureAxis, Map<string, number>> = {
    geography: new Map(),
    sector: new Map(),
    stage: new Map(),
  };
  let covered = 0;

  for (const { fundId, amount } of lines) {
    if (amount <= 0) continue;
    const fund = fundsById.get(fundId);
    if (!fund) continue;
    const t = getTransparence(fund.slug);
    if (!t) continue; // fonds hors périmètre transparisé
    covered += amount;
    (Object.keys(acc) as ExposureAxis[]).forEach((axis) => {
      for (const slice of t[axis]) {
        acc[axis].set(
          slice.label,
          (acc[axis].get(slice.label) ?? 0) + amount * slice.weight,
        );
      }
    });
  }

  const build = (m: Map<string, number>): ExposureSlice[] =>
    covered <= 0
      ? []
      : [...m.entries()]
          .map(([label, v]) => ({ label, weight: v / covered }))
          .sort((a, b) => b.weight - a.weight);

  return {
    geography: build(acc.geography),
    sector: build(acc.sector),
    stage: build(acc.stage),
    covered,
    total,
  };
}

/** Variante à partir de paires (fonds, montant) — pratique côté PDF. */
export function consolidateFromPairs(
  pairs: { fund: Fund; amount: number }[],
): ConsolidatedExposure {
  const fundsById = new Map(pairs.map((p) => [p.fund.id, p.fund]));
  return consolidateExposures(
    pairs.map((p) => ({ fundId: p.fund.id, amount: p.amount })),
    fundsById,
  );
}
