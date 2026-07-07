import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Stat } from "@/components/ui/Stat";
import { Badge } from "@/components/ui/Badge";
import { formatEuro } from "@/lib/funds";
import { ADVISORS } from "@/lib/portal/demo";

/**
 * portal-advisors-table — gestion des conseillers rattachés au cabinet :
 * portefeuille (investisseurs), encours, dernier accès et statut. Données de
 * démonstration (voir `lib/portal/demo.ts`).
 */
export default function ConseillersPage() {
  const activeCount = ADVISORS.filter((a) => a.status.tone === "active").length;
  const totalAum = ADVISORS.reduce((s, a) => s + a.aum, 0);

  return (
    <PageShell className="py-14">
      <Eyebrow>Cabinet</Eyebrow>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
          Gérer mes <em className="pc">conseillers</em>
        </h1>
        <Button>Inviter un conseiller</Button>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 rounded-card border border-black/10 bg-white p-6 md:grid-cols-3">
        <Stat size="sm" value={String(ADVISORS.length)} label="Conseillers" />
        <Stat size="sm" value={String(activeCount)} label="Actifs" />
        <Stat size="sm" value={formatEuro(totalAum)} label="Encours conseillé" />
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-black/15 text-left">
              {["Conseiller", "Rôle", "Investisseurs", "Encours", "Dernier accès", "Statut"].map(
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
            {ADVISORS.map((a) => (
              <tr
                key={a.id}
                className="border-b border-black/10 transition-colors hover:bg-white"
              >
                <td className="py-4">
                  <span className="font-medium">{a.name}</span>
                  <span className="mt-0.5 block text-[12px] text-muted">
                    {a.email}
                  </span>
                </td>
                <td className="py-4 text-slate">{a.role}</td>
                <td className="py-4 text-slate">{a.investors}</td>
                <td className="py-4 text-slate">
                  {a.aum > 0 ? formatEuro(a.aum) : "—"}
                </td>
                <td className="py-4 text-slate">
                  {a.lastLogin
                    ? format(new Date(a.lastLogin), "d MMM yyyy", { locale: fr })
                    : "—"}
                </td>
                <td className="py-4">
                  <Badge tone={a.status.tone}>{a.status.label}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
