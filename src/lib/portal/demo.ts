/* =========================================================================
   Données de démonstration du back-office CGP (domaine de slugs `portal`).
   Fictives et statiques : ces écrans illustrent les vues de gestion du
   portail (conseillers, documents, souscriptions, rétrocessions, offres)
   sans dépendre de la base. Les investisseurs = les clients : ils sont gérés
   par la fonctionnalité réelle « clients » (RLS-scopée), pas ici. Aucune
   couleur en dur ;
   les statuts portent un ton (`active` = signal corail « en cours / abouti »,
   `neutral` = gris), jamais de vert/orange de statut (règle corail unique).
   ========================================================================= */

export type StatusTone = "active" | "neutral";

/** Un statut lisible + son ton visuel (mappé sur `ui-badge`). */
export interface PortalStatus {
  label: string;
  tone: StatusTone;
}

/* -------------------------------------------------------------------------
   Conseillers rattachés au cabinet (portal-advisors-table)
   ------------------------------------------------------------------------- */

export interface Advisor {
  id: string;
  name: string;
  email: string;
  role: string;
  investors: number;
  aum: number;
  lastLogin: string | null;
  status: PortalStatus;
}

export const ADVISORS: Advisor[] = [
  {
    id: "adv-1",
    name: "Camille Rousseau",
    email: "c.rousseau@cabinet-chevallier.fr",
    role: "Conseiller principal",
    investors: 24,
    aum: 18_400_000,
    lastLogin: "2026-07-06",
    status: { label: "Actif", tone: "active" },
  },
  {
    id: "adv-2",
    name: "Thomas Da Costa",
    email: "t.dacosta@cabinet-chevallier.fr",
    role: "Conseiller associé",
    investors: 17,
    aum: 11_950_000,
    lastLogin: "2026-07-05",
    status: { label: "Actif", tone: "active" },
  },
  {
    id: "adv-3",
    name: "Inès Bianchi",
    email: "i.bianchi@cabinet-chevallier.fr",
    role: "Conseillère",
    investors: 9,
    aum: 4_320_000,
    lastLogin: "2026-06-28",
    status: { label: "Actif", tone: "active" },
  },
  {
    id: "adv-4",
    name: "Marc Lévêque",
    email: "m.leveque@cabinet-chevallier.fr",
    role: "Conseiller",
    investors: 6,
    aum: 2_100_000,
    lastLogin: null,
    status: { label: "Invitation envoyée", tone: "neutral" },
  },
  {
    id: "adv-5",
    name: "Sophie Nardone",
    email: "s.nardone@cabinet-chevallier.fr",
    role: "Middle-office",
    investors: 0,
    aum: 0,
    lastLogin: "2026-05-14",
    status: { label: "Suspendu", tone: "neutral" },
  },
];

/* -------------------------------------------------------------------------
   Documents — arborescence par dossier (portal-documents-browser)
   ------------------------------------------------------------------------- */

export interface DocumentFile {
  id: string;
  name: string;
  kind: string;
  addedAt: string;
  size: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  documents: DocumentFile[];
}

export const DOCUMENT_FOLDERS: DocumentFolder[] = [
  {
    id: "fld-reporting",
    name: "Reporting",
    documents: [
      {
        id: "doc-1",
        name: "Reporting trimestriel T1 2026 — Gamme Private Corner",
        kind: "PDF",
        addedAt: "2026-04-12",
        size: "3,4 Mo",
      },
      {
        id: "doc-2",
        name: "Reporting trimestriel T4 2025 — Gamme Private Corner",
        kind: "PDF",
        addedAt: "2026-01-15",
        size: "3,1 Mo",
      },
    ],
  },
  {
    id: "fld-souscriptions",
    name: "Souscriptions",
    documents: [
      {
        id: "doc-3",
        name: "Bulletin de souscription — Marie Da Costa",
        kind: "PDF",
        addedAt: "2026-05-27",
        size: "612 Ko",
      },
      {
        id: "doc-4",
        name: "Bulletin de souscription — SCI Camussa",
        kind: "PDF",
        addedAt: "2026-05-28",
        size: "598 Ko",
      },
      {
        id: "doc-5",
        name: "Convention de distribution — Cabinet Chevallier",
        kind: "PDF",
        addedAt: "2026-01-09",
        size: "1,2 Mo",
      },
    ],
  },
  {
    id: "fld-legal",
    name: "Documentation juridique",
    documents: [
      {
        id: "doc-6",
        name: "Règlement — Private Corner Buyout EQT Strategy",
        kind: "PDF",
        addedAt: "2025-12-01",
        size: "2,8 Mo",
      },
      {
        id: "doc-7",
        name: "DIC — PC Feeder Keensight Nova VII",
        kind: "PDF",
        addedAt: "2025-11-20",
        size: "740 Ko",
      },
      {
        id: "doc-8",
        name: "Politique de durabilité (SFDR) — Gamme Private Corner",
        kind: "PDF",
        addedAt: "2025-10-04",
        size: "1,0 Mo",
      },
    ],
  },
];

