import type { QuestionnaireKind } from "@/types/domain";

/**
 * Définition déclarative des quatre questionnaires de qualification investisseur.
 * Le rendu (composant `client-questionnaire-form`) et la synthèse de complétude
 * sont entièrement pilotés par ces specs — aucune logique de champ codée en dur.
 *
 * Types de champ :
 *  - `segmented`  : pilules `ui-segmented` (mono ou `multiple`) — valeur string | string[]
 *  - `select`     : liste déroulante `ui-select` — valeur string
 *  - `text`       : champ libre `ui-field-text` — valeur string
 *  - `number`     : champ numérique (`suffix` optionnel) — valeur number
 *  - `currency`   : montant en euros (`ui-field-currency`) — valeur number
 */
export type QuestionType =
  | "segmented"
  | "select"
  | "text"
  | "number"
  | "currency";

export interface QuestionOption {
  value: string;
  label: string;
  hint?: string;
}

export interface Question {
  key: string;
  label: string;
  type: QuestionType;
  /** Options pour `segmented` / `select`. */
  options?: QuestionOption[];
  /** Multi-sélection (segmented uniquement). */
  multiple?: boolean;
  /** Colonnes de la grille segmented. */
  columns?: number;
  placeholder?: string;
  /** Unité suffixe (`number` / `currency`), ex. « % », « ans ». */
  suffix?: string;
  hint?: string;
}

export interface QuestionnaireSection {
  kind: QuestionnaireKind;
  slug: string;
  eyebrow: string;
  title: string;
  /** Mot-clé rendu en Saol italic dans le titre. */
  accentWord?: string;
  description: string;
  questions: Question[];
}

const YES_NO: QuestionOption[] = [
  { value: "oui", label: "Oui" },
  { value: "non", label: "Non" },
];

const KNOWLEDGE: QuestionOption[] = [
  { value: "aucune", label: "Aucune" },
  { value: "limitee", label: "Limitée" },
  { value: "bonne", label: "Bonne" },
  { value: "experte", label: "Experte" },
];

/* ------------------------------------------------------------------ *
 * KYC simple — connaissance client
 * ------------------------------------------------------------------ */
const KYC: QuestionnaireSection = {
  kind: "kyc",
  slug: "client-questionnaire-kyc",
  eyebrow: "Connaissance client",
  title: "Questionnaire simple",
  accentWord: "simple",
  description:
    "Situation personnelle et professionnelle de l'investisseur (KYC).",
  questions: [
    {
      key: "situation_familiale",
      label: "Situation familiale",
      type: "segmented",
      columns: 3,
      options: [
        { value: "celibataire", label: "Célibataire" },
        { value: "marie", label: "Marié(e)" },
        { value: "pacse", label: "Pacsé(e)" },
        { value: "divorce", label: "Divorcé(e)" },
        { value: "veuf", label: "Veuf(ve)" },
      ],
    },
    {
      key: "nb_enfants",
      label: "Nombre d'enfants à charge",
      type: "number",
      placeholder: "0",
    },
    {
      key: "profession",
      label: "Profession",
      type: "text",
      placeholder: "Ex. chef d'entreprise",
    },
    {
      key: "statut_pro",
      label: "Statut professionnel",
      type: "segmented",
      columns: 4,
      options: [
        { value: "salarie", label: "Salarié(e)" },
        { value: "independant", label: "Indépendant(e)" },
        { value: "dirigeant", label: "Dirigeant(e)" },
        { value: "retraite", label: "Retraité(e)" },
        { value: "sans_emploi", label: "Sans emploi" },
      ],
    },
    {
      key: "revenus_annuels",
      label: "Revenus annuels nets",
      type: "segmented",
      columns: 4,
      options: [
        { value: "lt_100k", label: "< 100 k€" },
        { value: "100_250k", label: "100–250 k€" },
        { value: "250_500k", label: "250–500 k€" },
        { value: "gt_500k", label: "> 500 k€" },
      ],
    },
    {
      key: "origine_patrimoine",
      label: "Origine du patrimoine",
      type: "segmented",
      multiple: true,
      columns: 3,
      options: [
        { value: "epargne", label: "Épargne" },
        { value: "heritage", label: "Héritage / donation" },
        { value: "cession", label: "Cession d'entreprise" },
        { value: "professionnel", label: "Revenus professionnels" },
        { value: "immobilier", label: "Immobilier" },
        { value: "autre", label: "Autre" },
      ],
    },
    {
      key: "ppe",
      label: "Personne politiquement exposée (PPE)",
      type: "segmented",
      options: YES_NO,
    },
  ],
};

