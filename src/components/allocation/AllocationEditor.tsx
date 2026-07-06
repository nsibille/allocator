"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Stat } from "@/components/ui/Stat";
import { DoubleChevron } from "@/components/ui/DoubleChevron";
import { FundRow } from "./FundRow";
import { FundPicker } from "./FundPicker";
import { TotalIndicator } from "./TotalIndicator";
import { BucketDonut } from "./BucketDonut";
import { VintageTimeline } from "./VintageTimeline";
import { ScenarioControls } from "@/components/projection/ScenarioControls";
import { PaceControl } from "@/components/projection/PaceControl";
import { CashflowChart } from "@/components/projection/CashflowChart";
import { JCurveChart } from "@/components/projection/JCurveChart";
import { NarrativePanel } from "@/components/projection/NarrativePanel";
import { useAllocationStore } from "@/stores/allocation.store";
import { concentrationCap } from "@/lib/allocation/engine";
import { projectPortfolio } from "@/lib/projection/engine";
import { buildNarrative } from "@/lib/narrative/build";
import { activeFunds, formatEuro, formatMultiple, formatPercent } from "@/lib/funds";
import { saveAllocation } from "@/app/(app)/allocations/[id]/actions";
import type {
  AllocationInput,
  Fund,
  Objective,
  PacingProfile,
  Scenario,
} from "@/types/domain";

