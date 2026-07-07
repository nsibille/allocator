import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Stat } from "@/components/ui/Stat";
import { Badge } from "@/components/ui/Badge";
import { formatEuro } from "@/lib/funds";
import { RETROCESSIONS, retrocessionsPaid } from "@/lib/portal/demo";

/**
 * portal-retrocessions-table — suivi des rétrocessions dues au cabinet
 * (droits d'entrée, frais de gestion) : référence, statut de facturation,
 * date de paiement et montant. Données de démonstration (`lib/portal/demo.ts`).
 */
export default function RetrocessionsPage() {
  const total = RETROCESSIONS.reduce((s, r) => s + r.amount, 0);
  const paid = retrocessionsPaid(RETROCESSIONS);
  const pending = total - paid;

  return (
    <PageShell className="py-14">
      <Eyebrow>Cabinet</Eyebrow>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
          Mes <em className="pc">rétrocessions</em>
        </h1>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 rounded-card border border-black/10 bg-white p-6 md:grid-cols-3">
        <Stat size="sm" value={formatEuro(total)} label="Total rétrocessions" />
        <Stat size="sm" value={formatEuro(paid)} label="Réglé" />
        <Stat size="sm" value={formatEuro(pending)} label="En attente" />
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="border-b border-black/15 text-left">
              {[
                "Référence",
                "Type",
                "Date",
                "Fonds",
                "Statut",
                "Date paiement",
                "Souscriptions",
                "Montant",
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
            {RETROCESSIONS.map((r) => (
              <tr
                key={r.id}
                className="border-b border-black/10 transition-colors hover:bg-white"
              >
                <td className="py-4 font-medium">{r.reference}</td>
                <td className="py-4 text-slate">{r.type}</td>
                <td className="py-4 text-slate">
                  {format(new Date(r.date), "d MMM yyyy", { locale: fr })}
                </td>
                <td className="py-4 text-slate">{r.fundName}</td>
                <td className="py-4">
                  <Badge tone={r.status.tone}>{r.status.label}</Badge>
                </td>
                <td className="py-4 text-slate">
                  {r.paymentDate
                    ? format(new Date(r.paymentDate), "d MMM yyyy", {
                        locale: fr,
                      })
                    : "—"}
                </td>
                <td className="py-4 text-slate">{r.subscriptions}</td>
                <td className="py-4 font-medium tracking-[-0.02em]">
                  {formatEuro(r.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
