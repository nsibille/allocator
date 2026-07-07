import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TitleAccent } from "@/components/ui/TitleAccent";
import { ClientForm } from "@/components/client/ClientForm";
import { createClient } from "@/lib/supabase/server";

/** Édition de l'identité / du profil de base d'un client. */
export default async function EditClientPage({
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

  return (
    <PageShell className="py-14">
      <Link
        href={`/clients/${id}`}
        className="text-[13px] text-muted transition-opacity hover:opacity-70"
      >
        ← Retour à la fiche
      </Link>
      <div className="mt-4">
        <Eyebrow>Édition</Eyebrow>
        <TitleAccent
          className="mt-3 text-[42px] font-medium leading-[46px] tracking-[-0.01em]"
          title="Modifier le client"
          accentWord="client"
        />
      </div>
      <div className="mt-10 max-w-3xl">
        <ClientForm
          mode="edit"
          clientId={id}
          initial={{
            reference: client.reference ?? "",
            first_name: client.first_name ?? "",
            last_name: client.last_name ?? "",
            email: client.email ?? "",
            phone: client.phone ?? "",
            address: client.address ?? "",
            birth_date: client.birth_date ?? "",
            nationality: client.nationality ?? "",
            status: client.status,
            patrimoine_financier:
              client.patrimoine_financier != null
                ? String(client.patrimoine_financier)
                : "",
            risk_profile: client.risk_profile ?? "",
            horizon_years:
              client.horizon_years != null ? String(client.horizon_years) : "",
            notes: client.notes ?? "",
          }}
        />
      </div>
    </PageShell>
  );
}
