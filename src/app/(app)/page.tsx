import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Stat } from "@/components/ui/Stat";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { formatEuro } from "@/lib/funds";
import { ALLOCATION_STATUS, RISK_PROFILE_LABEL } from "@/lib/status";

/** Tableau de bord : KPIs cabinet + liste des allocations (RLS-scopée). */
export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: allocations }, { count: clientCount }] = await Promise.all([
    supabase
      .from("allocations")
      .select("id, name, envelope_amount, risk_profile, status, updated_at")
      .order("updated_at", { ascending: false }),
    supabase.from("clients").select("id", { count: "exact", head: true }),
  ]);

  const list = allocations ?? [];
  const isEmpty = list.length === 0;
  const totalEnvelope = list.reduce(
    (s, a) => s + Number(a.envelope_amount),
    0,
  );

  return (
    <PageShell className="py-14">
      <Eyebrow>Cabinet</Eyebrow>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
          Vos <em className="pc">allocations</em>
        </h1>
        <Link href="/allocations/new">
          <Button>Nouvelle allocation</Button>
        </Link>
      </div>

      {!isEmpty && (
        <div className="mt-10 grid grid-cols-2 gap-6 rounded-card border border-black/10 bg-white p-6 md:grid-cols-3">
          <Stat size="sm" value={String(list.length)} label="Allocations" />
          <Stat
            size="sm"
            value={formatEuro(totalEnvelope)}
            label="Enveloppes cumulées"
          />
          <Stat size="sm" value={String(clientCount ?? 0)} label="Clients" />
        </div>
      )}

      {isEmpty ? (
        <EmptyState
          className="mt-10"
          title="Aucune allocation pour l'instant."
          description="Lancez le funnel de qualification pour composer une première allocation sur la gamme Private Corner."
          action={
            <Link href="/allocations/new">
              <Button>Démarrer la qualification</Button>
            </Link>
          }
        />
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {list.map((a) => {
            const status = ALLOCATION_STATUS[a.status];
            return (
              <li key={a.id}>
                <Link
                  href={`/allocations/${a.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-black/10 bg-white px-6 py-5 transition-colors hover:border-coral"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{a.name}</p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {RISK_PROFILE_LABEL[a.risk_profile] ?? a.risk_profile} ·
                      modifiée le{" "}
                      {format(new Date(a.updated_at), "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[17px] font-medium tracking-[-0.02em]">
                      {formatEuro(Number(a.envelope_amount))}
                    </span>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}