/* -------------------------------------------------------------------------
   Souscriptions (portal-subscriptions-table)
   ------------------------------------------------------------------------- */

export interface Subscription {
  id: string;
  reference: string;
  fundName: string;
  shareClass: string;
  investor: string;
  date: string;
  amount: number;
  entryFee: number;
  called: number;
  distributed: number;
  nav: number;
  status: PortalStatus;
}

export const SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub-1",
    reference: "PC-2026-0148",
    fundName: "Private Corner Buyout EQT Strategy",
    shareClass: "A — 50 parts",
    investor: "Marie Da Costa",
    date: "2026-05-27",
    amount: 5_000_000,
    entryFee: 100_000,
    called: 1_500_000,
    distributed: 0,
    nav: 1_540_000,
    status: { label: "Validée", tone: "active" },
  },
  {
    id: "sub-2",
    reference: "PC-2026-0149",
    fundName: "Private Corner Wealth European Semiconductor",
    shareClass: "B — 20 parts",
    investor: "SCI Camussa",
    date: "2026-05-28",
    amount: 2_000_000,
    entryFee: 40_000,
    called: 600_000,
    distributed: 0,
    nav: 612_000,
    status: { label: "Validée", tone: "active" },
  },
  {
    id: "sub-3",
    reference: "PC-2026-0151",
    fundName: "PC Feeder Keensight Nova VII",
    shareClass: "A — 10 parts",
    investor: "Marie Da Costa",
    date: "2026-06-04",
    amount: 1_000_000,
    entryFee: 0,
    called: 0,
    distributed: 0,
    nav: 0,
    status: { label: "Souscription en cours", tone: "active" },
  },
  {
    id: "sub-4",
    reference: "PC-2026-0153",
    fundName: "Private Corner Credit Yield",
    shareClass: "C — 100 parts",
    investor: "Famille Delaunay",
    date: "2026-06-11",
    amount: 3_000_000,
    entryFee: 0,
    called: 900_000,
    distributed: 45_000,
    nav: 880_000,
    status: { label: "Validée", tone: "active" },
  },
  {
    id: "sub-5",
    reference: "PC-2026-0158",
    fundName: "Blue Owl GP Stakes Strategy",
    shareClass: "A — 12 parts",
    investor: "Holding Vasseur",
    date: "2026-06-19",
    amount: 1_200_000,
    entryFee: 24_000,
    called: 0,
    distributed: 0,
    nav: 0,
    status: { label: "Étude du dossier en cours", tone: "neutral" },
  },
  {
    id: "sub-6",
    reference: "PC-2026-0160",
    fundName: "PC Feeder Mérieux Innovation II",
    shareClass: "A — 5 parts",
    investor: "Famille Delaunay",
    date: "2026-06-24",
    amount: 500_000,
    entryFee: 12_500,
    called: 150_000,
    distributed: 0,
    nav: 156_000,
    status: { label: "Validée", tone: "active" },
  },
  {
    id: "sub-7",
    reference: "PC-2026-0162",
    fundName: "Private Corner Secondary Fund 2026",
    shareClass: "A — 30 parts",
    investor: "SCI Camussa",
    date: "2026-06-30",
    amount: 3_000_000,
    entryFee: 0,
    called: 1_200_000,
    distributed: 210_000,
    nav: 1_180_000,
    status: { label: "Validée", tone: "active" },
  },
  {
    id: "sub-8",
    reference: "PC-2026-0165",
    fundName: "Private Corner Wealth Buyout 2026",
    shareClass: "A — 8 parts",
    investor: "Holding Vasseur",
    date: "2026-07-02",
    amount: 800_000,
    entryFee: 16_000,
    called: 0,
    distributed: 0,
    nav: 0,
    status: { label: "Souscription en cours", tone: "active" },
  },
];

