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

/* -------------------------------------------------------------------------
   Pilotage inverse : cibler une exposition et re-répartir les fonds
   -------------------------------------------------------------------------
   L'exposition consolidée est linéaire dans les poids des fonds :
     E(z) = Σ_f w_f · e_f(z).
   Piloter par cible = trouver les poids w (simplexe : w ≥ 0, Σ w = 1) qui
   approchent au mieux un vecteur cible T(z), par moindres carrés. On résout
   par gradient exponentié (mirror descent) : stable, reste sur le simplexe,
   rapide (quelques centaines d'itérations pour ≤ 12 fonds). Solution pure. */

/** Union ordonnée des libellés d'un axe sur un panier de fonds (transparisés). */
export function unionAxisLabels(funds: Fund[], axis: ExposureAxis): string[] {
  const seen: string[] = [];
  for (const f of funds) {
    const t = getTransparence(f.slug);
    if (!t) continue;
    for (const s of t[axis]) if (!seen.includes(s.label)) seen.push(s.label);
  }
  return seen;
}

/** Poids d'un fonds sur un libellé d'axe (0 si absent / non transparisé). */
function weightOn(fund: Fund, axis: ExposureAxis, label: string): number {
  const t = getTransparence(fund.slug);
  if (!t) return 0;
  return t[axis].find((s) => s.label === label)?.weight ?? 0;
}

/** Fonds du panier réellement transparisés (candidats au pilotage). */
export function steerableFunds(
  lines: { fundId: string; amount: number }[],
  fundsById: Map<string, Fund>,
): Fund[] {
  return lines
    .map((l) => fundsById.get(l.fundId))
    .filter((f): f is Fund => !!f && !!getTransparence(f.slug));
}

/** Gradient exponentié : minimise ½‖M·w − T‖² sur le simplexe. */
function solveWeights(
  matrix: number[][], // [zone][fonds]
  target: number[], // aligné aux zones (sera normalisé)
  w0: number[],
  iters = 700,
  eta = 6,
): number[] {
  const nz = matrix.length;
  const nf = w0.length;
  if (nf === 0) return [];
  const ts = target.reduce((a, b) => a + b, 0) || 1;
  const T = target.map((x) => x / ts);
  let w = w0.slice();
  for (let it = 0; it < iters; it++) {
    const E = new Array(nz).fill(0);
    for (let z = 0; z < nz; z++) {
      let e = 0;
      for (let f = 0; f < nf; f++) e += matrix[z][f] * w[f];
      E[z] = e;
    }
    let sum = 0;
    const next = new Array(nf).fill(0);
    for (let f = 0; f < nf; f++) {
      let g = 0;
      for (let z = 0; z < nz; z++) g += (E[z] - T[z]) * matrix[z][f];
      const nv = w[f] * Math.exp(-eta * g);
      next[f] = nv;
      sum += nv;
    }
    w = sum > 0 ? next.map((x) => x / sum) : w;
  }
  return w;
}

export interface SteerOutcome {
  /** Nouveaux montants par fonds (fonds tombés à ~0 exclus). */
  amounts: Record<string, number>;
  /** Exposition atteinte sur l'axe piloté (aligné à `zones`). */
  achieved: ExposureSlice[];
}

/**
 * Re-répartit le capital investi entre les fonds du panier pour approcher une
 * exposition cible sur un axe. Conserve l'enveloppe déployée (montant courant),
 * arrondit chaque montant au pas du ticket, écarte les fonds tombés sous un
 * ticket. Renvoie aussi l'exposition réellement atteinte (faisabilité).
 */
export function steerToTarget(
  lines: { fundId: string; amount: number }[],
  fundsById: Map<string, Fund>,
  axis: ExposureAxis,
  zones: string[],
  target: number[],
  envelope: number,
): SteerOutcome {
  const basket = steerableFunds(lines, fundsById);
  const nf = basket.length;
  if (nf < 2) return { amounts: {}, achieved: [] };

  const matrix = zones.map((z) => basket.map((f) => weightOn(f, axis, z)));
  const amountOf = (id: string) =>
    lines.find((l) => l.fundId === id)?.amount ?? 0;

  const deployed = lines.reduce((s, l) => s + Math.max(0, l.amount), 0);
  const scale = deployed > 0 ? deployed : envelope;

  // Amorçage : poids courants (ou uniforme).
  const w0raw = basket.map((f) => Math.max(amountOf(f.id), 1));
  const w0sum = w0raw.reduce((a, b) => a + b, 0);
  const w0 = w0raw.map((x) => x / w0sum);

  const w = solveWeights(matrix, target, w0);

  const achieved: ExposureSlice[] = zones.map((z, zi) => ({
    label: z,
    weight: basket.reduce((s, _f, fi) => s + matrix[zi][fi] * w[fi], 0),
  }));

  const amounts: Record<string, number> = {};
  basket.forEach((f, fi) => {
    const step = f.min_ticket > 0 ? f.min_ticket : 1;
    const snapped = Math.round((w[fi] * scale) / step) * step;
    if (snapped >= step) amounts[f.id] = snapped;
  });

  return { amounts, achieved };
}
