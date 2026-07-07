import type {
  Diversification,
  Fund,
  PacingProfile,
  StrategyBucket,
} from "@/types/domain";

/* Helpers de gamme, pacing et formatage — logique pure, sans dépendance UI. */

/** Libellés FR des poches (buckets). */
export const BUCKET_LABEL: Record<StrategyBucket, string> = {
  defensif: "Défensif",
  coeur: "Cœur",
  croissance: "Croissance",
  satellite: "Satellite",
};

/** Ordre d'affichage des poches (du plus protecteur au plus offensif). */
export const BUCKET_ORDER: StrategyBucket[] = [
  "defensif",
  "coeur",
  "croissance",
  "satellite",
];

/** Libellés FR des profils de pacing (classe d'actif / rythme). */
export const PACING_LABEL: Record<PacingProfile, string> = {
  buyout: "Buyout",
  growth: "Growth",
  innovation: "Innovation",
  credit: "Dette privée",
  infra: "Infrastructure",
  secondary: "Secondaire",
  gpstakes: "GP Stakes",
};

/** Token CSS de couleur de poche (data-viz — voir DESIGN_SYSTEM §2.b). */
export const BUCKET_COLOR_VAR: Record<StrategyBucket, string> = {
  defensif: "var(--color-bucket-defensif)",
  coeur: "var(--color-bucket-coeur)",
  croissance: "var(--color-bucket-croissance)",
  satellite: "var(--color-bucket-satellite)",
};

/** Plage de compartiments cible par diversification (§8.1 étape 6). */
export const DIVERSIFICATION_RANGE: Record<
  Diversification,
  { min: number; max: number }
> = {
  concentre: { min: 3, max: 4 },
  equilibre: { min: 5, max: 6 },
  large: { min: 7, max: 9 },
};

/** Pas du ticket d'un fonds (unité d'incrément des steppers). */
export function ticketStep(fund: Fund): number {
  return fund.min_ticket;
}

/** Arrondit un montant au multiple inférieur du ticket du fonds. */
export function floorToTicket(amount: number, fund: Fund): number {
  const step = ticketStep(fund);
  if (step <= 0) return Math.max(0, Math.round(amount));
  return Math.max(0, Math.floor(amount / step) * step);
}

/**
 * Coerce les champs numériques d'un fonds en `number`. Les types générés annoncent
 * `number`, mais on se prémunit contre tout `numeric` renvoyé en chaîne selon le driver.
 */
export function normalizeFund(fund: Fund): Fund {
  const num = (v: unknown, fallback = 0) =>
    v == null ? fallback : Number(v);
  return {
    ...fund,
    min_ticket: num(fund.min_ticket, 100000),
    target_multiple: num(fund.target_multiple),
    target_gross_irr: num(fund.target_gross_irr),
    esg_score: fund.esg_score == null ? fund.esg_score : num(fund.esg_score),
    risk_score: fund.risk_score == null ? fund.risk_score : num(fund.risk_score),
    sort_order: num(fund.sort_order),
  };
}

/** Gamme active, normalisée et triée par sort_order. */
export function activeFunds(funds: Fund[]): Fund[] {
  return funds
    .filter((f) => f.is_active)
    .map(normalizeFund)
    .sort((a, b) => a.sort_order - b.sort_order);
}

/** Regroupe des fonds par poche. */
export function groupByBucket(funds: Fund[]): Record<StrategyBucket, Fund[]> {
  const out = {
    defensif: [],
    coeur: [],
    croissance: [],
    satellite: [],
  } as Record<StrategyBucket, Fund[]>;
  for (const f of funds) out[f.bucket].push(f);
  return out;
}

/** Formate un montant en euros (locale fr, sans décimales). */
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Formate un pourcentage (ex. 0.185 → « 18,5 % »). */
export function formatPercent(ratio: number, digits = 1): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(ratio);
}

/** Formate un multiple (ex. 2.1 → « 2,1× »). */
export function formatMultiple(m: number, digits = 1): string {
  return `${m.toLocaleString("fr-FR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}×`;
}

/**
 * Formate un montant en euros de façon compacte (ex. 16 500 000 → « 16,5 M€ »,
 * 820 000 → « 820 k€ »). Pour les grands chiffres de synthèse (KPIs, hero).
 */
export function formatEuroCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const nf = (v: number, digits: number) =>
    v.toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    });
  if (abs >= 1_000_000) return `${sign}${nf(abs / 1_000_000, 1)} M€`;
  if (abs >= 1_000) return `${sign}${nf(abs / 1_000, 0)} k€`;
  return `${sign}${nf(abs, 0)} €`;
}
