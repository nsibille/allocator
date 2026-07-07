"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logClientEvent } from "@/lib/client/log-event";
import type { PacingProfile } from "@/types/domain";

/* Server Action : initie une souscription mono-fonds pour le compte d'un
   investisseur — crée une allocation à une ligne (statut « proposée ») puis
   redirige vers la note d'allocation, où le conseiller finalise et génère le
   bulletin. Réutilise l'infrastructure d'allocation existante. */

const payloadSchema = z.object({
  fundSlug: z.string().min(1),
  clientId: z.string().uuid().optional(),
  clientReference: z.string().trim().min(2).optional(),
  amount: z.number().positive(),
});

export type InitSubscriptionPayload = z.infer<typeof payloadSchema>;

export async function initSubscription(
  raw: InitSubscriptionPayload,
): Promise<{ error: string } | never> {
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) return { error: "Formulaire incomplet ou invalide." };
  const p = parsed.data;

  if (!p.clientId && !p.clientReference) {
    return { error: "Sélectionnez un investisseur ou saisissez une référence." };
  }

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
    return { error: "Aucun cabinet rattaché à votre profil." };
  }

  const { data: fund } = await supabase
    .from("funds")
    .select("id, name, pacing, min_ticket, is_active")
    .eq("slug", p.fundSlug)
    .maybeSingle();
  if (!fund || !fund.is_active) {
    return { error: "Ce fonds n'est pas ouvert à la souscription." };
  }
  if (p.amount < Number(fund.min_ticket)) {
    return { error: "Le montant est inférieur au ticket minimum du fonds." };
  }

  // Résolution de l'investisseur : client existant, ou création d'un prospect.
  let clientId = p.clientId ?? null;
  let reference = p.clientReference ?? "";
  let riskProfile: "prudent" | "equilibre" | "dynamique" | "offensif" =
    "equilibre";

  if (clientId) {
    const { data: client } = await supabase
      .from("clients")
      .select("id, reference, first_name, last_name, risk_profile")
      .eq("id", clientId)
      .single();
    if (!client) return { error: "Investisseur introuvable." };
    reference =
      [client.first_name, client.last_name].filter(Boolean).join(" ") ||
      client.reference;
    if (client.risk_profile) riskProfile = client.risk_profile;
  } else {
    const { data: client } = await supabase
      .from("clients")
      .insert({
        cabinet_id: profile.cabinet_id,
        conseiller_id: profile.id,
        reference: reference,
        status: "prospect",
      })
      .select("id")
      .single();
    clientId = client?.id ?? null;
  }

  const { data: allocation, error: allocError } = await supabase
    .from("allocations")
    .insert({
      cabinet_id: profile.cabinet_id,
      conseiller_id: profile.id,
      client_id: clientId,
      name: `Souscription ${fund.name} · ${reference}`,
      envelope_amount: p.amount,
      risk_profile: riskProfile,
      objectives: [],
      strategies: [fund.pacing as PacingProfile],
      esg: false,
      diversification: "concentre",
      status: "proposed",
    })
    .select("id")
    .single();

  if (allocError || !allocation) {
    return { error: "Échec de l'enregistrement de la souscription." };
  }

  const { error: lineError } = await supabase.from("allocation_lines").insert({
    allocation_id: allocation.id,
    fund_id: fund.id,
    amount: p.amount,
  });
  if (lineError) {
    return { error: "Échec de l'enregistrement de la ligne de souscription." };
  }

  if (clientId) {
    await logClientEvent(supabase, {
      clientId,
      cabinetId: profile.cabinet_id,
      type: "proposal_created",
      title: `Souscription ${fund.name}`,
      data: { amount: p.amount, allocation_id: allocation.id, fund_id: fund.id },
    });
  }

  redirect(`/allocations/${allocation.id}`);
}
