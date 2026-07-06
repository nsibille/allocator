import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Stat } from "@/components/ui/Stat";
import { createClient } from "@/lib/supabase/server";
import { projectPortfolio } from "@/lib/projection/engine";
import { buildNarrative } from "@/lib/narrative/build";
import {
  BUCKET_COLOR_VAR,
  BUCKET_LABEL,
  formatEuro,
  formatMultiple,
  formatPercent,
  PACING_LABEL,
} from "@/lib/funds";
import type {
  AllocationInput,
  Fund,
  Objective,
  PacingProfile,
} from "@/types/domain";

/**
 * Note d'allocation (§8.3) — vue lecture seule d'étape.
 * Édition live + graphiques Recharts + contrôles de projection : étape suivante.
 */
export default async function AllocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: allocation } = await supabase
    .from("allocations")
    .select("*")
    .eq("id", id)
    .single();
  if (!allocation) notFound();

  const { data: lineRows } = await supabase
    .from("allocation_lines")
    .select("fund_id, amount, funds(*)")
    .eq("allocation_id", id);

  const lines = (lineRows ?? []).map((r) => ({
    fundId: r.fund_id,
    amount: Number(r.amount),
  }));
  const fundsById = new Map<string, Fund>(
    (lineRows ?? [])
      .map((r) => r.funds as Fund | null)
      .filter((f): f is Fund => Boolean(f))
      .map((f) => [f.id, f]),
  );

  const input: AllocationInput = {
    envelope: Number(allocation.envelope_amount),
    riskProfile: allocation.risk_profile,
    objectives: (allocation.objectives as Objective[]) ?? [],
    strategies: (allocation.strategies as PacingProfile[]) ?? [],
    esg: allocation.esg,
    diversification: allocation.diversification as AllocationInput["diversification"],
  };

  const projection = projectPortfolio(lines, fundsById, {
    scenario: (allocation.scenario as "prudent" | "central" | "optimiste") ?? "central",
    distPace: allocation.dist_pace ?? 0,
  });
  const m = projection.metrics;
  const narrative = buildNarrative({
    input,
    lines,
    fundsById,
    metrics: m,
    horizonYears: allocation.horizon_years,
  });

  const sortedLines = lines
    .map((l) => ({ line: l, fund: fundsById.get(l.fundId) }))
    .filter((x): x is { line: typeof x.line; fund: Fund } => Boolean(x.fund))
    .sort((a, b) => a.fund.sort_order - b.fund.sort_order);

  return (
    <>
      {/* Couverture + KPIs — registre sombre */}
      <div style={{ background: "var(--hero-gradient)" }} className="text-white">
        <PageShell className="py-14">
          <Eyebrow>Note d&apos;allocation</Eyebrow>
          <h1 className="mt-3 text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
            {allocation.name}
          </h1>
          <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-5">
            <Stat value={formatEuro(m.committed)} label="Engagement total" />
            <Stat value={formatMultiple(m.tvpi)} label="TVPI cible" />
            <Stat value={formatPercent(m.netIrr)} label="TRI net estimé" />
            <Stat value={formatEuro(m.projectedValue)} label="Valeur projetée" />
            <Stat value={formatEuro(m.peakCapital)} label="Pic de trésorerie" />
          </div>
        </PageShell>
      </div>

      {/* Répartition — registre clair */}
      <PageShell className="py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <section>
            <h2 className="text-[26px] font-medium leading-[32px]">
              Répartition
            </h2>
            <ul className="mt-6 flex flex-col gap-3">
              {sortedLines.map(({ line, fund }) => (
                <li
                  key={fund.id}
                  className="rounded-card border border-black/10 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-coral">
                        {PACING_LABEL[fund.pacing]}
                      </p>
                      <p className="mt-1 font-medium">{fund.name}</p>
                      <p className="text-[13px] text-muted">{fund.manager}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[20px] font-medium tracking-[-0.02em]">
                        {formatEuro(line.amount)}
                      </p>
                      <p className="text-[13px] text-muted">
                        {formatPercent(line.amount / m.committed, 0)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-pill"
                      style={{ background: BUCKET_COLOR_VAR[fund.bucket] }}
                    />
                    <span className="text-[12px] text-muted">
                      Poche {BUCKET_LABEL[fund.bucket]} · closing{" "}
                      {fund.closing_label}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside>
            <h2 className="text-[26px] font-medium leading-[32px]">
              Discours
            </h2>
            <div className="mt-6 flex flex-col gap-4">
              {narrative.map((para, i) => (
                <p key={i} className="text-[15px] leading-[24px] text-slate">
                  {para}
                </p>
              ))}
            </div>
          </aside>
        </div>
      </PageShell>
    </>
  );
}
