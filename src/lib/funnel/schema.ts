import { z } from "zod";
import { ENVELOPE_MIN, type FunnelState } from "@/stores/funnel.store";

/* Validation Zod par étape du funnel (§8.1, §10 : enveloppe min 25 000 €). */

export const stepSchemas = [
  // Étape 1 — cabinet & client
  z.object({
    clientReference: z.string().trim().min(2, "Référence client requise."),
  }),
  // Étape 2 — patrimoine & enveloppe
  z.object({
    patrimoine: z
      .number({ error: "Patrimoine requis." })
      .positive("Patrimoine invalide."),
    envelope: z
      .number()
      .min(ENVELOPE_MIN, `Enveloppe minimale ${ENVELOPE_MIN.toLocaleString("fr-FR")} €.`),
  }).refine((v) => v.patrimoine == null || v.envelope <= v.patrimoine, {
    error: "L'enveloppe ne peut excéder le patrimoine financier.",
    path: ["envelope"],
  }),
  // Étape 3 — profil de risque
  z.object({
    riskProfile: z.enum(["prudent", "equilibre", "dynamique", "offensif"], {
      error: "Profil de risque requis.",
    }),
    experience: z.enum(["novice", "initie", "averti"], {
      error: "Expérience requise.",
    }),
  }),
  // Étape 4 — horizon & liquidité
  z.object({
    horizonYears: z.number().min(5).max(15),
    immobilisation: z.enum(["faible", "moyenne", "forte"], {
      error: "Capacité d'immobilisation requise.",
    }),
  }),
  // Étape 5 — objectifs & thèmes
  z.object({
    objectives: z
      .array(z.string())
      .min(1, "Sélectionnez au moins un objectif."),
  }),
  // Étape 6 — diversification
  z.object({
    diversification: z.enum(["concentre", "equilibre", "large"]),
  }),
] as const;

/** Valide une étape donnée à partir de l'état complet du funnel. */
export function validateStep(step: number, state: FunnelState) {
  const schema = stepSchemas[step];
  if (!schema) return { success: true as const, error: null };
  const result = schema.safeParse(state);
  return result.success
    ? { success: true as const, error: null }
    : {
        success: false as const,
        error: result.error.issues[0]?.message ?? "Étape incomplète.",
      };
}

export function isStepValid(step: number, state: FunnelState): boolean {
  return validateStep(step, state).success;
}
