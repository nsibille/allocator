import type { Fund, PacingProfile, StrategyBucket } from "@/types/domain";
import {
  BUCKET_LABEL,
  PACING_LABEL,
  formatEuro,
  formatMultiple,
  formatPercent,
} from "@/lib/funds";

/* =========================================================================
   Catalogue commercial — pont entre la gamme réelle (table `funds`) et la
   promotion : dérive une fiche commerciale par fonds, et porte les gammes
   « nouveaux fonds » (en préparation) et « fonds archivés » (clôturés), qui
   n'existent pas en base et sont fictives pour la démonstration.
   Aucune couleur en dur : les visuels utilisent `FundCover` (tokens CSS).
   ========================================================================= */

/** Tonalité visuelle d'un fonds (pilote le dégradé de `FundCover`). */
export type CoverTone = "cool" | "warm" | "soon" | "closed";

/** Déduit la tonalité d'illustration d'un fonds de la gamme (poche + pacing). */
export function toneForFund(bucket: StrategyBucket, pacing: PacingProfile): CoverTone {
  if (bucket === "croissance" || bucket === "satellite") return "warm";
  if (pacing === "growth" || pacing === "innovation") return "warm";
  return "cool";
}

/**
 * Mot-clé d'un intitulé mis en Saol italic (signature de marque, 1 mot).
 * On italicise le premier terme « porteur » trouvé dans le nom du fonds.
 */
const ACCENT_KEYWORDS = [
  "Innovation",
  "Semiconductor",
  "Decarbonization",
  "Transition",
  "Growth",
  "Buyout",
  "Secondary",
  "Secondaire",
  "Credit",
  "Yield",
  "Wealth",
  "Infrastructure",
  "Stakes",
  "Nova",
  "Opportunities",
  "Life",
  "Climate",
];

export function accentWordFor(name: string): string | undefined {
  return ACCENT_KEYWORDS.find((k) => name.includes(k));
}

/* -------------------------------------------------------------------------
   Statut de souscription d'un fonds de la gamme réelle
   ------------------------------------------------------------------------- */

export type FundOpenStatus = "open" | "continuous";

/** Un fonds actif est « ouvert à la souscription » (date de clôture à venir ou continue). */
export function openStatus(fund: Fund): FundOpenStatus {
  return fund.closing_date ? "open" : "continuous";
}

/* -------------------------------------------------------------------------
   Fiche commerciale dérivée d'un fonds réel
   ------------------------------------------------------------------------- */

export interface FundCommercial {
  /** Accroche courte (peut porter un mot Saol italic via `accentWordFor`). */
  tagline: string;
  /** Paragraphe de présentation. */
  pitch: string;
  /** Points clés (DealFlow / portefeuille / géographies…). */
  highlights: { label: string; value: string }[];
  /** Axes de la stratégie d'investissement (puces). */
  strategy: string[];
  /** Zones géographiques ciblées. */
  geographies: string;
}

/**
 * Accroches et pitchs éditorialisés par slug (fallback générique sinon).
 * Signature Private Corner : chaque véhicule est un **feeder (fonds de fonds)**
 * donnant accès, dès 100 000 €, à des stratégies de gérants institutionnels de
 * premier rang dont les tickets directs dépassent plusieurs millions d'euros.
 * `positioning` reprend le positionnement commercial officiel (Satellite / Cœur
 * de portefeuille), distinct de la poche interne d'allocation (`fund.bucket`).
 */
const COMMERCIAL_COPY: Record<
  string,
  {
    tagline: string;
    pitch: string;
    strategy: string[];
    geographies: string;
    positioning: string;
    sector: string;
  }