/* ------------------------------------------------------------------ *
 * Adéquation (MIF II) — connaissance, expérience, tolérance
 * ------------------------------------------------------------------ */
const ADEQUACY: QuestionnaireSection = {
  kind: "adequacy",
  slug: "client-questionnaire-adequacy",
  eyebrow: "MIF II",
  title: "Questionnaire d'adéquation",
  accentWord: "adéquation",
  description:
    "Connaissance, expérience et tolérance au risque de l'investisseur.",
  questions: [
    {
      key: "conn_actions",
      label: "Connaissance — Actions cotées",
      type: "segmented",
      columns: 4,
      options: KNOWLEDGE,
    },
    {
      key: "conn_obligataire",
      label: "Connaissance — Produits obligataires",
      type: "segmented",
      columns: 4,
      options: KNOWLEDGE,
    },
    {
      key: "conn_non_cote",
      label: "Connaissance — Non-coté / Private Equity",
      type: "segmented",
      columns: 4,
      options: KNOWLEDGE,
    },
    {
      key: "conn_immobilier",
      label: "Connaissance — Immobilier / infrastructures",
      type: "segmented",
      columns: 4,
      options: KNOWLEDGE,
    },
    {
      key: "nb_operations",
      label: "Opérations réalisées sur les 3 dernières années",
      type: "segmented",
      columns: 4,
      options: [
        { value: "aucune", label: "Aucune" },
        { value: "1_5", label: "1 à 5" },
        { value: "6_20", label: "6 à 20" },
        { value: "gt_20", label: "> 20" },
      ],
    },
    {
      key: "reaction_baisse",
      label: "Réaction à une baisse de −20 % du portefeuille",
      type: "segmented",
      columns: 1,
      options: [
        { value: "vendre", label: "Je vends pour limiter la perte" },
        { value: "attendre", label: "J'attends un retour à l'équilibre" },
        { value: "renforcer", label: "Je renforce mes positions" },
      ],
    },
    {
      key: "capacite_perte",
      label: "Part du patrimoine mobilisable sans impact sur le train de vie",
      type: "segmented",
      columns: 4,
      options: [
        { value: "lt_10", label: "< 10 %" },
        { value: "10_25", label: "10–25 %" },
        { value: "25_50", label: "25–50 %" },
        { value: "gt_50", label: "> 50 %" },
      ],
    },
    {
      key: "objectif_principal",
      label: "Objectif principal",
      type: "segmented",
      columns: 4,
      options: [
        { value: "preservation", label: "Préservation" },
        { value: "revenu", label: "Revenu" },
        { value: "croissance", label: "Croissance" },
        { value: "transmission", label: "Transmission" },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ *
 * ESG (SFDR) — préférences de durabilité
 * ------------------------------------------------------------------ */
const ESG: QuestionnaireSection = {
  kind: "esg",
  slug: "client-questionnaire-esg",
  eyebrow: "SFDR",
  title: "Préférences ESG",
  accentWord: "ESG",
  description:
    "Préférences de durabilité au sens du règlement SFDR (art. 8/9).",
  questions: [
    {
      key: "integration",
      label: "Souhaite intégrer des critères de durabilité",
      type: "segmented",
      options: YES_NO,
    },
    {
      key: "part_durable",
      label: "Proportion minimale d'investissements durables",
      type: "number",
      suffix: "%",
      placeholder: "0",
    },
    {
      key: "alignement_taxonomie",
      label: "Alignement minimal avec la taxonomie européenne",
      type: "number",
      suffix: "%",
      placeholder: "0",
    },
    {
      key: "pai",
      label: "Prise en compte des principales incidences négatives (PAI)",
      type: "segmented",
      options: YES_NO,
    },
    {
      key: "exclusions",
      label: "Exclusions sectorielles souhaitées",
      type: "segmented",
      multiple: true,
      columns: 3,
      options: [
        { value: "tabac", label: "Tabac" },
        { value: "armement", label: "Armement" },
        { value: "fossiles", label: "Énergies fossiles" },
        { value: "jeux", label: "Jeux d'argent" },
        { value: "charbon", label: "Charbon" },
      ],
    },
    {
      key: "thematiques",
      label: "Thématiques d'impact prioritaires",
      type: "segmented",
      multiple: true,
      columns: 3,
      options: [
        { value: "climat", label: "Climat" },
        { value: "social", label: "Social" },
        { value: "biodiversite", label: "Biodiversité" },
        { value: "gouvernance", label: "Gouvernance" },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ *
 * Fiscalité — situation et objectifs fiscaux
 * ------------------------------------------------------------------ */
const TAX: QuestionnaireSection = {
  kind: "tax",
  slug: "client-questionnaire-tax",
  eyebrow: "Fiscalité",
  title: "Questions fiscales",
  accentWord: "fiscales",
  description: "Résidence, imposition et objectifs fiscaux du foyer.",
  questions: [
    {
      key: "residence_fiscale",
      label: "Résidence fiscale",
      type: "segmented",
      columns: 3,
      options: [
        { value: "france", label: "France" },
        { value: "ue", label: "Union européenne" },
        { value: "hors_ue", label: "Hors UE" },
      ],
    },
    {
      key: "pays_residence",
      label: "Pays de résidence (si hors France)",
      type: "text",
      placeholder: "Ex. Belgique",
    },
    {
      key: "tmi",
      label: "Tranche marginale d'imposition",
      type: "segmented",
      columns: 5,
      options: [
        { value: "0", label: "0 %" },
        { value: "11", label: "11 %" },
        { value: "30", label: "30 %" },
        { value: "41", label: "41 %" },
        { value: "45", label: "45 %" },
      ],
    },
    {
      key: "assujetti_ifi",
      label: "Assujetti à l'IFI",
      type: "segmented",
      options: YES_NO,
    },
    {
      key: "patrimoine_immobilier",
      label: "Patrimoine immobilier net taxable (IFI)",
      type: "currency",
      placeholder: "0",
    },
    {
      key: "parts_foyer",
      label: "Nombre de parts du foyer fiscal",
      type: "number",
      placeholder: "1",
    },
    {
      key: "enveloppes",
      label: "Enveloppes déjà détenues",
      type: "segmented",
      multiple: true,
      columns: 4,
      options: [
        { value: "pea", label: "PEA" },
        { value: "pea_pme", label: "PEA-PME" },
        { value: "av", label: "Assurance-vie" },
        { value: "per", label: "PER" },
        { value: "compte_titres", label: "Compte-titres" },
      ],
    },
    {
      key: "objectifs_fiscaux",
      label: "Objectifs fiscaux",
      type: "segmented",
      multiple: true,
      columns: 4,
      options: [
        { value: "reduction_ir", label: "Réduction IR" },
        { value: "reduction_ifi", label: "Réduction IFI" },
        { value: "capitalisation", label: "Capitalisation" },
        { value: "transmission", label: "Transmission" },
        { value: "report_150ob", label: "Apport-cession (150-0 B ter)" },
      ],
    },
  ],
};

export const QUESTIONNAIRES: Record<QuestionnaireKind, QuestionnaireSection> = {
  kyc: KYC,
  adequacy: ADEQUACY,
  esg: ESG,
  tax: TAX,
};

/** Ordre d'affichage stable des questionnaires. */
export const QUESTIONNAIRE_ORDER: QuestionnaireKind[] = [
  "kyc",
  "adequacy",
  "esg",
  "tax",
];

/** Nombre de questions renseignées / total, pour la synthèse de complétude. */
export function questionnaireCompletion(
  kind: QuestionnaireKind,
  answers: Record<string, unknown> | null | undefined,
): { filled: number; total: number } {
  const section = QUESTIONNAIRES[kind];
  const data = answers ?? {};
  let filled = 0;
  for (const q of section.questions) {
    const v = (data as Record<string, unknown>)[q.key];
    const isFilled = Array.isArray(v)
      ? v.length > 0
      : v !== null && v !== undefined && v !== "";
    if (isFilled) filled += 1;
  }
  return { filled, total: section.questions.length };
}

/** Libellé lisible d'une valeur d'option (pour la relecture en synthèse). */
export function optionLabel(question: Question, value: string): string {
  return question.options?.find((o) => o.value === value)?.label ?? value;
}
