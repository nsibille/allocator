"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logClientEvent } from "@/lib/client/log-event";
import { buildAllocation, buildFromSelection } from "@/lib/allocation/engine";
import { eligibleFunds } from "@/lib/allocation/eligibility";
import { computeProfile } from "@/lib/allocation/profile";
import type {
  AllocationInput,
  AllocationQualification,
  Fund,
  QualificationInput,
} from "@/types/domain";
import type { Json } from "@/types/database.types";

/* Server Action : qualifie → moteur d'allocation → persiste allocation + lignes. */

const subScoreSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
});

const payloadSchema = z.object({
  clientId: z.string().uuid().optional(),
  clientReference: z.string().trim().min(2),
  patrimoine: z.number().positive().nullable(),
  envelope: z.number().min(25000),
  riskProfile: z.enum(["prudent", "equilibre", "dynamique", "offensif"]),
  experience: z.enum(["novice", "initie", "averti"]),
  horizonYears: z.number().min(5).max(15),
  immobilisation: z.enum(["faible", "moyenne", "forte"]),
  callCapacity: z.boolean(),
  objectives: z.array(
    z.enum([
      "croissance",
      "diversification",
      "decorrelation",
      "rendement",
      "impact",
      "acces",
    ]),
  ),
  strategies: z.array(
    z.enum([
      "buyout",
      "growth",
      "innovation",
      "credit",
      "infra",
      "secondary",
      "gpstakes",
    ]),
  ),
  esg: z.boolean(),
  diversification: z.enum(["concentre", "equilibre", "large"]),
  // Catégorisation & qualification enrichie.
  mifidStatus: z.enum(["non_professionnel", "professionnel", "contrepartie"]),
  acceptedVehicles: z.array(z.enum(["eltif", "fcpr", "fcpi", "fip", "feeder"])),
  ticketMin: z.number().nonnegative(),
  revenusStability: z.enum(["stable", "variable", "irregulier"]).nullable(),
  lossCapacity: z.enum(["lt_10", "10_25", "25_50", "gt_50"]).nullable(),
  reactionBaisse: z.enum(["vendre", "attendre", "renforcer"]).nullable(),
  // Sélection des fonds.
  autoSelect: z.boolean(),
  selectedFundIds: z.array(z.string().uuid()),
  dynamismScore: z.number(),
  profileLabel: z.string(),
  subScores: z.array(subScoreSchema),
});

export type CreateAllocationPayload = z.infer<typeof payloadSchema>;