/** Agrégats de tête pour la page souscriptions (KPI strip). */
export function subscriptionTotals(rows: Subscription[]) {
  return rows.reduce(
    (acc, r) => ({
      commitment: acc.commitment + r.amount,
      called: acc.called + r.called,
      distributed: acc.distributed + r.distributed,
      nav: acc.nav + r.nav,
    }),
    { commitment: 0, called: 0, distributed: 0, nav: 0 },
  );
}

/* -------------------------------------------------------------------------
   Rétrocessions (portal-retrocessions-table)
   ------------------------------------------------------------------------- */

export interface Retrocession {
  id: string;
  reference: string;
  type: string;
  date: string;
  fundName: string;
  status: PortalStatus;
  paymentDate: string | null;
  amount: number;
  subscriptions: number;
}

export const RETROCESSIONS: Retrocession[] = [
  {
    id: "retro-1",
    reference: "RET-2026-004",
    type: "Droits d'entrée",
    date: "2026-06-30",
    fundName: "Private Corner Buyout EQT Strategy",
    status: { label: "À facturer", tone: "neutral" },
    paymentDate: null,
    amount: 100_000,
    subscriptions: 1,
  },
  {
    id: "retro-2",
    reference: "RET-2026-003",
    type: "Droits d'entrée",
    date: "2026-06-30",
    fundName: "Private Corner Wealth European Semiconductor",
    status: { label: "Facturé — en cours de traitement", tone: "active" },
    paymentDate: null,
    amount: 40_000,
    subscriptions: 1,
  },
  {
    id: "retro-3",
    reference: "RET-2026-002",
    type: "Frais de gestion",
    date: "2026-03-31",
    fundName: "Private Corner Credit Yield",
    status: { label: "Payée", tone: "active" },
    paymentDate: "2026-04-15",
    amount: 22_500,
    subscriptions: 2,
  },
  {
    id: "retro-4",
    reference: "RET-2026-001",
    type: "Droits d'entrée",
    date: "2026-02-28",
    fundName: "PC Feeder Mérieux Innovation II",
    status: { label: "Payée", tone: "active" },
    paymentDate: "2026-03-12",
    amount: 12_500,
    subscriptions: 1,
  },
];

/** Total des rétrocessions déjà réglées. */
export function retrocessionsPaid(rows: Retrocession[]): number {
  return rows
    .filter((r) => r.paymentDate != null)
    .reduce((s, r) => s + r.amount, 0);
}

/* -------------------------------------------------------------------------
   Offres de distribution (portal-offers-table)
   ------------------------------------------------------------------------- */

export interface OfferShare {
  code: string;
  minInvestment: number;
  nav: number;
  navDate: string | null;
  entryFee: number;
  status: PortalStatus;
}

export interface Offer {
  id: string;
  fundName: string;
  period: string;
  shares: OfferShare[];
}

export const OFFERS: Offer[] = [
  {
    id: "off-1",
    fundName: "Private Corner Buyout EQT Strategy",
    period: "Du 01/09/2024 au 31/12/2026",
    shares: [
      {
        code: "A — FR0014001001",
        minInvestment: 100_000,
        nav: 105,
        navDate: "2026-03-31",
        entryFee: 0.02,
        status: { label: "Validée", tone: "active" },
      },
      {
        code: "B — FR0014001019",
        minInvestment: 250_000,
        nav: 0,
        navDate: null,
        entryFee: 0.01,
        status: { label: "Validée", tone: "active" },
      },
    ],
  },
  {
    id: "off-2",
    fundName: "PC Feeder Keensight Nova VII",
    period: "Du 01/08/2025 au 31/12/2026",
    shares: [
      {
        code: "A — FR0014002025",
        minInvestment: 100_000,
        nav: 0,
        navDate: null,
        entryFee: 0.015,
        status: { label: "Validée", tone: "active" },
      },
      {
        code: "C — FR0014002033",
        minInvestment: 1_000_000,
        nav: 0,
        navDate: null,
        entryFee: 0,
        status: { label: "En cours de validation", tone: "neutral" },
      },
    ],
  },
  {
    id: "off-3",
    fundName: "Private Corner Secondary Fund 2026",
    period: "Du 01/01/2026 au 30/06/2027",
    shares: [
      {
        code: "A — FR0014003041",
        minInvestment: 100_000,
        nav: 102,
        navDate: "2026-03-31",
        entryFee: 0,
        status: { label: "Validée", tone: "active" },
      },
    ],
  },
];

