import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { formatEuro } from "@/lib/funds";
import { CLIENT_STATUS, RISK_PROFILE_LABEL } from "@/lib/status";
import type { ClientStatus } from "@/types/domain";

/** client-list-table — listing des clients du cabinet (RLS-scopé), entité centrale. */
export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select(
      "id, reference, first_name, last_name, status, patrimoine_financier, risk_profile, created_at, allocations(count)",
    )
    .order("created_at", { ascending: false });

  const list = clients ?? [];

  return (
    <PageShell className="py-14">
      <Eyebrow>Cabinet</Eyebrow>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
          Vos <em className="pc">clients</em>
        </h1>
        <Link href="/clients/new">
          <Button>Nouveau client</Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <EmptyState
          className="mt-10"
          title="Aucun client enregistré."
          description="Créez votre premier client pour constituer son dossier de qualification et lui proposer des pistes d'investissement."
          action={
            <Link href="/clients/new">
              <Button>Créer un client</Button>
            </Link>
          }
        />
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-black/15 text-left">
                {["Client", "Statut", "Profil", "Patrimoine", "Pistes"].map(
                  (h) => (
                    <th
                      key={h}
                      className="pb-3 text-[11px] uppercase tracking-[0.06em] text-muted"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {list.map((c) => {
                const count = Array.isArray(c.allocations)
                  ? (c.allocations[0]?.count ?? 0)
                  : 0;
                const name =
                  [c.first_name, c.last_name].filter(Boolean).join(" ") ||
                  c.reference;
                const st = CLIENT_STATUS[c.status as ClientStatus];
                return (
                  <tr
                    key={c.id}
                    className="border-b border-black/10 transition-colors hover:bg-white"
                  >
                    <td className="py-4">
                      <Link
                        href={`/clients/${c.id}`}
                        className="font-medium transition-colors hover:text-coral"
                      >
                        {name}
                      </Link>
                      <span className="mt-0.5 block text-[12px] text-muted">
                        Réf. {c.reference}
                      </span>
                    </td>
                    <td className="py-4">
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </td>
                    <td className="py-4 text-slate">
                      {c.risk_profile
                        ? (RISK_PROFILE_LABEL[c.risk_profile] ?? c.risk_profile)
                        : "—"}
                    </td>
                    <td className="py-4 text-slate">
                      {c.patrimoine_financier != null
                        ? formatEuro(Number(c.patrimoine_financier))
                        : "—"}
                    </td>
                    <td className="py-4 text-slate">{count}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