export async function createAllocation(
  raw: CreateAllocationPayload,
): Promise<{ error: string } | never> {
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Formulaire incomplet ou invalide." };
  }
  const p = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session expirée, reconnectez-vous." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, cabinet_id")
    .eq("id", user.id)
    .single();
  if (!profile?.cabinet_id) {
    return {
      error:
        "Aucun cabinet rattaché à votre profil. Contactez l'administrateur.",
    };
  }

  const { data: funds } = await supabase
    .from("funds")
    .select("*")
    .eq("is_active", true);
  if (!funds || funds.length === 0) {
    return { error: "Gamme de fonds indisponible." };
  }

  const input: AllocationInput = {
    envelope: p.envelope,
    riskProfile: p.riskProfile,
    objectives: p.objectives,
    strategies: p.strategies,
    esg: p.esg,
    diversification: p.diversification,
  };

  // Univers éligible à la catégorisation de l'investisseur.
  const eligible = eligibleFunds(funds as Fund[], {
    envelope: p.envelope,
    acceptedVehicles: p.acceptedVehicles,
    professional: p.mifidStatus !== "non_professionnel",
    riskProfile: p.riskProfile,
  });
  if (eligible.length === 0) {
    return {
      error:
        "Aucun fonds éligible à cette catégorisation. Élargissez les enveloppes acceptées ou le profil.",
    };
  }

  // Auto : le moteur compose parmi les éligibles. Manuel : périmètre imposé par
  // le CGP (fonds éligibles choisis), montants nuls conservés.
  const eligibleIds = new Set(eligible.map((f) => f.id));
  const selected = eligible.filter((f) => p.selectedFundIds.includes(f.id));
  const lines =
    p.autoSelect || selected.length === 0
      ? buildAllocation(input, eligible)
      : buildFromSelection(input, selected);
  if (lines.length === 0) {
    return { error: "Aucune allocation n'a pu être composée avec ces critères." };
  }

  // Recalcul serveur du profil type (ne jamais faire confiance au client).
  const qualInput: QualificationInput = {
    patrimoine: p.patrimoine,
    envelope: p.envelope,
    riskProfile: p.riskProfile,
    experience: p.experience,
    horizonYears: p.horizonYears,
    immobilisation: p.immobilisation,
    callCapacity: p.callCapacity,
    objectives: p.objectives,
    esg: p.esg,
    revenusStability: p.revenusStability,
    lossCapacity: p.lossCapacity,
    reactionBaisse: p.reactionBaisse,
  };
  const investorProfile = computeProfile(qualInput);

  const qualification: AllocationQualification = {
    mifidStatus: p.mifidStatus,
    acceptedVehicles: p.acceptedVehicles,
    ticketMin: p.ticketMin,
    experience: p.experience,
    revenusStability: p.revenusStability,
    lossCapacity: p.lossCapacity,
    reactionBaisse: p.reactionBaisse,
    immobilisation: p.immobilisation,
    callCapacity: p.callCapacity,
    patrimoine: p.patrimoine,
    autoSelect: p.autoSelect,
    dynamismScore: investorProfile.dynamismScore,
    profileLabel: investorProfile.profileLabel,
    subScores: investorProfile.subScores,
    selectedFundIds: lines
      .map((l) => l.fundId)
      .filter((id) => eligibleIds.has(id)),
  };

  // Client : rattachement à un client existant (piste depuis une fiche) ou création.
  let clientId = p.clientId ?? null;
  if (!clientId) {
    const { data: client } = await supabase
      .from("clients")
      .insert({
        cabinet_id: profile.cabinet_id,
        conseiller_id: profile.id,
        reference: p.clientReference,
        patrimoine_financier: p.patrimoine,
        risk_profile: p.riskProfile,
        experience: p.experience,
        horizon_years: p.horizonYears,
        liquidity: p.immobilisation,
      })
      .select("id")
      .single();
    clientId = client?.id ?? null;
  }

  // Allocation.
  const { data: allocation, error: allocError } = await supabase
    .from("allocations")
    .insert({
      cabinet_id: profile.cabinet_id,
      conseiller_id: profile.id,
      client_id: clientId,
      name: `Allocation ${p.clientReference}`,
      envelope_amount: p.envelope,
      risk_profile: p.riskProfile,
      horizon_years: p.horizonYears,
      objectives: p.objectives,
      strategies: p.strategies,
      esg: p.esg,
      diversification: p.diversification,
      qualification: qualification as unknown as Json,
      status: "proposed",
    })
    .select("id")
    .single();

  if (allocError || !allocation) {
    return { error: "Échec de l'enregistrement de l'allocation." };
  }

  // Toutes les lignes du périmètre, montants nuls compris (périmètre constant).
  const { error: linesError } = await supabase.from("allocation_lines").insert(
    lines.map((l) => ({
      allocation_id: allocation.id,
      fund_id: l.fundId,
      amount: l.amount,
    })),
  );
  if (linesError) {
    return { error: "Échec de l'enregistrement des lignes d'allocation." };
  }

  if (clientId) {
    await logClientEvent(supabase, {
      clientId,
      cabinetId: profile.cabinet_id,
      type: "proposal_created",
      title: `Allocation ${p.clientReference}`,
      data: { amount: p.envelope, allocation_id: allocation.id },
    });
  }

  redirect(`/allocations/${allocation.id}`);
}