export interface AllocationEditorProps {
  allocationId: string;
  name: string;
  envelope: number;
  horizonYears: number;
  riskProfile: AllocationInput["riskProfile"];
  objectives: Objective[];
  strategies: PacingProfile[];
  esg: boolean;
  diversification: AllocationInput["diversification"];
  initialAmounts: Record<string, number>;
  initialScenario: Scenario;
  initialDistPace: number;
  funds: Fund[];
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function AllocationEditor(props: AllocationEditorProps) {
  const {
    allocationId,
    name,
    envelope,
    horizonYears,
    riskProfile,
    objectives,
    strategies,
    esg,
    diversification,
    funds,
  } = props;

  const store = useAllocationStore();
  const rev = store.rev;

  // Tant que le store n'est pas initialisé pour CETTE allocation, on affiche les
  // valeurs de props (cohérent SSR/hydratation, sans muter le store côté serveur).
  const storeReady = store.allocationId === allocationId;
  useEffect(() => {
    if (!storeReady) {
      store.init({
        allocationId,
        amounts: props.initialAmounts,
        scenario: props.initialScenario,
        distPace: props.initialDistPace,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeReady, allocationId]);

  const amounts = storeReady ? store.amounts : props.initialAmounts;
  const scenario = storeReady ? store.scenario : props.initialScenario;
  const distPace = storeReady ? store.distPace : props.initialDistPace;

  const fundsById = useMemo(() => new Map(funds.map((f) => [f.id, f])), [funds]);
  const cap = concentrationCap(envelope);

  const lines = useMemo(
    () =>
      Object.entries(amounts)
        .filter(([, a]) => a > 0)
        .map(([fundId, amount]) => ({ fundId, amount })),
    [amounts],
  );
  const total = lines.reduce((s, l) => s + l.amount, 0);

  const projection = useMemo(
    () => projectPortfolio(lines, fundsById, { scenario, distPace }),
    [lines, fundsById, scenario, distPace],
  );
  const m = projection.metrics;

  const narrative = useMemo(() => {
    const input: AllocationInput = {
      envelope,
      riskProfile,
      objectives,
      strategies,
      esg,
      diversification,
    };
    return buildNarrative({
      input,
      lines,
      fundsById,
      metrics: m,
      horizonYears,
    });
  }, [
    envelope,
    riskProfile,
    objectives,
    strategies,
    esg,
    diversification,
    lines,
    fundsById,
    m,
    horizonYears,
  ]);

  // Persistance debouncée (800 ms) sur chaque révision.
  const [status, setStatus] = useState<SaveStatus>("idle");
  useEffect(() => {
    if (rev === 0) return; // pas de sauvegarde à l'init
    setStatus("saving");
    const t = setTimeout(async () => {
      const res = await saveAllocation({
        allocationId,
        scenario,
        distPace,
        lines,
      });
      setStatus(res.ok ? "saved" : "error");
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rev]);

  const rows = activeFunds(funds).filter((f) => (amounts[f.id] ?? 0) > 0);
  const available = activeFunds(funds).filter((f) => amounts[f.id] == null);

  const statusLabel =
    status === "saving"
      ? "Enregistrement…"
      : status === "saved"
        ? "Enregistré"
        : status === "error"
          ? "Échec de l'enregistrement"
          : "";

  return (
    <>
      {/* Couverture + KPIs live — registre sombre */}
      <div style={{ background: "var(--hero-gradient)" }} className="text-white">
        <PageShell className="py-14">
          <div className="flex items-start justify-between gap-6">
            <div>
              <Eyebrow>Note d&apos;allocation</Eyebrow>
              <h1 className="mt-3 text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
                {name}
              </h1>
            </div>
            <div className="pt-2 text-right text-[13px] text-mist">
              {statusLabel && (
                <span className={status === "error" ? "text-coral" : ""}>
                  {statusLabel}
                </span>
              )}
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-5">
            <Stat value={formatEuro(m.committed)} label="Engagement total" />
            <Stat value={formatMultiple(m.tvpi)} label="TVPI cible" />
            <Stat value={formatPercent(m.netIrr)} label="TRI net estimé" />
            <Stat value={formatEuro(m.projectedValue)} label="Valeur projetée" />
            <Stat value={formatEuro(m.peakCapital)} label="Pic de trésorerie" />
          </div>
        </PageShell>
      </div>

      <PageShell className="py-14">
        {/* Projections */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[26px] font-medium leading-[32px]">Projections</h2>
            <div className="w-full max-w-[280px]">
              <PaceControl value={distPace} onChange={store.setPace} />
            </div>
          </div>
          <div className="mt-4">
            <ScenarioControls value={scenario} onChange={store.setScenario} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-card border border-black/10 bg-white p-5">
              <p className="mb-3 text-[12px] uppercase tracking-[0.06em] text-muted">
                Appels · distributions · VL
              </p>
              <CashflowChart rows={projection.rows} />
            </div>
            <div className="rounded-card border border-black/10 bg-white p-5">
              <p className="mb-3 text-[12px] uppercase tracking-[0.06em] text-muted">
                Courbe en J — trésorerie nette cumulée
              </p>
              <JCurveChart rows={projection.rows} />
            </div>
          </div>
        </section>

        {/* Répartition éditable */}
        <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="text-[26px] font-medium leading-[32px]">Répartition</h2>
            <ul className="mt-6 flex flex-col gap-3">
              {rows.map((fund) => (
                <FundRow
                  key={fund.id}
                  fund={fund}
                  amount={amounts[fund.id] ?? 0}
                  total={total}
                  cap={cap}
                  onChange={(a) => store.setAmount(fund.id, a)}
                  onRemove={() => store.removeFund(fund.id)}
                />
              ))}
            </ul>
            <div className="mt-6">
              <FundPicker
                available={available}
                onAdd={(f) => store.addFund(f.id, f.min_ticket)}
              />
            </div>
          </div>

          <aside className="flex flex-col gap-5">
            <TotalIndicator total={total} envelope={envelope} />
            <BucketDonut amounts={amounts} fundsById={fundsById} />
            <VintageTimeline amounts={amounts} fundsById={fundsById} />
            <div className="flex flex-col gap-2.5">
              <a
                href={`/api/pdf/proposal/${allocationId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-pill bg-coral px-7 py-[15px] text-[15px] font-medium text-white transition-colors hover:bg-coral-deep"
              >
                <span>Exporter la note (PDF)</span>
                <DoubleChevron />
              </a>
              <a
                href={`/api/pdf/bulletins/${allocationId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-pill border border-black/20 px-7 py-[15px] text-[15px] font-medium text-slate transition-colors hover:border-coral hover:text-coral"
              >
                <span>Générer les bulletins</span>
                <DoubleChevron />
              </a>
            </div>
          </aside>
        </section>

        {/* Discours — registre sombre */}
        <section className="mt-14">
          <NarrativePanel paragraphs={narrative} />
        </section>
      </PageShell>
    </>
  );
}
