import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Stat } from "@/components/ui/Stat";
import { Badge } from "@/components/ui/Badge";
import { formatEuro } from "@/lib/funds";
import { INVESTORS } from "@/lib/portal/demo";

/**
 * portal-investors-table — répertoire des investisseurs du cabinet : type
 * (personne physique / morale), conseiller référent, souscriptions et
 * engagement cumulé. Données de démonstration (voir `lib/portal/demo.ts`).
 */
export default function InvestisseursPage() {
  const totalSubs = INVESTORS.reduce((s, i) => s + i.subscriptions, 0);
  const totalCommitment = INVESTORS.reduce((s, i) => s + i.commitment, 0);

  return (
    <PageShell className="py-14">
      <Eyebrow>Cabinet</Eyebrow>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
          Mes <em className="pc">investisseurs</em>
        </h1>
        <Button>Nouvel investisseur</Button>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 rounded-card border border-black/10 bg-white p-6 md:grid-cols-3">
        <Stat size="sm" value={String(INVESTORS.length)} label="Investisseurs" />
        <Stat size="sm" value={String(totalSubs)} label="Souscriptions" />
        <Stat
          size="sm"
          value={formatEuro(totalCommitment)}
          label="Engagement cumulé"
        />
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="border-b border-black/15 text-left">
              {[
                "Investisseur",
                "Type",
                "Conseiller",
                "Souscriptions",
                "Engagement",
                "Dernier login",
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
            {INVESTORS.map((inv) => (
              <tr
                key={inv.id}
                className="border-b border-black/10 transition-colors hover:bg-white"
              >
                <td className="py-4">
                  <span className="font-medium">{inv.name}</span>
                  <span className="mt-0.5 block text-[12px] text-muted">
                    {inv.email}
                  </span>
                </td>
                <td className="py-4">
                  <Badge tone="neutral">
                    {inv.type === "morale"
                      ? "Personne morale"
                      : "Personne physique"}
                  </Badge>
                </td>
                <td className="py-4 text-slate">{inv.advisor}</td>
                <td className="py-4 text-slate">{inv.subscriptions}</td>
                <td className="py-4 font-medium tracking-[-0.02em]">
                  {formatEuro(inv.commitment)}
                </td>
                <td className="py-4 text-slate">
                  {inv.lastLogin
                    ? format(new Date(inv.lastLogin), "d MMM yyyy", {
                        locale: fr,
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
