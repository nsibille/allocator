import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Stat } from "@/components/ui/Stat";
import { Badge } from "@/components/ui/Badge";
import { formatEuro } from "@/lib/funds";
import { SUBSCRIPTIONS, subscriptionTotals } from "@/lib/portal/demo";

/**
 * portal-subscriptions-table — suivi des souscriptions du cabinet : bandeau
 * KPI (engagement, appelé, distribué, NAV) puis tableau détaillé. Données de
 * démonstration (voir `lib/portal/demo.ts`).
 */
export default function SouscriptionsPage() {
  const totals = subscriptionTotals(SUBSCRIPTIONS);

  const kpis = [
    { value: totals.commitment, label: "Engagement total" },
    { value: totals.called, label: "Total appelé" },
    { value: totals.distributed, label: "Total distribué" },
    { value: totals.nav, label: "NAV" },
  ];

  return (
    <PageShell className="py-14">
      <Eyebrow>Cabinet</Eyebrow>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
          Mes <em className="pc">souscriptions</em>
        </h1>
        <Button variant="ghost">Export CSV</Button>
      </div>

      {/* Bandeau KPI */}
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-card border border-black/10 bg-white p-6"
          >
            <Stat size="sm" value={formatEuro(k.value)} label={k.label} />
          </div>
        ))}
      </div>

      {/* Tableau des souscriptions */}
      <div className="mt-8 flex items-end justify-between">
        <p className="text-[13px] text-muted">
          {SUBSCRIPTIONS.length} souscriptions
        </p>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse">
          <thead>
            <tr className="border-b border-black/15 text-left">
              {[
                "Fonds",
                "Investisseur",
                "Date",
                "Montant",
                "Frais d'entrée",
                "Appelé",
                "Valorisation",
                "Statut",
              ].map((h) => (
                <th
                  key={h}
                  className="pb-3 text-[11px] uppercase tracking-[0.06em] text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SUBSCRIPTIONS.map((s) => (
              <tr
                key={s.id}
                className="border-b border-black/10 transition-colors hover:bg-white"
              >
                <td className="py-4">
                  <span className="font-medium">{s.fundName}</span>
                  <span className="mt-0.5 block text-[12px] text-muted">
                    {s.shareClass} · Réf. {s.reference}
                  </span>
                </td>
                <td className="py-4 text-slate">{s.investor}</td>
                <td className="py-4 text-slate">
                  {format(new Date(s.date), "d MMM yyyy", { locale: fr })}
                </td>
                <td className="py-4 font-medium tracking-[-0.02em]">
                  {formatEuro(s.amount)}
                </td>
                <td className="py-4 text-slate">
                  {s.entryFee > 0 ? formatEuro(s.entryFee) : "—"}
                </td>
                <td className="py-4 text-slate">
                  {s.called > 0 ? formatEuro(s.called) : "—"}
                </td>
                <td className="py-4 text-slate">
                  {s.nav > 0 ? formatEuro(s.nav) : "—"}
                </td>
                <td className="py-4">
                  <Badge tone={s.status.tone}>{s.status.label}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
