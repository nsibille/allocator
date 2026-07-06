import type {
  AllocationLine,
  Fund,
  PacingProfile,
  ProjectionMetrics,
  ProjectionResult,
  ProjectionRow,
  Scenario,
} from "@/types/domain";

/* =========================================================================
   Moteur de projection (CLAUDE_CODE_PROMPT §8.4) — logique pure et déterministe.
   Modèle paramétrique par pacing : calendrier d'appels + courbe de distribution
   (smoothstep de distStart à term), multiple ajusté par scénario, agrégation portefeuille.
   ========================================================================= */

export const HORIZON_YEARS = 15;

/** Paramètres de cycle de vie par profil de pacing (en années). */
interface PacingParams {
  /** Durée d'appel du capital (période d'investissement). */
  callYears: number;
  /** Année de début des distributions. */
  distStart: number;
  /** Année de liquidation complète (fin de vie). */
  term: number;
}

export const PACING_PARAMS: Record<PacingProfile, PacingParams> = {
  buyout: { callYears: 4, distStart: 4, term: 11 },
  growth: { callYears: 4, distStart: 5, term: 12 },
  innovation: { callYears: 5, distStart: 6, term: 13 },
  credit: { callYears: 2, distStart: 2, term: 7 },
  infra: { callYears: 4, distStart: 3, term: 14 },
  secondary: { callYears: 2, distStart: 2, term: 8 },
  gpstakes: { callYears: 3, distStart: 3, term: 12 },
};

/** Facteur de multiple par scénario, appliqué sur (multiple − 1) [§8.4]. */
export const SCENARIO_FACTOR: Record<Scenario, number> = {
  prudent: 0.75,
  central: 1,
  optimiste: 1.25,
};

/** Rampe lissée (smoothstep) bornée [0,1]. */
function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Multiple cible ajusté par scénario. */
export function adjustedMultiple(
  targetMultiple: number,
  scenario: Scenario,
): number {
  return 1 + (targetMultiple - 1) * SCENARIO_FACTOR[scenario];
}

/**
 * Décale le calendrier de distribution selon le rythme choisi (curseur −2…+2).
 * Rythme positif = distributions plus précoces (distStart et term avancés).
 */
function pacedParams(base: PacingParams, distPace: number): PacingParams {
  const shift = Math.max(-2, Math.min(2, distPace));
  const distStart = Math.max(1, base.distStart - shift);
  const term = Math.max(distStart + 2, base.term - shift);
  return { callYears: base.callYears, distStart, term };
}

/** Projection d'une ligne (fonds + montant engagé) sur 0→HORIZON. */
function projectLine(
  committed: number,
  fund: Fund,
  scenario: Scenario,
  distPace: number,
): ProjectionRow[] {
  const params = pacedParams(PACING_PARAMS[fund.pacing], distPace);
  const mAdj = adjustedMultiple(fund.target_multiple, scenario);
  const totalDist = committed * mAdj; // distributions cumulées à terme

  const rows: ProjectionRow[] = [];
  let prevPaidIn = 0;
  let prevDist = 0;

  for (let year = 0; year <= HORIZON_YEARS; year++) {
    // Capital appelé cumulé (rampe lissée sur la période d'investissement).
    const paidIn = committed * smoothstep(0, params.callYears, year);
    // Distributions cumulées (rampe lissée de distStart à term).
    const dist = totalDist * smoothstep(params.distStart, params.term, year);
    // Valeur totale créée cumulée : le capital appelé plus la plus-value reconnue,
    // cette dernière suivant l'avancement des réalisations.
    const valueRamp = smoothstep(1, params.term, year);
    const totalValue = paidIn + committed * (mAdj - 1) * valueRamp;
    const nav = Math.max(0, totalValue - dist);

    rows.push({
      year,
      calls: paidIn - prevPaidIn,
      distributions: dist - prevDist,
      nav,
      totalValue: nav + dist,
      netCashCumulative: dist - paidIn,
    });

    prevPaidIn = paidIn;
    prevDist = dist;
  }
  return rows;
}

/** TRI (méthode de bissection) à partir de flux annuels nets. */
export function computeIRR(cashflows: number[]): number {
  const npv = (rate: number) =>
    cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);

  // Sans flux positif ni négatif, TRI indéfini → 0.
  const hasNeg = cashflows.some((c) => c < 0);
  const hasPos = cashflows.some((c) => c > 0);
  if (!hasNeg || !hasPos) return 0;

  let lo = -0.9;
  let hi = 2; // 200 %
  let npvLo = npv(lo);
  let npvHi = npv(hi);
  if (npvLo * npvHi > 0) return 0; // pas de changement de signe sur l'intervalle

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const npvMid = npv(mid);
    if (Math.abs(npvMid) < 1e-6) return mid;
    if (npvLo * npvMid < 0) {
      hi = mid;
      npvHi = npvMid;
    } else {
      lo = mid;
      npvLo = npvMid;
    }
  }
  return (lo + hi) / 2;
}

/**
 * Projette un portefeuille : agrège les lignes, séries annuelles + métriques.
 */
export function projectPortfolio(
  lines: AllocationLine[],
  fundsById: Map<string, Fund>,
  opts: { scenario: Scenario; distPace: number },
): ProjectionResult {
  const rows: ProjectionRow[] = Array.from(
    { length: HORIZON_YEARS + 1 },
    (_, year) => ({
      year,
      calls: 0,
      distributions: 0,
      nav: 0,
      totalValue: 0,
      netCashCumulative: 0,
    }),
  );

  let committed = 0;

  for (const line of lines) {
    const fund = fundsById.get(line.fundId);
    if (!fund || line.amount <= 0) continue;
    committed += line.amount;
    const lineRows = projectLine(line.amount, fund, opts.scenario, opts.distPace);
    for (let y = 0; y <= HORIZON_YEARS; y++) {
      rows[y].calls += lineRows[y].calls;
      rows[y].distributions += lineRows[y].distributions;
      rows[y].nav += lineRows[y].nav;
    }
  }

  // Recompose les cumuls agrégés (totalValue, trésorerie nette).
  let cumCalls = 0;
  let cumDist = 0;
  for (const row of rows) {
    cumCalls += row.calls;
    cumDist += row.distributions;
    row.totalValue = row.nav + cumDist;
    row.netCashCumulative = cumDist - cumCalls;
  }

  const last = rows[rows.length - 1];
  const paidIn = cumCalls || 1; // garde anti-division par zéro
  const projectedValue = last.distributions >= 0 ? cumDist + last.nav : cumDist;
  const tvpi = (cumDist + last.nav) / paidIn;
  const dpi = cumDist / paidIn;
  const peakCapital = rows.reduce(
    (peak, r) => Math.max(peak, -r.netCashCumulative),
    0,
  );
  const gain = cumDist + last.nav - cumCalls;

  // Flux nets annuels pour le TRI : −appels + distributions.
  const netCashflows = rows.map((r) => r.distributions - r.calls);
  const netIrr = computeIRR(netCashflows);

  const metrics: ProjectionMetrics = {
    tvpi,
    netIrr,
    dpi,
    peakCapital,
    gain,
    committed,
    projectedValue,
  };

  return { rows, metrics };
}