> = {
  "merieux-innovation-ii": {
    tagline: "Le feeder santé d'un spécialiste européen",
    pitch:
      "PC Feeder Mérieux Innovation II est un fonds nourricier (feeder) donnant accès, dès 100 000 €, à la stratégie santé de Mérieux Equity Partners — un ticket institutionnel habituellement hors de portée des investisseurs privés. Le fonds accompagne des sociétés matures de la santé (hors biotechs) en Europe. Une poche satellite à forte conviction.",
    strategy: [
      "Feeder d'accès à la stratégie santé de Mérieux Equity Partners",
      "Sociétés matures de la santé, hors biotechs",
      "Accélération et transmission de champions européens",
      "Poche satellite à forte conviction",
    ],
    geographies: "Europe",
    positioning: "Satellite",
    sector: "Santé (hors biotechs)",
  },
  "pc-european-semiconductor": {
    tagline: "La souveraineté des semi-conducteurs, gérée par Ardian",
    pitch:
      "Private Corner Wealth European Semiconductor est un feeder donnant accès, dès 100 000 €, à un buyout d'Ardian sur la chaîne de valeur des semi-conducteurs. Un secteur stratégique porté par la souveraineté technologique, adressé sur trois continents via un seul véhicule.",
    strategy: [
      "Feeder d'accès à un buyout Ardian sur les semi-conducteurs",
      "Thèse de souveraineté et de relocalisation industrielle",
      "Sociétés matures de la filière (conception, équipement, matériaux)",
      "Création de valeur opérationnelle et build-up",
    ],
    geographies: "Europe, Amérique du Nord & Asie",
    positioning: "Satellite",
    sector: "Semi-conducteurs",
  },
  "pc-credit-yield": {
    tagline: "Un revenu contractuel, une brique cœur défensive",
    pitch:
      "Private Corner Credit Yield est un fonds de fonds de dette privée donnant accès, dès 100 000 €, aux stratégies de CVC et General Atlantic. Financement direct de sociétés de qualité, revenus contractuels récurrents et faible corrélation aux marchés cotés : la brique cœur de portefeuille d'une allocation non cotée.",
    strategy: [
      "Fonds de fonds de dette privée (CVC & General Atlantic)",
      "Financement direct de sociétés de qualité (senior / unitranche)",
      "Revenus contractuels et distributions régulières",
      "Faible corrélation aux marchés actions",
    ],
    geographies: "Europe & États-Unis",
    positioning: "Cœur de portefeuille",
    sector: "Multisectoriel",
  },
  "pc-buyout-eqt": {
    tagline: "La discipline industrielle d'EQT, en feeder",
    pitch:
      "Private Corner Buyout EQT Strategy est un feeder donnant accès, dès 100 000 €, à la stratégie phare d'EQT : le rachat de sociétés de croissance de qualité, transformées par une approche industrielle et digitale, dans la santé, la technologie et les services.",
    strategy: [
      "Feeder d'accès à la stratégie buyout d'EQT",
      "Sociétés leaders : santé, technologie, services",
      "Création de valeur opérationnelle et digitale",
      "Discipline de valorisation à l'entrée",
    ],
    geographies: "Europe, États-Unis & Asie",
    positioning: "Satellite",
    sector: "Santé, Technologie, Services",
  },
  "pc-keensight-nova-vii": {
    tagline: "Le growth buyout européen, en feeder",
    pitch:
      "Le PC Feeder Keensight Nova VII donne accès, dès 100 000 €, à la stratégie de Keensight Capital : des PME et ETI d'Europe de l'Ouest rentables et en forte croissance, dans la technologie et la santé, sans effet de levier excessif.",
    strategy: [
      "Feeder d'accès à la stratégie Keensight Nova VII",
      "Growth buyout de sociétés rentables et en croissance",
      "Technologie et santé principalement",
      "Effet de levier modéré, création de valeur par la croissance",
    ],
    geographies: "Europe de l'Ouest",
    positioning: "Satellite",
    sector: "Technologie & Santé",
  },
  "tikehau-decarbonization-ii": {
    tagline: "Financer la décarbonation, en feeder",
    pitch:
      "Le feeder Tikehau Decarbonization Fund II donne accès, dès 100 000 €, à la stratégie de décarbonation de Tikehau Capital : des sociétés qui accélèrent la transition bas carbone, avec une thèse d'impact mesurable, en Europe et Amérique du Nord.",
    strategy: [
      "Feeder d'accès au Tikehau Decarbonization Fund II",
      "Growth buyout sur les acteurs de la décarbonation",
      "Efficacité énergétique, mobilité bas carbone, énergies propres",
      "Thèse d'impact mesurable",
    ],
    geographies: "Europe & Amérique du Nord",
    positioning: "Satellite",
    sector: "Multisectoriel",
  },
  "blue-owl-gp-stakes": {
    tagline: "Investir dans les gérants, pas seulement dans leurs fonds",
    pitch:
      "Blue Owl GP Stakes Strategy est un fonds de fonds donnant accès, dès 100 000 €, à des participations minoritaires au capital de sociétés de gestion alternatives établies dans le monde entier. Des revenus récurrents et diversifiés, décorrélés du cycle d'un fonds unique : une brique cœur de portefeuille.",
    strategy: [
      "Fonds de fonds prenant des participations au capital de gérants",
      "Revenus récurrents (management fees) et upside (carried)",
      "Diversification sur des dizaines de fonds sous-jacents",
      "Profil de rendement défensif et récurrent",
    ],
    geographies: "Mondiale",
    positioning: "Cœur de portefeuille",
    sector: "Capital investissement",
  },
  "pc-secondary-2026": {
    tagline: "Le non coté, sans la courbe en J",
    pitch:
      "Private Corner Secondary Fund 2026 est un fonds de fonds secondaire donnant accès, dès 100 000 €, à la stratégie de Committed Advisors : l'acquisition, avec décote, de parts de fonds existants (États-Unis & Europe). Une entrée en portefeuille diversifiée et plus rapidement génératrice de liquidités.",
    strategy: [
      "Fonds de fonds secondaire (Committed Advisors)",
      "Acquisition de parts de fonds matures avec décote",
      "Diversification par millésimes et par gérants",
      "Atténuation de la courbe en J, retour de liquidités précoce",
    ],
    geographies: "États-Unis & Europe",
    positioning: "Cœur de portefeuille",
    sector: "Multisectoriel",
  },
  "european-midmarket-opportunities": {
    tagline: "Le mid-market européen, multi-gérants",
    pitch:
      "European MidMarket Opportunities est un fonds de fonds donnant accès, dès 100 000 €, aux meilleures signatures du buyout mid-market européen — PAI Partners, Keensight Capital, Eurazeo et General Atlantic — réunies dans un seul véhicule diversifié. Une brique cœur de portefeuille clé en main.",
    strategy: [
      "Fonds de fonds multi-gérants du mid-market européen",
      "PAI Partners, Keensight Capital, Eurazeo, General Atlantic",
      "Diversification multi-secteurs et multi-millésimes",
      "Cœur de portefeuille non coté",
    ],
    geographies: "Europe",
    positioning: "Cœur de portefeuille",
    sector: "Multisectoriel",
  },
  "pc-wealth-buyout-2026": {
    tagline: "Un millésime buyout Ardian, clé en main",
    pitch:
      "Private Corner Wealth Buyout 2026 est un fonds de fonds géré par Ardian donnant accès, dès 100 000 €, à un programme de buyout diversifié sur des sociétés matures, en Europe et Amérique du Nord. Simplicité, diversification et discipline.",
    strategy: [
      "Fonds de fonds buyout diversifié (Ardian)",
      "Sociétés matures, multi-secteurs",
      "Diversification par secteurs et par zones",
      "Sélection et suivi délégués à un gérant de référence",
    ],
    geographies: "Europe & Amérique du Nord",
    positioning: "Satellite",
    sector: "Multisectoriel",
  },
  "us-midcap-buyout": {
    tagline: "Le mid-cap américain, en sélection de gérants",
    pitch:
      "US MidCap Buyout Strategies est un fonds de fonds donnant accès, dès 100 000 €, au segment le plus profond du private equity mondial — le mid-market américain — via une sélection de gérants opérée par Neuberger.",
    strategy: [
      "Fonds de fonds multi-gérants (sélection Neuberger)",
      "Buyout mid-cap aux États-Unis",
      "Diversification sectorielle et géographique",
      "Exposition au dollar et au marché US",
    ],
    geographies: "États-Unis",
    positioning: "Satellite",
    sector: "Multisectoriel",
  },
  "meridiam-global-infrastructure": {
    tagline: "Des actifs réels, des flux prévisibles",
    pitch:
      "Meridiam Global Infrastructure Strategies est un fonds de fonds d'infrastructure core / core+ donnant accès, dès 100 000 €, à la stratégie de Meridiam : des actifs essentiels de long terme (mobilité, solutions bas carbone, services publics). Une poche cœur défensive, en souscription continue.",
    strategy: [
      "Fonds de fonds d'infrastructure core / core+ (Meridiam)",
      "Actifs essentiels : mobilité, bas carbone, services publics",
      "Flux de revenus prévisibles et indexés",
      "Faible corrélation, profil défensif de long terme",
    ],
    geographies: "Europe & reste du monde",
    positioning: "Cœur de portefeuille",
    sector: "Infrastructure essentielle",
  },
};

