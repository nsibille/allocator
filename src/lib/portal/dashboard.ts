/* =========================================================================
   Agrégations du tableau de bord de pilotage (page d'accueil CGP).
   Logique pure, sans dépendance UI ni base : dérive des séries et totaux à
   partir des données de démonstration du portail (`demo.ts`) et de la base
   clients réelle passée en argument. Aucune couleur en dur.
   ========================================================================= */

import {
  ADVISORS,
  CONVENTIONS,
  CONVENTION_STAGE,
  COLLECTION_CADENCE,
  RETROCESSIONS,
  SUBSCRIPTIONS,
  subscriptionTotals,
  type Advisor,
  type Convention,
  type ConventionStage,
} from "./demo";

/* -------------------------------------------------------------------------
   Collecte — courbe cumulée mensuelle mise à l'échelle sur la collecte réelle
   ------------------------------------------------------------------------- */

export interface CollectionPoint {
  month: string;
  /** Collecte brute du mois (engagements). */
  gross: number;
  /** Collecte cumulée depuis le début de la période. */
  cumulative: number;
}

/**
 * Série mensuelle de collecte. La cadence (`COLLECTION_CADENCE`) fixe la forme ;
 * l'amplitude est calée sur `total` pour que le point terminal = collecte totale.
 */
export function collectionSeries(total: number): CollectionPoint[] {
  const sumWeights = COLLECTION_CADENCE.reduce((s, m) => s + m.weight, 0) || 1;
  let cumulative = 0;
  return COLLECTION_CADENCE.map((m) => {
    const gross = Math.round((m.weight / sumWeights) * total);
    cumulative += gross;
    return { month: m.label, gross, cumulative };
  });
}

/* -------------------------------------------------------------------------
   Collecte fonds par fonds
   ------------------------------------------------------------------------- */

export interface FundCollection {
  fundName: string;
  amount: number;
  /** Part de la collecte totale (0–1). */
  share: number;
  subscriptions: number;
}

/** Agrège la collecte par fonds (engagements des souscriptions), triée décroissante. */
export function collectionByFund(): FundCollection[] {
  const byFund = new Map<string, { amount: number; count: number }>();
  for (const s of SUBSCRIPTIONS) {
    const cur = byFund.get(s.fundName) ?? { amount: 0, count: 0 };
    cur.amount += s.amount;
    cur.count += 1;
    byFund.set(s.fundName, cur);
  }
  const total = SUBSCRIPTIONS.reduce((s, r) => s + r.amount, 0) || 1;
  return [...byFund.entries()]
    .map(([fundName, v]) => ({
      fundName,
      amount: v.amount,
      share: v.amount / total,
      subscriptions: v.count,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/* -------------------------------------------------------------------------
   Rétrocessions — ventilation réglé / en attente
   ------------------------------------------------------------------------- */

export interface RetrocessionSplit {
  total: number;
  paid: number;
  pending: number;
  /** Part réglée (0–1). */
  paidShare: number;
}

export function retrocessionSplit(): RetrocessionSplit {
  const total = RETROCESSIONS.reduce((s, r) => s + r.amount, 0);
  const paid = RETROCESSIONS.filter((r) => r.paymentDate != null).reduce(
    (s, r) => s + r.amount,
    0,
  );
  return {
    total,
    paid,
    pending: total - paid,
    paidShare: total > 0 ? paid / total : 0,
  };
}

/* -------------------------------------------------------------------------
   Conseillers — classement par encours conseillé
   ------------------------------------------------------------------------- */

export function advisorsByAum(): Advisor[] {
  return [...ADVISORS].sort((a, b) => b.aum - a.aum);
}

export function advisorTotals() {
  return {
    total: ADVISORS.length,
    active: ADVISORS.filter((a) => a.status.tone === "active").length,
    aum: ADVISORS.reduce((s, a) => s + a.aum, 0),
    investors: ADVISORS.reduce((s, a) => s + a.investors, 0),
  };
}

/* -------------------------------------------------------------------------
   Conventions — regroupement par étape
   ------------------------------------------------------------------------- */

export interface ConventionBucket {
  stage: ConventionStage;
  label: string;
  items: Convention[];
}

/** Conventions groupées par étape, dans l'ordre : à initier → en cours → signées. */
export function conventionsByStage(): ConventionBucket[] {
  const order: ConventionStage[] = ["a_faire", "en_cours", "signee"];
  return order.map((stage) => ({
    stage,
    label: CONVENTION_STAGE[stage].label,
    items: CONVENTIONS.filter((c) => c.stage === stage),
  }));
}

/* -------------------------------------------------------------------------
   Base clients — segmentation Prospect / Client / Prêt à réinvestir
   ------------------------------------------------------------------------- */

/** Ligne client minimale lue depuis la base (RLS-scopée) pour la segmentation. */
export interface ClientSegmentInput {
  status: string;
  liquidity: string | null;
  patrimoine_financier: number | null;
}

export type ClientSegmentKey = "prospect" | "client" | "reinvest";

export interface ClientSegment {
  key: ClientSegmentKey;
  label: string;
  hint: string;
  count: number;
  patrimoine: number;
}

/**
 * Segmente la base clients en trois cohortes de pilotage commercial :
 *  - Prospects : clients en statut `prospect` (à convertir) ;
 *  - Clients : clients actifs ;
 *  - Prêts à réinvestir : sous-ensemble des actifs disposant d'une capacité de
 *    liquidité (`liquidity` forte ou moyenne) — cible de réinvestissement.
 * Les archivés sont exclus du pilotage. La cohorte « réinvestir » recoupe les
 * clients (elle en est un sous-ensemble) et n'est donc pas additionnée au total.
 */
export function segmentClients(rows: ClientSegmentInput[]): {
  segments: ClientSegment[];
  totalClients: number;
  totalPatrimoine: number;
} {
  const prospects = rows.filter((r) => r.status === "prospect");
  const clients = rows.filter((r) => r.status === "actif");
  const reinvest = clients.filter(
    (r) => r.liquidity === "forte" || r.liquidity === "moyenne",
  );

  const sumPatrimoine = (list: ClientSegmentInput[]) =>
    list.reduce((s, r) => s + Number(r.patrimoine_financier ?? 0), 0);

  const segments: ClientSegment[] = [
    {
      key: "prospect",
      label: "Prospects",
      hint: "à qualifier & convertir",
      count: prospects.length,
      patrimoine: sumPatrimoine(prospects),
    },
    {
      key: "client",
      label: "Clients",
      hint: "souscripteurs actifs",
      count: clients.length,
      patrimoine: sumPatrimoine(clients),
    },
    {
      key: "reinvest",
      label: "Prêts à réinvestir",
      hint: "capacité de liquidité disponible",
      count: reinvest.length,
      patrimoine: sumPatrimoine(reinvest),
    },
  ];

  return {
    segments,
    totalClients: prospects.length + clients.length,
    totalPatrimoine: sumPatrimoine(clients),
  };
}

/** Collecte totale du cabinet (engagements cumulés des souscriptions). */
export function totalCollection(): number {
  return subscriptionTotals(SUBSCRIPTIONS).commitment;
}
