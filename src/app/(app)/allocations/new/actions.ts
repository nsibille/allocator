"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logClientEvent } from "@/lib/client/log-event";
import { buildAllocation } from "@/lib/allocation/engine";
import type { AllocationInput, Fund } from "@/types/domain";

/* Server Action : qualifie → moteur d'allocation → persiste allocation + lignes. */

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
  const lines = buildAllocation(input, funds as Fund[]);
  if (lines.length === 0) {
    return { error: "Aucune allocation n'a pu être composée avec ces critères." };
  }

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
      status: "proposed",
    })
    .select("id")
    .single();

  if (allocError || !allocation) {
    return { error: "Échec de l'enregistrement de l'allocation." };
  }

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