/** Compose la fiche commerciale complète d'un fonds de la gamme. */
export function buildCommercial(fund: Fund): FundCommercial {
  const copy = COMMERCIAL_COPY[fund.slug];
  const tagline = copy?.tagline ?? `${fund.strategy} — géré par ${fund.manager}`;
  const pitch =
    copy?.pitch ??
    `${fund.name} est une stratégie ${PACING_LABEL[fund.pacing].toLowerCase()} de la poche ${BUCKET_LABEL[fund.bucket].toLowerCase()}, gérée par ${fund.manager}.`;
  const geographies = copy?.geographies ?? "International";
  const strategy = copy?.strategy ?? [
    `${PACING_LABEL[fund.pacing]} — ${fund.strategy}`,
    `Poche ${BUCKET_LABEL[fund.bucket]} de l'allocation`,
    `Gérant : ${fund.manager}`,
  ];

  const highlights: FundCommercial["highlights"] = [
    { label: "Classe d'actif", value: assetClassFor(fund.pacing) },
    { label: "Stratégie", value: fund.strategy },
    { label: "Gérant", value: fund.manager },
    { label: "Structure", value: "Feeder — fonds de fonds" },
    { label: "Positionnement", value: copy?.positioning ?? BUCKET_LABEL[fund.bucket] },
    { label: "Secteur", value: copy?.sector ?? fund.strategy },
    { label: "Géographies", value: geographies },
    { label: "Objectif de multiple", value: `${formatMultiple(fund.target_multiple)} brut` },
    { label: "TRI brut cible", value: formatPercent(fund.target_gross_irr) },
    { label: "Ticket minimum", value: formatEuro(fund.min_ticket) },
    { label: "Clôture", value: fund.closing_label },
  ];

  return { tagline, pitch, highlights, strategy, geographies };
}

