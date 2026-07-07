import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TitleAccent } from "@/components/ui/TitleAccent";
import { ClientForm } from "@/components/client/ClientForm";

/** Création d'un nouveau client (identité + attributs de base). */
export default function NewClientPage() {
  return (
    <PageShell className="py-14">
      <Link
        href="/clients"
        className="text-[13px] text-muted transition-opacity hover:opacity-70"
      >
        ← Retour aux clients
      </Link>
      <div className="mt-4">
        <Eyebrow>Nouveau client</Eyebrow>
        <TitleAccent
          className="mt-3 text-[42px] font-medium leading-[46px] tracking-[-0.01em]"
          title="Créer un client"
          accentWord="client"
        />
        <p className="mt-2 max-w-xl text-[15px] text-muted">
          Renseignez l'identité de l'investisseur. Vous pourrez ensuite
          compléter sa qualification, sa checklist documentaire et lui proposer
          des pistes d'investissement.
        </p>
      </div>
      <div className="mt-10 max-w-3xl">
        <ClientForm mode="create" />
      </div>
    </PageShell>
  );
}
