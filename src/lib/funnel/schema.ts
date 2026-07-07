import { z } from "zod";
import { ENVELOPE_MIN, type FunnelState } from "@/stores/funnel.store";
import { DIVERSIFICATION_RANGE } from "@/lib/funds";

/* Validation Zod par étape du funnel (§8.1, §10 : enveloppe min 25 000 €). */

export const stepSchemas = [
  // Étape 1 — cabinet, client & catégorisation
  z.object({
    clientReference: z.string().trim().min(2, "Référence client requise."),
    mifidStatus: z.enum(["non_professionnel", "professionnel", "contrepartie"]),
    acceptedVehicles: z
      .array(z.string())
      .min(1, "Sélectionnez au moins une enveloppe éligible."),
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
  // Étape 7 — profil type (récapitulatif, aucune saisie requise)
  z.object({}),
  // Étape 8 — sélection des fonds
  z
    .object({
      autoSelect: z.boolean(),
      selectedFundIds: z.array(z.string()),
      diversification: z.enum(["concentre", "equilibre", "large"]),
    })
    .refine(
      (v) =>
        v.autoSelect ||
        v.selectedFundIds.length >= DIVERSIFICATION_RANGE[v.diversification].min,
      {
        error: "Sélectionnez davantage de fonds pour couvrir la diversification cible.",
        path: ["selectedFundIds"],
      },
    ),
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