/* -------------------------------------------------------------------------
   Conventions de distribution (portal-conventions-list)
   Accords cabinet ↔ société de gestion : signées, en cours de signature ou à
   initier. Le corail signale ce qui appelle une action (« à faire ») ; le
   neutre marque l'acquis (« signée »). Données de démonstration.
   ------------------------------------------------------------------------- */

export type ConventionStage = "signee" | "en_cours" | "a_faire";

export interface Convention {
  id: string;
  partner: string;
  scope: string;
  stage: ConventionStage;
  /** Date de signature (si signée) ou d'initiation de la démarche. */
  date: string | null;
  /** Nombre de fonds ouverts à la distribution via cette convention. */
  funds: number;
}

export const CONVENTIONS: Convention[] = [
  {
    id: "conv-ardian",
    partner: "Ardian",
    scope: "Semiconductor · Wealth Buyout 2026",
    stage: "signee",
    date: "2024-09-01",
    funds: 2,
  },
  {
    id: "conv-eqt",
    partner: "EQT",
    scope: "Buyout EQT Strategy",
    stage: "signee",
    date: "2024-09-01",
    funds: 1,
  },
  {
    id: "conv-committed",
    partner: "Committed Advisors",
    scope: "Secondary Fund 2026",
    stage: "signee",
    date: "2025-11-18",
    funds: 1,
  },
  {
    id: "conv-keensight",
    partner: "Keensight Capital",
    scope: "Feeder Keensight Nova VII",
    stage: "signee",
    date: "2025-07-30",
    funds: 1,
  },
  {
    id: "conv-blueowl",
    partner: "Blue Owl Capital",
    scope: "GP Stakes Strategy",
    stage: "en_cours",
    date: "2026-06-12",
    funds: 1,
  },
  {
    id: "conv-meridiam",
    partner: "Meridiam",
    scope: "Global Infrastructure Strategies",
    stage: "en_cours",
    date: "2026-06-24",
    funds: 1,
  },
  {
    id: "conv-tikehau",
    partner: "Tikehau Capital",
    scope: "Decarbonization II · Private Debt Europe II",
    stage: "a_faire",
    date: null,
    funds: 2,
  },
  {
    id: "conv-andera",
    partner: "Andera Partners",
    scope: "Feeder Andera Life Sciences",
    stage: "a_faire",
    date: null,
    funds: 1,
  },
];

/** Libellé + ton d'une étape de convention (corail = action attendue). */
export const CONVENTION_STAGE: Record<ConventionStage, PortalStatus> = {
  signee: { label: "Signée", tone: "neutral" },
  en_cours: { label: "En cours de signature", tone: "active" },
  a_faire: { label: "À initier", tone: "active" },
};

/* -------------------------------------------------------------------------
   Cadence de collecte — poids mensuels sur 12 mois glissants (Août 25 → Juil. 26).
   La courbe cumulée est mise à l'échelle sur la collecte réelle (engagements des
   souscriptions), de sorte que le point terminal = collecte totale (cohérence).
   ------------------------------------------------------------------------- */

export interface CollectionMonth {
  /** Libellé court du mois (ex. « Août »). */
  label: string;
  /** Poids relatif de la collecte du mois (non normalisé). */
  weight: number;
}

export const COLLECTION_CADENCE: CollectionMonth[] = [
  { label: "Août", weight: 0.4 },
  { label: "Sept.", weight: 0.8 },
  { label: "Oct.", weight: 1.1 },
  { label: "Nov.", weight: 1.3 },
  { label: "Déc.", weight: 2.2 },
  { label: "Janv.", weight: 1.0 },
  { label: "Févr.", weight: 0.9 },
  { label: "Mars", weight: 1.5 },
  { label: "Avr.", weight: 1.2 },
  { label: "Mai", weight: 1.7 },
  { label: "Juin", weight: 2.0 },
  { label: "Juil.", weight: 1.4 },
];
