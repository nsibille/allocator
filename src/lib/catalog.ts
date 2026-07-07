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

/** Accroches et pitchs éditorialisés par slug (fallback générique sinon). */
const COMMERCIAL_COPY: Record<
  string,
  { tagline: string; pitch: string; strategy: string[]; geographies: string }
> = {
  "merieux-innovation-ii": {
    tagline: "Accompagner les champions de la santé de demain",
    pitch:
      "Le feeder Mérieux Innovation II donne accès à un portefeuille de sociétés innovantes des sciences de la vie et de la santé numérique, aux côtés d'un gérant de référence du secteur. Une exposition satellite à fort potentiel, pensée pour dynamiser une allocation déjà diversifiée.",
    strategy: [
      "Capital innovation et accélération de sociétés en forte croissance",
      "Secteurs : biotech, medtech, diagnostic, santé numérique",
      "Co-investissement aux côtés d'entrepreneurs et de fonds spécialisés",
      "Sélection resserrée pour un couple rendement / conviction élevé",
    ],
    geographies: "Europe & Amérique du Nord",
  },
  "pc-european-semiconductor": {
    tagline: "Le cœur industriel du continent européen",
    pitch:
      "Private Corner Wealth European Semiconductor cible les leaders européens de la chaîne de valeur des semi-conducteurs, un secteur stratégique porté par la souveraineté technologique. Une brique cœur de portefeuille, gérée par Ardian.",
    strategy: [
      "Buyout de sociétés matures de la filière semi-conducteurs",
      "Thèse de souveraineté et de relocalisation industrielle",
      "Création de valeur opérationnelle et build-up",
      "Diversification sectorielle au sein de la poche cœur",
    ],
    geographies: "Europe (100 %)",
  },
  "pc-credit-yield": {
    tagline: "Un rendement régulier, une volatilité maîtrisée",
    pitch:
      "Private Corner Credit Yield est une stratégie de dette privée défensive, conçue pour générer un rendement contractuel récurrent avec une faible corrélation aux marchés cotés. La brique de stabilité d'une allocation non cotée.",
    strategy: [
      "Financement en dette senior et unitranche de sociétés de qualité",
      "Revenus contractuels et distributions régulières",
      "Séniorité et covenants protecteurs du capital",
      "Faible corrélation aux marchés actions",
    ],
    geographies: "Europe & Amérique du Nord",
  },
  "pc-buyout-eqt": {
    tagline: "La discipline opérationnelle d'un leader mondial",
    pitch:
      "Private Corner Buyout EQT Strategy offre un accès à la stratégie phare d'EQT : le rachat de sociétés de croissance de qualité, transformées par une approche industrielle et digitale. Un pilier cœur de portefeuille.",
    strategy: [
      "Buyout de sociétés leaders sur des marchés porteurs",
      "Création de valeur opérationnelle et digitale",
      "Approche thématique (santé, technologie, transition)",
      "Discipline de valorisation à l'entrée",
    ],
    geographies: "Europe & Amérique du Nord",
  },
  "pc-keensight-nova-vii": {
    tagline: "Le growth buyout européen dans sa meilleure expression",
    pitch:
      "Le feeder Keensight Nova VII investit dans des PME et ETI européennes rentables et en forte croissance, sans effet de levier excessif. Une poche croissance au track record éprouvé.",
    strategy: [
      "Growth buyout de sociétés rentables et en croissance",
      "Sociétés du numérique et de la santé principalement",
      "Accompagnement d'entrepreneurs sur des trajectoires d'hyper-croissance",
      "Effet de levier modéré, création de valeur par la croissance",
    ],
    geographies: "Europe (majoritaire)",
  },
  "tikehau-decarbonization-ii": {
    tagline: "Financer la transition, capter la croissance",
    pitch:
      "Le feeder Tikehau Decarbonization Fund II investit dans les sociétés qui accélèrent la décarbonation de l'économie. Une thèse d'impact alignée sur une classification ESG exigeante, sans renoncer à la performance.",
    strategy: [
      "Growth buyout sur les acteurs de la décarbonation",
      "Thèse d'impact mesurable (article SFDR renforcé)",
      "Efficacité énergétique, mobilité bas carbone, énergies propres",
      "Alignement rendement financier / impact climatique",
    ],
    geographies: "Europe & Amérique du Nord",
  },
  "blue-owl-gp-stakes": {
    tagline: "Investir dans les gérants, pas seulement dans leurs fonds",
    pitch:
      "Blue Owl GP Stakes Strategy prend des participations minoritaires au capital de sociétés de gestion alternatives établies. Un profil de revenus récurrents et diversifiés, décorrélé du cycle d'un fonds unique.",
    strategy: [
      "Participations minoritaires au capital de gérants alternatifs",
      "Revenus récurrents (management fees) et upside (carried)",
      "Diversification sur des dizaines de fonds sous-jacents",
      "Profil de rendement défensif et récurrent",
    ],
    geographies: "Amérique du Nord & Europe",
  },
  "pc-secondary-2026": {
    tagline: "Le non coté, sans la courbe en J",
    pitch:
      "Private Corner Secondary Fund 2026 acquiert des parts de fonds existants sur le marché secondaire, avec une décote et une visibilité accrue sur les actifs sous-jacents. Une entrée en portefeuille plus rapidement génératrice de liquidités.",
    strategy: [
      "Acquisition de parts de fonds matures sur le secondaire",
      "Décote à l'entrée et atténuation de la courbe en J",
      "Diversification par millésimes et par gérants",
      "Retour de liquidités plus précoce",
    ],
    geographies: "International",
  },
  "european-midmarket-opportunities": {
    tagline: "Le mid-market européen, accessible dès 25 000 €",
    pitch:
      "European MidMarket Opportunities agrège les meilleures signatures du buyout mid-market européen dans un véhicule accessible. Un ticket d'entrée abaissé pour démocratiser une classe d'actif institutionnelle.",
    strategy: [
      "Buyout mid-market via une sélection de gérants de premier plan",
      "Diversification multi-gérants et multi-secteurs",
      "Ticket d'entrée abaissé à 25 000 €",
      "Cœur de portefeuille non coté",
    ],
    geographies: "Europe",
  },
  "pc-wealth-buyout-2026": {
    tagline: "Un millésime buyout clé en main",
    pitch:
      "Private Corner Wealth Buyout 2026 est un programme de buyout diversifié géré par Ardian, pensé comme la brique cœur d'une première allocation au non coté. Simplicité, diversification et discipline.",
    strategy: [
      "Buyout diversifié sur des sociétés matures",
      "Sélection et suivi délégués à un gérant de référence",
      "Diversification par secteurs et par zones",
      "Brique cœur d'une allocation non cotée",
    ],
    geographies: "Europe & Amérique du Nord",
  },
  "us-midcap-buyout": {
    tagline: "La profondeur du marché américain",
    pitch:
      "US MidCap Buyout Strategies expose le portefeuille au segment le plus profond du private equity mondial : le mid-market américain, via une sélection de gérants opérée par Neuberger.",
    strategy: [
      "Buyout mid-cap aux États-Unis",
      "Sélection multi-gérants par Neuberger",
      "Diversification sectorielle et géographique",
      "Exposition au dollar et au marché US",
    ],
    geographies: "États-Unis",
  },
  "meridiam-global-infrastructure": {
    tagline: "Des actifs réels, des flux prévisibles",
    pitch:
      "Meridiam Global Infrastructure Strategies investit dans des infrastructures essentielles de long terme (mobilité, énergie, services publics). Une poche défensive à faible corrélation, en souscription continue.",
    strategy: [
      "Infrastructure core / core+ de long terme",
      "Actifs essentiels : mobilité, énergie, services publics",
      "Flux de revenus prévisibles et indexés",
      "Faible corrélation, profil défensif",
    ],
    geographies: "International",
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
    { label: "Stratégie", value: fund.strategy },
    { label: "Gérant", value: fund.manager },
    { label: "Poche", value: BUCKET_LABEL[fund.bucket] },
    { label: "Géographies", value: geographies },
    { label: "Objectif de multiple", value: `${formatMultiple(fund.target_multiple)} brut` },
    { label: "TRI brut cible", value: formatPercent(fund.target_gross_irr) },
    { label: "Ticket minimum", value: formatEuro(fund.min_ticket) },
    { label: "Clôture", value: fund.closing_label },
  ];

  return { tagline, pitch, highlights, strategy, geographies };
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
