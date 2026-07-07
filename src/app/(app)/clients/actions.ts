"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  clientIdentitySchema,
  documentSchema,
  questionnaireSchema,
  type ClientIdentityInput,
  type DocumentInput,
  type QuestionnaireInput,
} from "@/lib/client/schema";
import type { ClientStatus } from "@/types/domain";
import type { TablesUpdate } from "@/types/database.types";

/* Server Actions — administration des clients (client-first). */

type ActionError = { error: string };

/** Résout le cabinet du conseiller connecté (scoping RLS). Union discriminée par `ok`. */
async function requireCabinet() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Session expirée, reconnectez-vous." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, cabinet_id")
    .eq("id", user.id)
    .single();
  if (!profile?.cabinet_id) {
    return {
      ok: false as const,
      error:
        "Aucun cabinet rattaché à votre profil. Contactez l'administrateur.",
    };
  }
  return {
    ok: true as const,
    supabase,
    profileId: profile.id,
    cabinetId: profile.cabinet_id,
  };
}

/** Référence lisible auto (fallback si non saisie). */
function autoReference(input: {
  first_name?: string | null;
  last_name?: string | null;
}): string {
  const name = [input.first_name, input.last_name].filter(Boolean).join(" ");
  if (name) return name;
  return `CLI-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

/** Crée un client puis redirige vers sa fiche. */
export async function createInvestor(
  raw: ClientIdentityInput,
): Promise<ActionError | never> {
  const parsed = clientIdentitySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const ctx = await requireCabinet();
  if (!ctx.ok) return { error: ctx.error };
  const p = parsed.data;

  const { data: client, error } = await ctx.supabase
    .from("clients")
    .insert({
      cabinet_id: ctx.cabinetId,
      conseiller_id: ctx.profileId,
      reference: p.reference?.trim() || autoReference(p),
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      phone: p.phone,
      address: p.address,
      birth_date: p.birth_date,
      nationality: p.nationality,
      status: p.status,
      patrimoine_financier: p.patrimoine_financier,
      risk_profile: p.risk_profile,
      horizon_years: p.horizon_years,
      notes: p.notes,
    })
    .select("id")
    .single();

  if (error || !client) {
    return { error: "Échec de la création du client." };
  }

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

/** Met à jour l'identité / attributs de base d'un client existant. */
export async function updateInvestorIdentity(
  id: string,
  raw: ClientIdentityInput,
): Promise<ActionError | never> {
  const parsed = clientIdentitySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const ctx = await requireCabinet();
  if (!ctx.ok) return { error: ctx.error };
  const p = parsed.data;

  const { error } = await ctx.supabase
    .from("clients")
    .update({
      reference: p.reference?.trim() || autoReference(p),
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      phone: p.phone,
      address: p.address,
      birth_date: p.birth_date,
      nationality: p.nationality,
      status: p.status,
      patrimoine_financier: p.patrimoine_financier,
      risk_profile: p.risk_profile,
      horizon_years: p.horizon_years,
      notes: p.notes,
    })
    .eq("id", id);

  if (error) return { error: "Échec de la mise à jour du client." };

  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
  redirect(`/clients/${id}`);
}

/** Enregistre les réponses d'un questionnaire (colonne JSONB dédiée). */
export async function saveQuestionnaire(
  clientId: string,
  raw: QuestionnaireInput,
): Promise<ActionError | { ok: true }> {
  const parsed = questionnaireSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Réponses invalides." };
  }
  const ctx = await requireCabinet();
  if (!ctx.ok) return { error: ctx.error };

  const { kind, answers } = parsed.data;
  const patch: TablesUpdate<"clients"> =
    kind === "kyc"
      ? { kyc: answers }
      : kind === "adequacy"
        ? { adequacy: answers }
        : kind === "esg"
          ? { esg_profile: answers }
          : { tax: answers };
  const { error } = await ctx.supabase
    .from("clients")
    .update(patch)
    .eq("id", clientId);

  if (error) return { error: "Échec de l'enregistrement du questionnaire." };

  revalidatePath(`/clients/${clientId}`);
  return { ok: true };
}

/** Change le statut d'administration d'un client (archivage doux inclus). */
export async function setClientStatus(
  id: string,
  status: ClientStatus,
): Promise<ActionError | { ok: true }> {
  const ctx = await requireCabinet();
  if (!ctx.ok) return { error: ctx.error };

  const { error } = await ctx.supabase
    .from("clients")
    .update({ status })
    .eq("id", id);
  if (error) return { error: "Échec du changement de statut." };

  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
  return { ok: true };
}

/** Supprime un client (ses allocations sont détachées via FK on delete set null). */
export async function deleteInvestor(
  id: string,
): Promise<ActionError | never> {
  const ctx = await requireCabinet();
  if (!ctx.ok) return { error: ctx.error };

  const { error } = await ctx.supabase.from("clients").delete().eq("id", id);
  if (error) return { error: "Échec de la suppression du client." };

  revalidatePath("/clients");
  redirect("/clients");
}

/** Ajoute une ligne à la checklist documentaire du client. */
export async function addDocument(
  clientId: string,
  raw: DocumentInput,
): Promise<ActionError | { ok: true }> {
  const parsed = documentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Document invalide." };
  }
  const ctx = await requireCabinet();
  if (!ctx.ok) return { error: ctx.error };

  const { error } = await ctx.supabase.from("client_documents").insert({
    client_id: clientId,
    cabinet_id: ctx.cabinetId,
    name: parsed.data.name,
    doc_type: parsed.data.doc_type,
    status: parsed.data.status,
    note: parsed.data.note,
  });
  if (error) return { error: "Échec de l'ajout du document." };

  revalidatePath(`/clients/${clientId}`);
  return { ok: true };
}

/** Met à jour le statut / la note d'un document. */
export async function updateDocument(
  clientId: string,
  documentId: string,
  raw: DocumentInput,
): Promise<ActionError | { ok: true }> {
  const parsed = documentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Document invalide." };
  }
  const ctx = await requireCabinet();
  if (!ctx.ok) return { error: ctx.error };

  const { error } = await ctx.supabase
    .from("client_documents")
    .update({
      name: parsed.data.name,
      doc_type: parsed.data.doc_type,
      status: parsed.data.status,
      note: parsed.data.note,
    })
    .eq("id", documentId);
  if (error) return { error: "Échec de la mise à jour du document." };

  revalidatePath(`/clients/${clientId}`);
  return { ok: true };
}

/** Supprime un document de la checklist. */
export async function deleteDocument(
  clientId: string,
  documentId: string,
): Promise<ActionError | { ok: true }> {
  const ctx = await requireCabinet();
  if (!ctx.ok) return { error: ctx.error };

  const { error } = await ctx.supabase
    .from("client_documents")
    .delete()
    .eq("id", documentId);
  if (error) return { error: "Échec de la suppression du document." };

  revalidatePath(`/clients/${clientId}`);
  return { ok: true };
}
