import { createClient } from "@/lib/supabase/server";
import { activeFunds } from "@/lib/funds";
import { projectPortfolio } from "@/lib/projection/engine";
import { buildNarrative } from "@/lib/narrative/build";
import type {
  AllocationInput,
  AllocationQualification,
  Fund,
  Objective,
  PacingProfile,
  ProjectionMetrics,
  Scenario,
} from "@/types/domain";

const SCENARIOS: Scenario[] = ["prudent", "central", "optimiste"];

export interface ProposalData {
  allocation: {
    id: string;
    name: string;
    envelope: number;
    riskProfile: string;
    horizonYears: number;
    scenario: Scenario;
    distPace: number;
  };
  cabinet: { name: string; orias: string | null } | null;
  conseiller: { full_name: string | null; email: string | null } | null;
  client: { reference: string } | null;
  lines: { fund: Fund; amount: number }[];
  metrics: ProjectionMetrics;
  narrative: string[];
  /** Qualification enrichie (profil type, score, catégorisation) — pour le rapport MiFID. */
  qualification: AllocationQualification | null;
  /** Métriques des trois scénarios (rapport MiFID). */
  scenarios: { scenario: Scenario; metrics: ProjectionMetrics }[];
}

/** Charge et compose toutes les données nécessaires au PDF pour une allocation (RLS-scopé). */
export async function loadProposalData(id: string): Promise<ProposalData | null> {
  const supabase = await createClient();

  const { data: allocation } = await supabase
    .from("allocations")
    .select("*")
    .eq("id", id)
    .single();
  if (!allocation) return null;

  const [{ data: lineRows }, { data: cabinet }, { data: conseiller }, { data: client }] =
    await Promise.all([
      supabase
        .from("allocation_lines")
        .select("fund_id, amount, funds(*)")
        .eq("allocation_id", id),
      supabase
        .from("cabinets")
        .select("name, orias")
        .eq("id", allocation.cabinet_id)
        .single(),
      allocation.conseiller_id
        ? supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", allocation.conseiller_id)
            .single()
        : Promise.resolve({ data: null }),
      allocation.client_id
        ? supabase
            .from("clients")
            .select("reference")
            .eq("id", allocation.client_id)
            .single()
        : Promise.resolve({ data: null }),
    ]);

  const rawLines = (lineRows ?? []).map((r) => ({
    fund: r.funds as Fund | null,
    amount: Number(r.amount),
  }));
  const lines = activeFunds(
    rawLines.map((l) => l.fund).filter((f): f is Fund => Boolean(f)),
  )
    .map((fund) => ({
      fund,
      amount: rawLines.find((l) => l.fund?.id === fund.id)?.amount ?? 0,
    }))
    .filter((l) => l.amount > 0);

  const fundsById = new Map(lines.map((l) => [l.fund.id, l.fund]));
  const engineLines = lines.map((l) => ({ fundId: l.fund.id, amount: l.amount }));

  const distPace = allocation.dist_pace ?? 0;
  const projection = projectPortfolio(engineLines, fundsById, {
    scenario: (allocation.scenario as Scenario) ?? "central",
    distPace,
  });

  // Métriques par scénario (rapport MiFID : tableau de comparaison).
  const scenarios = SCENARIOS.map((scenario) => ({
    scenario,
    metrics: projectPortfolio(engineLines, fundsById, { scenario, distPace })
      .metrics,
  }));

  const input: AllocationInput = {
    envelope: Number(allocation.envelope_amount),
    riskProfile: allocation.risk_profile,
    objectives: (allocation.objectives as Objective[]) ?? [],
    strategies: (allocation.strategies as PacingProfile[]) ?? [],
    esg: allocation.esg,
    diversification: allocation.diversification as AllocationInput["diversification"],
  };
  const narrative = buildNarrative({
    input,
    lines: engineLines,
    fundsById,
    metrics: projection.metrics,
    horizonYears: allocation.horizon_years,
  });

  return {
    allocation: {
      id: allocation.id,
      name: allocation.name,
      envelope: Number(allocation.envelope_amount),
      riskProfile: allocation.risk_profile,
      horizonYears: allocation.horizon_years,
      scenario: (allocation.scenario as Scenario) ?? "central",
      distPace: allocation.dist_pace ?? 0,
    },
    cabinet: cabinet ?? null,
    conseiller: conseiller ?? null,
    client: client ?? null,
    lines,
    metrics: projection.metrics,
    narrative,
    qualification:
      (allocation.qualification as AllocationQualification | null) ?? null,
    scenarios,
  };
}
