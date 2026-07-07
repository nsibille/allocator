import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ClientDetail,
  type ClientLead,
  type ClientSubscription,
} from "@/components/client/ClientDetail";
import type {
  AllocationStatus,
  BulletinStatus,
  ClientAssetRow,
  ClientDocumentRow,
  ClientEventRow,
  ClientRow,
} from "@/types/domain";

/** Fiche investisseur : identité, qualification, documents, souscriptions, pistes. */
export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();
  if (!client) notFound();

  const [
    { data: documents },
    { data: assets },
    { data: allocations },
    { data: subs },
    { data: events },
  ] = await Promise.all([
    supabase
      .from("client_documents")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("client_assets")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("allocations")
      .select("id, name, envelope_amount, risk_profile, status, updated_at")
      .eq("client_id", id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select(
        "id, reference, amount, status, generated_at, funds(name), allocations!inner(client_id)",
      )
      .eq("allocations.client_id", id)
      .order("generated_at", { ascending: true }),
    supabase
      .from("client_events")
      .select("*")
      .eq("client_id", id)
      .order("occurred_at", { ascending: false }),
  ]);

  const leads: ClientLead[] = (allocations ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    envelope_amount: Number(a.envelope_amount),
    risk_profile: a.risk_profile,
    status: a.status as AllocationStatus,
    updated_at: a.updated_at,
  }));

  const subscriptions: ClientSubscription[] = (subs ?? []).map((s) => {
    const fund = s.funds as { name: string } | null;
    return {
      id: s.id,
      reference: s.reference,
      amount: Number(s.amount),
      status: s.status as BulletinStatus,
      generated_at: s.generated_at,
      fund_name: fund?.name ?? null,
    };
  });

  return (
    <ClientDetail
      client={client as ClientRow}
      documents={(documents ?? []) as ClientDocumentRow[]}
      assets={(assets ?? []) as ClientAssetRow[]}
      leads={leads}
      subscriptions={subscriptions}
      events={(events ?? []) as ClientEventRow[]}
    />
  );
}
