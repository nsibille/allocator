import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { formatEuro } from "@/lib/funds";
import { RISK_PROFILE_LABEL } from "@/lib/status";

/** Écran clients : références HNWI anonymisées du cabinet (RLS-scopées). */
export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select(
      "id, reference, patrimoine_financier, risk_profile, horizon_years, created_at, allocations(count)",
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
        <Link href="/allocations/new">
          <Button>Nouvelle allocation</Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <EmptyState
          className="mt-10"
          title="Aucun client enregistré."
          description="Chaque client HNWI est créé lors de la qualification, sous une référence anonymisée."
          action={
            <Link href="/allocations/new">
              <Button>Qualifier un client</Button>
            </Link>
          }
        />
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-black/15 text-left">
                {["Référence", "Profil", "Patrimoine", "Horizon", "Allocations"].map(
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
                return (
                  <tr key={c.id} className="border-b border-black/10">
                    <td className="py-4 font-medium">{c.reference}</td>
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
                    <td className="py-4 text-slate">
                      {c.horizon_years ? `${c.horizon_years} ans` : "—"}
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
