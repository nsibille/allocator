import { z } from "zod";
import { Constants } from "@/types/database.types";
import {
  CATEGORY_KEYS,
  ENVELOPE_KEYS,
  GEO_KEYS,
  SUPPORT_KEYS,
} from "@/lib/client/patrimoine.config";

/* Validation Zod des formulaires clients (identité) + garde-fous questionnaires. */

const optionalText = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((v) => (v ? v : null));

/** Identité + attributs de base d'un client (création / édition). */
export const clientIdentitySchema = z
  .object({
    reference: z.string().trim().max(60).optional(),
    first_name: optionalText,
    last_name: optionalText,
    email: z
      .string()
      .trim()
      .email("Email invalide.")
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
    phone: optionalText,
    address: optionalText,
    birth_date: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : null)),
    nationality: optionalText,
    status: z.enum(["prospect", "actif", "archive"]).default("prospect"),
    patrimoine_financier: z
      .number()
      .positive("Patrimoine invalide.")
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    risk_profile: z
      .enum(["prudent", "equilibre", "dynamique", "offensif"])
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    horizon_years: z
      .number()
      .int()
      .min(1)
      .max(30)
      .nullable()
      .optional()
      .transform((v) => v ?? null),
    notes: optionalText,
  })
  .refine((v) => Boolean(v.reference || v.last_name || v.first_name), {
    error: "Renseignez au moins une référence ou un nom.",
    path: ["reference"],
  });

/** Type *input* (avant transforms Zod) : forme construite par les formulaires. */
export type ClientIdentityInput = z.input<typeof clientIdentitySchema>;

/** Une réponse de questionnaire : string | number | string[] | null. */
const answerValue = z.union([
  z.string(),
  z.number(),
  z.array(z.string()),
  z.null(),
]);

export const questionnaireSchema = z.object({
  kind: z.enum(["kyc", "adequacy", "esg", "tax"]),
  answers: z.record(z.string(), answerValue),
});

export type QuestionnaireInput = z.infer<typeof questionnaireSchema>;

/** Métadonnées d'un document (checklist KYC). */
export const documentSchema = z.object({
  name: z.string().trim().min(2, "Nom du document requis.").max(120),
  doc_type: z.string().trim().max(60).default("autre"),
  status: z
    .enum(["manquant", "recu", "valide", "expire"])
    .default("manquant"),
  note: optionalText,
});

export type DocumentInput = z.infer<typeof documentSchema>;

/** Saisie manuelle d'un événement de timeline par le CGP. */
export const manualEventSchema = z.object({
  type: z.enum(Constants.public.Enums.client_event_type),
  title: optionalText,
  body: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v ? v : null)),
  occurred_at: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
  amount: z
    .number()
    .nonnegative()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  state: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v ? v : null)),
});

export type ManualEventInput = z.input<typeof manualEventSchema>;

/** Un avoir du patrimoine (classe d'actif + support + enveloppe/géo optionnels). */
export const assetSchema = z.object({
  category: z
    .string()
    .trim()
    .refine((v) => CATEGORY_KEYS.includes(v), "Classe d'actif invalide."),
  support: z
    .string()
    .trim()
    .refine((v) => SUPPORT_KEYS.includes(v), "Support invalide.")
    .default("autre"),
  envelope: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v == null || ENVELOPE_KEYS.includes(v), "Enveloppe invalide."),
  geography: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v == null || GEO_KEYS.includes(v), "Zone invalide."),
  label: z.string().trim().min(2, "Libellé requis.").max(120),
  value: z
    .number({ error: "Valorisation requise." })
    .nonnegative("Valorisation invalide.")
    .max(1_000_000_000),
  note: optionalText,
});

export type AssetInput = z.input<typeof assetSchema>;
