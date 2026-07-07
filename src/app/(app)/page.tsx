import Link from "next/link";
import { type ReactNode } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Badge } from "@/components/ui/Badge";
import { CollectionTrendChart } from "@/components/dashboard/CollectionTrendChart";
import { ClientMixDonut } from "@/components/dashboard/ClientMixDonut";
import { BarList, type BarItem } from "@/components/dashboard/BarList";
import { createClient } from "@/lib/supabase/server";
import {
  activeFunds,
  formatEuro,
  formatEuroCompact,
  formatMultiple,
  formatPercent,
} from "@/lib/funds";
import { assetClassFor } from "@/lib/catalog";
import { CONVENTION_STAGE } from "@/lib/portal/demo";
import {
  advisorTotals,
  advisorsByAum,
  collectionByFund,
  collectionSeries,
  conventionsByStage,
  retrocessionSplit,
  segmentClients,
  totalCollection,
  type ClientSegmentInput,
} from "@/lib/portal/dashboard";
import type { Fund } from "@/types/domain";

/**
 * portal-dashboard — tableau de bord de pilotage du cabinet (page d'accueil CGP).
 * Bandeau sombre de synthèse + courbe de collecte, base clients segmentée,
 * collecte fonds par fonds, fonds ouverts & performance, performance des
 * conseillers, rétrocessions et conventions. Registre clair `cream`, bandeau de
 * tête sombre (§3). Clients réels (RLS) ; collecte / rétrocessions / conseillers /
 * conventions = données de démonstration du portail (`lib/portal`).
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: clientRows }, { data: fundRows }] = await Promise.all([
    supabase.from("clients").select("status, liquidity, patrimoine_financier"),
    supabase.from("funds").select("*").eq("is_active", true),
  ]);

  const funds = activeFunds((fundRows ?? []) as Fund[]);
  const { segments, totalClients } = segmentClients(
    (clientRows ?? []) as ClientSegmentInput[],
  );
  const prospect = segments.find((s) => s.key === "prospect")!;
  const client = segments.find((s) => s.key === "client")!;
  const reinvest = segments.find((s) => s.key === "reinvest")!;

  const collectTotal = totalCollection();
  const trend = collectionSeries(collectTotal);
  const byFund = collectionByFund();
  const retro = retrocessionSplit();
  const advisors = advisorsByAum();
  const advTotals = advisorTotals();
  const conventionGroups = conventionsByStage();

  // Collecte par fonds indexée par nom, pour enrichir la table des fonds ouverts.
  const collectByName = new Map(byFund.map((f) => [f.fundName, f]));
  const maxFundCollect = byFund[0]?.amount ?? 1;
  const maxAdvisorAum = advisors[0]?.aum ?? 1;

  const fundBars: BarItem[] = byFund.slice(0, 6).map((f) => ({
    key: f.fundName,
    label: f.fundName,
    value: formatEuroCompact(f.amount),
    ratio: f.amount / maxFundCollect,
    meta: `${formatPercent(f.share, 0)} de la collecte · ${f.subscriptions} souscription${f.subscriptions > 1 ? "s" : ""}`,
  }));

  const advisorBars: BarItem[] = advisors
    .filter((a) => a.aum > 0)
    .map((a) => ({
      key: a.id,
      label: a.name,
      sublabel: a.role,
      value: formatEuroCompact(a.aum),
      ratio: a.aum / maxAdvisorAum,
      meta: `${a.investors} investisseurs`,
    }));

  return (
    <PageShell className="py-14">
      {/* En-tête */}
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Cabinet · Pilotage</Eyebrow>
          <h1 className="mt-4 text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
            Votre <em className="pc">tableau de bord</em>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="rounded-pill border border-black/10 px-4 py-2 text-[12px] uppercase tracking-[0.06em] text-muted">
            Exercice 2026
          </span>
          <Link href="/clients">
            <Button>Nouvelle allocation</Button>
          </Link>
        </div>
      </header>

      {/* Bandeau de synthèse (registre sombre) + courbe de collecte */}
      <section
        className="mt-10 rounded-glass border border-white/10 p-8 text-white md:p-10"
        style={{ background: "var(--hero-gradient)" }}
      >
        <div className="grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4">
          <HeroStat
            value={formatEuroCompact(collectTotal)}
            label="Collecte totale"
            hint="engagements cumulés · exercice 2026"
          />
          <HeroStat
            value={formatEuroCompact(advTotals.aum)}
            label="Encours conseillé"
            hint={`${advTotals.investors} investisseurs suivis`}
          />
          <HeroStat
            value={formatEuroCompact(retro.total)}
            label="Rétrocessions"
            hint={`${formatEuroCompact(retro.paid)} déjà réglés`}
          />
          <HeroStat
            value={String(totalClients)}
            label="Base clients"
            hint={`${prospect.count} prospects · ${client.count} clients`}
          />
        </div>

        <div className="mt-10 border-t border-white/10 pt-8">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[12px] uppercase tracking-[0.06em] text-mist">
              Collecte cumulée — 12 mois glissants
            </p>
            <p className="text-[13px] text-mist">
              <span className="font-medium text-white">
                {formatEuroCompact(collectTotal)}
              </span>{" "}
              à fin juin
            </p>
          </div>
          <CollectionTrendChart points={trend} />
        </div>
      </section>

      {/* Base clients — Prospects · Clients · Prêts à réinvestir */}
      <Panel
        className="mt-10"
        title="Votre base clients"
        subtitle="Prospects à convertir, clients actifs et cible de réinvestissement."
        action={{ href: "/clients", label: "Voir les clients" }}
      >
        <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-center">
          <div>
            <ClientMixDonut
              slices={[
                { label: "Prospects", value: prospect.count, colorKey: "muted" },
                { label: "Clients", value: client.count, colorKey: "teal" },
              ]}
              centerValue={String(totalClients)}
              centerLabel="dossiers"
            />
            <div className="mt-4 flex justify-center gap-5 text-[12px] text-muted">
              <LegendDot token="--color-muted" label="Prospects" />
              <LegendDot token="--color-teal" label="Clients" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <SegmentTile
              count={prospect.count}
              label={prospect.label}
              hint={prospect.hint}
              patrimoine={prospect.patrimoine}
            />
            <SegmentTile
              count={client.count}
              label={client.label}
              hint={client.hint}
              patrimoine={client.patrimoine}
            />
            <SegmentTile
              count={reinvest.count}
              label={reinvest.label}
              hint={reinvest.hint}
              patrimoine={reinvest.patrimoine}
              emphasis
              meter={client.count > 0 ? reinvest.count / client.count : 0}
              meterLabel={`${reinvest.count} clients sur ${client.count}`}
            />
          </div>
        </div>
      </Panel>

      {/* Collecte fonds par fonds + Rétrocessions */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Collecte par fonds"
          subtitle={`${formatEuroCompact(collectTotal)} collectés sur la gamme`}
        >
          <BarList items={fundBars} />
        </Panel>

        <Panel
          title="Rétrocessions"
          subtitle="Droits d'entrée & frais de gestion"
          action={{ href: "/retrocessions", label: "Détail" }}
        >
          <div className="text-[34px] font-medium leading-none tracking-[-0.02em]">
            {formatEuroCompact(retro.total)}
            <span className="ml-2 align-middle text-[13px] font-normal uppercase tracking-[0.06em] text-muted">
              cumulées
            </span>
          </div>
          <div className="mt-5 flex h-2.5 w-full overflow-hidden rounded-pill bg-black/10">
            <div
              className="h-full bg-coral"
              style={{ width: `${Math.round(retro.paidShare * 100)}%` }}
            />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <SplitRow
              token="--color-coral"
              label="Réglé"
              value={formatEuro(retro.paid)}
            />
            <SplitRow
              token="--color-muted"
              label="En attente de règlement"
              value={formatEuro(retro.pending)}
            />
          </div>
        </Panel>
      </div>

      {/* Fonds ouverts à la collecte & performance cible */}
      <Panel
        className="mt-10"
        title="Fonds ouverts à la collecte"
        subtitle={`${funds.length} véhicules en levée · performance cible et collecte`}
        action={{ href: "/fonds", label: "La gamme" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-black/15 text-left">
                {[
                  "Fonds",
                  "Classe d'actif",
                  "TRI brut cible",
                  "Multiple cible",
                  "Clôture",
                  "Collecte",
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
              {funds.map((f) => {
                const collected = collectByName.get(f.name)?.amount ?? 0;
                return (
                  <tr
                    key={f.id}
                    className="border-b border-black/10 transition-colors hover:bg-white"
                  >
                    <td className="py-4 pr-4">
                      <span className="font-medium">{f.name}</span>
                      <span className="mt-0.5 block text-[12px] text-muted">
                        {f.manager}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-slate">
                      {assetClassFor(f.pacing)}
                    </td>
                    <td className="py-4 pr-4 font-medium tabular-nums">
                      {formatPercent(f.target_gross_irr)}
                    </td>
                    <td className="py-4 pr-4 tabular-nums text-slate">
                      {formatMultiple(f.target_multiple)}
                    </td>
                    <td className="py-4 pr-4 text-slate">{f.closing_label}</td>
                    <td className="min-w-[160px] py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-full overflow-hidden rounded-pill bg-black/10">
                          <div
                            className="h-full rounded-pill bg-coral/70"
                            style={{
                              width: `${Math.max(collected > 0 ? 4 : 0, Math.round((collected / maxFundCollect) * 100))}%`,
                            }}
                          />
                        </div>
                        <span className="w-16 shrink-0 text-right text-[12px] font-medium tabular-nums text-slate">
                          {collected > 0 ? formatEuroCompact(collected) : "—"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Performance des conseillers + Conventions */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Performance des conseillers"
          subtitle={`${advTotals.active} actifs · ${formatEuroCompact(advTotals.aum)} d'encours`}
          action={{ href: "/conseillers", label: "Gérer" }}
        >
          <BarList items={advisorBars} emphasis />
        </Panel>

        <Panel
          title="Conventions"
          subtitle="Accords de distribution avec les sociétés de gestion"
        >
          <div className="flex flex-col gap-6">
            {conventionGroups.map((group) => {
              if (group.items.length === 0) return null;
              const tone = CONVENTION_STAGE[group.stage].tone;
              return (
                <div key={group.stage}>
                  <div className="flex items-center gap-2">
                    <Badge tone={tone}>{group.label}</Badge>
                    <span className="text-[12px] text-muted">
                      {group.items.length} convention
                      {group.items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <ul className="mt-3 flex flex-col divide-y divide-black/10">
                    {group.items.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between gap-4 py-2.5"
                      >
                        <div className="min-w-0">
                          <span className="font-medium">{c.partner}</span>
                          <span className="mt-0.5 block truncate text-[12px] text-muted">
                            {c.scope}
                          </span>
                        </div>
                        <span className="shrink-0 text-[12px] text-muted">
                          {c.funds} fonds
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <p className="mt-16 max-w-3xl text-[12px] leading-[18px] text-muted">
        Tableau de bord de démonstration. Les clients sont des données réelles du
        cabinet (accès restreint) ; la collecte, les rétrocessions, la performance
        des conseillers et les conventions sont fournies à titre d'illustration.
        Investir en capital-investissement présente un risque de perte en capital
        et une liquidité réduite. Private Corner — société de gestion agréée AMF
        GP-20000038.
      </p>
    </PageShell>
  );
}

/* ------------------------------------------------------------------------- */

/** KPI du bandeau sombre : chiffre blanc, unité/hint atténués (registre sombre). */
function HeroStat({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint: string;
}) {
  return (
    <div>
      <div className="text-[38px] font-medium leading-none tracking-[-0.02em]">
        {value}
      </div>
      <div className="mt-3 text-[11px] uppercase tracking-[0.06em] text-mist">
        {label}
      </div>
      <div className="mt-1 text-[13px] text-mist/80">{hint}</div>
    </div>
  );
}

/** Carte de section claire : titre, sous-titre, lien optionnel. */
function Panel({
  title,
  subtitle,
  action,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={[
        "rounded-card border border-black/10 bg-white p-6 md:p-8",
        className,
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-medium leading-[28px] tracking-[-0.01em]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1.5 text-[14px] text-muted">{subtitle}</p>
          )}
        </div>
        {action && (
          <Link
            href={action.href}
            className="shrink-0 text-[13px] font-medium text-coral transition-opacity hover:opacity-70"
          >
            {action.label} →
          </Link>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Pastille de légende (couleur via token CSS). */
function LegendDot({ token, label }: { token: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-2 rounded-pill"
        style={{ background: `var(${token})` }}
      />
      {label}
    </span>
  );
}

/** Tuile de segment client (compteur, patrimoine, indice de réinvestissement). */
function SegmentTile({
  count,
  label,
  hint,
  patrimoine,
  emphasis = false,
  meter,
  meterLabel,
}: {
  count: number;
  label: string;
  hint: string;
  patrimoine: number;
  emphasis?: boolean;
  meter?: number;
  meterLabel?: string;
}) {
  return (
    <div
      className={[
        "rounded-field border p-5",
        emphasis
          ? "border-coral/40 bg-coral-wash"
          : "border-black/10 bg-cream-2/40",
      ].join(" ")}
    >
      <div
        className={[
          "text-[30px] font-medium leading-none tracking-[-0.02em]",
          emphasis ? "text-coral" : "",
        ].join(" ")}
      >
        {count}
      </div>
      <div className="mt-2 text-[13px] font-medium">{label}</div>
      <div className="mt-0.5 text-[12px] text-muted">{hint}</div>
      {meter != null ? (
        <>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-pill bg-black/10">
            <div
              className="h-full rounded-pill bg-coral"
              style={{ width: `${Math.round(meter * 100)}%` }}
            />
          </div>
          <div className="mt-1.5 text-[12px] text-muted">{meterLabel}</div>
        </>
      ) : (
        <div className="mt-3 text-[13px] font-medium tabular-nums text-slate">
          {formatEuroCompact(patrimoine)}
          <span className="ml-1 text-[11px] font-normal uppercase tracking-[0.06em] text-muted">
            patrimoine
          </span>
        </div>
      )}
    </div>
  );
}

/** Ligne de ventilation (pastille couleur + libellé + montant). */
function SplitRow({
  token,
  label,
  value,
}: {
  token: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 text-[14px]">
      <span
        className="inline-block h-2.5 w-2.5 rounded-pill"
        style={{ background: `var(${token})` }}
      />
      <span className="text-slate">{label}</span>
      <span className="ml-auto font-medium tabular-nums">{value}</span>
    </div>
  );
}
