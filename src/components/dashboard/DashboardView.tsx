import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Badge } from "@/components/ui/Badge";
import { DonutChart, HBarChart, type Segment } from "@/components/dashboard/charts";
import {
  BUCKET_LABEL,
  BUCKET_COLOR_VAR,
  BUCKET_ORDER,
  compactEuro,
  formatEuro,
  formatPercent,
  formatMultiple,
} from "@/lib/funds";
import { ALLOCATION_STATUS, RISK_PROFILE_LABEL } from "@/lib/status";
import {
  ADVISORS,
  CONVENTIONS,
  FUND_ACTIVITY,
  RETROCESSIONS,
  retrocessionsPaid,
  totalCollected,
} from "@/lib/portal/demo";
import type { AllocationRow } from "@/types/domain";
import type { ThemeColorKey } from "@/lib/useThemeColors";

/**
 * portal-dashboard — poste de pilotage du cabinet : collecte totale et fonds par
 * fonds, portefeuille clients (prospects / actifs / réinvestissement), fonds
 * ouverts & performance, performance des conseillers, rétrocessions et conventions.
 * Reçoit les agrégats clients & allocations réels (RLS) ; collecte / performance /
 * conventions proviennent du jeu de démonstration `lib/portal/demo.ts`.
 */
export type DashboardData = {
  clientsCount: number;
  byStatus: Record<string, number>;
  reinvestCount: number;
  allocationsCount: number;
  proposedCount: number;
  recentAllocations: Pick<
    AllocationRow,
    "id" | "name" | "envelope_amount" | "risk_profile" | "status" | "updated_at"
  >[];
};

/** Raccourcit les libellés de fonds pour l'axe des barres. */
function shortFund(name: string): string {
  return name
    .replace(/^Private Corner (Wealth )?/, "")
    .replace(/^PC Feeder /, "")
    .replace(/^Blue Owl /, "");
}