/* -------------------------------------------------------------------------
   Repères factuels officiels (source privatecorner.eu/fonds)
   ------------------------------------------------------------------------- */

/** Classe d'actif affichée en badge sur la source, dérivée du pacing. */
export type AssetClass =
  | "Private Equity"
  | "Secondaire"
  | "Dette privée"
  | "Infrastructure";

/** Ordre des sections par classe d'actif (identique à la source). */
export const ASSET_CLASS_ORDER: AssetClass[] = [
  "Private Equity",
  "Secondaire",
  "Dette privée",
  "Infrastructure",
];

/** Déduit la classe d'actif d'un fonds de son profil de pacing. */
export function assetClassFor(pacing: PacingProfile): AssetClass {
  if (pacing === "credit") return "Dette privée";
  if (pacing === "infra") return "Infrastructure";
  if (pacing === "secondary") return "Secondaire";
  return "Private Equity";
}

/** Repères factuels officiels d'un fonds (classe, positionnement, secteur, géo). */
export interface FundFacts {
  assetClass: AssetClass;
  positioning: string;
  sector: string;
  geography: string;
}

/** Extrait les repères factuels d'un fonds (source de vérité : COMMERCIAL_COPY). */
export function fundFacts(fund: Fund): FundFacts {
  const copy = COMMERCIAL_COPY[fund.slug];
  return {
    assetClass: assetClassFor(fund.pacing),
    positioning: copy?.positioning ?? BUCKET_LABEL[fund.bucket],
    sector: copy?.sector ?? fund.strategy,
    geography: copy?.geographies ?? "International",
  };
}

/** Documents de la salle de données (démonstration — non téléchargeables). */
export const FUND_DOCUMENTS: { label: string; kind: string }[] = [
  { label: "Document d'information clé (DIC)", kind: "PDF" },
  { label: "Prospectus / Règlement du fonds", kind: "PDF" },
  { label: "Présentation investisseurs", kind: "PDF" },
  { label: "Politique de durabilité (SFDR)", kind: "PDF" },
  { label: "Dernier reporting trimestriel", kind: "PDF" },
  { label: "Bulletin de souscription type", kind: "PDF" },
];

/* -------------------------------------------------------------------------
   Nouveaux fonds (en préparation) — gamme fictive de démonstration
   ------------------------------------------------------------------------- */

export interface NewFund {
  slug: string;
  name: string;
  accentWord?: string;
  manager: string;
  strategy: string;
  tone: CoverTone;
  seed: string;
  tagline: string;
  pitch: string;
  expectedClosing: string;
  targetMultiple: number;
  targetIrr: number;
  minTicket: number;
  geographies: string;
  strategyPoints: string[];
}