export function DashboardView({ data }: { data: DashboardData }) {
  const { byStatus } = data;

  const segments: Segment[] = [
    { name: "Prospects", value: byStatus.prospect ?? 0, colorKey: "muted" },
    { name: "Clients actifs", value: byStatus.actif ?? 0, colorKey: "teal" },
    { name: "Archivés", value: byStatus.archive ?? 0, colorKey: "mist" },
  ];

  const collecteTotale = totalCollected();
  const collectionData = [...FUND_ACTIVITY]
    .sort((a, b) => b.collected - a.collected)
    .map((f) => ({
      name: shortFund(f.name),
      value: f.collected,
      colorKey: `bucket-${f.bucket}` as ThemeColorKey,
    }));
  const openFunds = FUND_ACTIVITY.filter((f) => f.open);

  const advisorData = [...ADVISORS]
    .filter((a) => a.collected > 0)
    .sort((a, b) => b.collected - a.collected)
    .map((a) => ({ name: a.name, value: a.collected }));

  const retroTotal = RETROCESSIONS.reduce((s, r) => s + r.amount, 0);
  const retroPaid = retrocessionsPaid(RETROCESSIONS);
  const retroPending = retroTotal - retroPaid;
  const retroPaidPct = retroTotal > 0 ? retroPaid / retroTotal : 0;
  const retroByType = Object.entries(
    RETROCESSIONS.reduce<Record<string, number>>((acc, r) => {
      acc[r.type] = (acc[r.type] ?? 0) + r.amount;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const conventionsTodo = CONVENTIONS.filter((c) => c.actionNeeded).length;

  const kpis = [
    {
      value: compactEuro(collecteTotale),
      label: "Collecte totale",
      hint: `${FUND_ACTIVITY.length} fonds · ${openFunds.length} ouverts`,
    },
    {
      value: compactEuro(retroTotal),
      label: "Rétrocessions",
      hint: `${compactEuro(retroPaid)} réglées`,
    },
    {
      value: String(data.clientsCount),
      label: "Portefeuille clients",
      hint: `${byStatus.prospect ?? 0} prospects · ${byStatus.actif ?? 0} actifs`,
    },
    {
      value: String(data.allocationsCount),
      label: "Allocations",
      hint: `${data.proposedCount} proposées`,
    },
  ];

  return (
    <PageShell className="py-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Cabinet</Eyebrow>
          <h1 className="mt-3 text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
            Poste de <em className="pc">pilotage</em>
          </h1>
        </div>
        <Link href="/clients">
          <Button>Nouvelle allocation</Button>
        </Link>
      </div>

      {/* KPI strip */}
      <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-black/10 bg-black/10 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white p-6">
            <p className="text-[32px] font-medium leading-none tracking-[-0.02em]">
              {k.value}
            </p>
            <p className="mt-3 text-[13px] font-medium text-slate">{k.label}</p>
            <p className="mt-0.5 text-[12px] text-muted">{k.hint}</p>
          </div>
        ))}
      </div>

      {/* Clients + collecte par fonds */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel kicker="Répartition" title="Portefeuille clients">
          {data.clientsCount === 0 ? (
            <p className="py-10 text-center text-[14px] text-muted">
              Aucun client pour l&apos;instant.
            </p>
          ) : (
            <>
              <DonutChart segments={segments} />
              <ul className="mt-5 flex flex-col gap-2.5">
                {segments.map((s) => (
                  <li
                    key={s.name}
                    className="flex items-center gap-2.5 text-[14px]"
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-pill"
                      style={{ background: `var(--color-${s.colorKey})` }}
                    />
                    <span className="text-slate">{s.name}</span>
                    <span className="ml-auto font-medium">{s.value}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center justify-between rounded-field border border-coral/30 bg-coral-wash px-4 py-3">
                <span className="text-[13px] text-slate">Prêts à réinvestir</span>
                <span className="text-[18px] font-medium text-coral">
                  {data.reinvestCount}
                </span>
              </div>
            </>
          )}
        </Panel>

        <Panel
          className="lg:col-span-2"
          kicker="Collecte"
          title="Collecte par fonds"
          action={<BucketLegend />}
        >
          <HBarChart data={collectionData} format="euro" labelWidth={188} />
        </Panel>
      </div>

      {/* Fonds ouverts + rétrocessions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          kicker="Gamme"
          title="Fonds ouverts à la collecte"
          action={
            <Link href="/fonds" className="text-[13px] text-coral hover:opacity-70">
              Voir la gamme
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b border-black/15 text-left">
                  {["Fonds", "Poche", "Collecte", "TRI cible", "TVPI", "Statut"].map(
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
                {FUND_ACTIVITY.map((f) => (
                  <tr key={f.id} className="border-b border-black/10">
                    <td className="py-3.5">
                      <span className="font-medium">{shortFund(f.name)}</span>
                      <span className="mt-0.5 block text-[12px] text-muted">
                        {f.manager}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-slate">
                        <span
                          className="inline-block h-2 w-2 rounded-pill"
                          style={{ background: BUCKET_COLOR_VAR[f.bucket] }}
                        />
                        {BUCKET_LABEL[f.bucket]}
                      </span>
                    </td>
                    <td className="py-3.5 font-medium tracking-[-0.02em]">
                      {compactEuro(f.collected)}
                    </td>
                    <td className="py-3.5 text-slate">
                      {formatPercent(f.targetIrr, 0)}
                    </td>
                    <td className="py-3.5 text-slate">
                      {f.tvpi != null ? formatMultiple(f.tvpi) : "—"}
                    </td>
                    <td className="py-3.5">
                      <Badge tone={f.open ? "active" : "neutral"}>
                        {f.open ? "Ouvert" : "Clôturé"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel
          kicker="Cabinet"
          title="Rétrocessions"
          action={
            <Link
              href="/retrocessions"
              className="text-[13px] text-coral hover:opacity-70"
            >
              Détail
            </Link>
          }
        >
          <p className="text-[32px] font-medium leading-none tracking-[-0.02em]">
            {compactEuro(retroTotal)}
          </p>
          <p className="mt-2 text-[13px] text-muted">Dues au cabinet</p>

          <div className="mt-5 h-2 w-full overflow-hidden rounded-pill bg-black/10">
            <div
              className="h-full rounded-pill bg-coral"
              style={{ width: `${Math.round(retroPaidPct * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[13px]">
            <span className="text-slate">{compactEuro(retroPaid)} réglées</span>
            <span className="text-muted">
              {compactEuro(retroPending)} en attente
            </span>
          </div>

          <div className="mt-6 border-t border-black/10 pt-4">
            <p className="mb-3 text-[11px] uppercase tracking-[0.06em] text-muted">
              Par nature
            </p>
            <ul className="flex flex-col gap-2.5 text-[14px]">
              {retroByType.map(([type, amount]) => (
                <li key={type} className="flex items-center justify-between">
                  <span className="text-slate">{type}</span>
                  <span className="font-medium">{compactEuro(amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      {/* Conseillers + conventions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          kicker="Équipe"
          title="Performance des conseillers"
          action={
            <Link
              href="/conseillers"
              className="text-[13px] text-coral hover:opacity-70"
            >
              Voir l&apos;équipe
            </Link>
          }
        >
          <HBarChart data={advisorData} format="euro" labelWidth={150} />
          <p className="mt-3 text-[12px] text-muted">
            Collecte apportée sur l&apos;exercice en cours.
          </p>
        </Panel>

        <Panel
          kicker="Juridique"
          title="Conventions"
          action={
            conventionsTodo > 0 ? (
              <span className="rounded-pill bg-coral-wash px-3 py-1 text-[12px] font-medium text-coral">
                {conventionsTodo} à traiter
              </span>
            ) : undefined
          }
        >
          <ul className="flex flex-col divide-y divide-black/10">
            {CONVENTIONS.map((c) => (
              <li
                key={c.id}
                className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-medium">{c.title}</p>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {c.counterparty} · {c.due}
                  </p>
                </div>
                <Badge tone={c.status.tone}>{c.status.label}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Dernières allocations (réel) */}
      <Panel
        className="mt-6"
        kicker="Activité"
        title="Dernières allocations"
        action={
          <Link href="/clients" className="text-[13px] text-coral hover:opacity-70">
            Nouvelle allocation
          </Link>
        }
      >
        {data.recentAllocations.length === 0 ? (
          <p className="py-6 text-center text-[14px] text-muted">
            Aucune allocation pour l&apos;instant. Lancez le funnel depuis la fiche
            d&apos;un client.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-black/10">
            {data.recentAllocations.map((a) => {
              const status = ALLOCATION_STATUS[a.status];
              return (
                <li key={a.id}>
                  <Link
                    href={`/allocations/${a.id}`}
                    className="flex flex-wrap items-center justify-between gap-4 py-4 transition-colors hover:text-coral"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{a.name}</p>
                      <p className="mt-0.5 text-[13px] text-muted">
                        {RISK_PROFILE_LABEL[a.risk_profile] ?? a.risk_profile} ·
                        modifiée le{" "}
                        {format(new Date(a.updated_at), "d MMM yyyy", {
                          locale: fr,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[16px] font-medium tracking-[-0.02em] text-slate">
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
      </Panel>
    </PageShell>
  );
}

/* ---- Sous-composants présentiels ---------------------------------------- */

function Panel({
  title,
  kicker,
  action,
  children,
  className = "",
}: {
  title: string;
  kicker?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={["rounded-card border border-black/10 bg-white p-6", className].join(
        " ",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {kicker && (
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
              {kicker}
            </p>
          )}
          <h2 className="mt-1 text-[17px] font-medium text-slate">{title}</h2>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function BucketLegend() {
  return (
    <div className="hidden flex-wrap items-center gap-x-4 gap-y-1.5 sm:flex">
      {BUCKET_ORDER.map((b) => (
        <span key={b} className="flex items-center gap-1.5 text-[12px] text-muted">
          <span
            className="inline-block h-2 w-2 rounded-pill"
            style={{ background: BUCKET_COLOR_VAR[b] }}
          />
          {BUCKET_LABEL[b]}
        </span>
      ))}
    </div>
  );
}