export const NEW_FUNDS: NewFund[] = [
  {
    slug: "pc-climate-transition-iv",
    name: "Private Corner Climate Transition IV",
    accentWord: "Climate",
    manager: "Ardian Sustainable",
    strategy: "Growth équity — transition climatique",
    tone: "soon",
    seed: "climate-iv",
    tagline: "La prochaine génération d'infrastructures bas carbone",
    pitch:
      "Un programme growth dédié aux sociétés qui décarbonent l'industrie, la mobilité et le bâtiment. Classification SFDR article 9 visée, avec des objectifs d'impact mesurables. Ouverture des souscriptions prévue au T4 2026.",
    expectedClosing: "Ouverture T4 2026",
    targetMultiple: 2.3,
    targetIrr: 0.19,
    minTicket: 100000,
    geographies: "Europe & Amérique du Nord",
    strategyPoints: [
      "Growth équity sur la transition climatique",
      "Objectif de classification SFDR article 9",
      "Impact mesurable et reporting extra-financier",
      "Co-investissement institutionnel",
    ],
  },
  {
    slug: "pc-andera-life-sciences",
    name: "PC Feeder Andera Life Sciences",
    accentWord: "Life",
    manager: "Andera Partners",
    strategy: "Innovation santé — sciences de la vie",
    tone: "soon",
    seed: "andera-ls",
    tagline: "Le capital innovation au service de la santé",
    pitch:
      "Feeder d'accès à la stratégie sciences de la vie d'Andera Partners : biotech, medtech et santé numérique en phase d'accélération. Une poche satellite à fort potentiel, en cours de conventionnement.",
    expectedClosing: "Ouverture T1 2027",
    targetMultiple: 2.7,
    targetIrr: 0.23,
    minTicket: 100000,
    geographies: "Europe",
    strategyPoints: [
      "Capital innovation en sciences de la vie",
      "Biotech, medtech, diagnostic, santé numérique",
      "Sélection resserrée à forte conviction",
      "Exposition satellite dynamisante",
    ],
  },
  {
    slug: "pc-private-debt-europe-ii",
    name: "Private Corner Private Debt Europe II",
    accentWord: "Debt",
    manager: "Tikehau Capital",
    strategy: "Dette privée européenne senior",
    tone: "soon",
    seed: "debt-eu-ii",
    tagline: "Un rendement contractuel, un capital protégé",
    pitch:
      "Deuxième millésime de la stratégie de dette privée senior européenne. Revenus récurrents, séniorité et diversification sectorielle pour une brique défensive. Conventionnement distributeurs en cours.",
    expectedClosing: "Ouverture T2 2027",
    targetMultiple: 1.5,
    targetIrr: 0.1,
    minTicket: 100000,
    geographies: "Europe",
    strategyPoints: [
      "Dette senior et unitranche de sociétés de qualité",
      "Revenus contractuels et distributions régulières",
      "Séniorité et covenants protecteurs",
      "Faible corrélation aux marchés cotés",
    ],
  },
];

export function findNewFund(slug: string): NewFund | undefined {
  return NEW_FUNDS.find((f) => f.slug === slug);
}

/* -------------------------------------------------------------------------
   Fonds archivés (clôturés) — gamme fictive de démonstration
   ------------------------------------------------------------------------- */

export interface ArchivedFund {
  slug: string;
  name: string;
  accentWord?: string;
  manager: string;
  strategy: string;
  vintage: number;
  seed: string;
  /** Multiple total réalisé (TVPI). */
  realizedMultiple: number;
  /** Distributions réalisées (DPI). */
  dpi: number;
  /** TRI net réalisé. */
  netIrr: number;
  status: string;
}

export const ARCHIVED_FUNDS: ArchivedFund[] = [
  {
    slug: "pc-wealth-buyout-2021",
    name: "Private Corner Wealth Buyout 2021",
    accentWord: "Buyout",
    manager: "Ardian",
    strategy: "Buyout diversifié",
    vintage: 2021,
    seed: "wb-2021",
    realizedMultiple: 1.8,
    dpi: 0.9,
    netIrr: 0.16,
    status: "Clôturé",
  },
  {
    slug: "pc-eurazeo-growth-iii",
    name: "PC Feeder Eurazeo Growth III",
    accentWord: "Growth",
    manager: "Eurazeo",
    strategy: "Growth équity",
    vintage: 2020,
    seed: "eze-g3",
    realizedMultiple: 2.1,
    dpi: 1.3,
    netIrr: 0.19,
    status: "Clôturé",
  },
  {
    slug: "pc-secondary-2019",
    name: "Private Corner Secondary Fund 2019",
    accentWord: "Secondary",
    manager: "Committed Advisors",
    strategy: "Secondaire",
    vintage: 2019,
    seed: "sec-2019",
    realizedMultiple: 1.7,
    dpi: 1.5,
    netIrr: 0.14,
    status: "Clôturé",
  },
  {
    slug: "pc-infrastructure-transition-i",
    name: "PC Infrastructure Transition I",
    accentWord: "Infrastructure",
    manager: "Meridiam",
    strategy: "Infrastructure core",
    vintage: 2018,
    seed: "infra-t1",
    realizedMultiple: 1.9,
    dpi: 1.6,
    netIrr: 0.11,
    status: "Clôturé",
  },
];

export function findArchivedFund(slug: string): ArchivedFund | undefined {
  return ARCHIVED_FUNDS.find((f) => f.slug === slug);
}
