import { notFound } from "next/navigation";
import { AllocationEditor } from "@/components/allocation/AllocationEditor";
import { createClient } from "@/lib/supabase/server";
import { activeFunds } from "@/lib/funds";
import type {
  Fund,
  Objective,
  PacingProfile,
  Scenario,
} from "@/types/domain";

/**
 * Note d'allocation (§8.3) — édition live des lignes + projections temps réel + discours.
 * Le serveur charge l'allocation, ses lignes et la gamme active ; l'éditeur (client) recompose.
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

  const [{ data: lineRows }, { data: fundRows }] = await Promise.all([
    supabase
      .from("allocation_lines")
      .select("fund_id, amount")
      .eq("allocation_id", id),
    supabase.from("funds").select("*").eq("is_active", true),
  ]);

  const initialAmounts: Record<string, number> = {};
  for (const r of lineRows ?? []) initialAmounts[r.fund_id] = Number(r.amount);

  const funds = activeFunds((fundRows ?? []) as Fund[]);

  return (
    <AllocationEditor
      allocationId={allocation.id}
      name={allocation.name}
      envelope={Number(allocation.envelope_amount)}
      horizonYears={allocation.horizon_years}
      riskProfile={allocation.risk_profile}
      objectives={(allocation.objectives as Objective[]) ?? []}
      strategies={(allocation.strategies as PacingProfile[]) ?? []}
      esg={allocation.esg}
      diversification={
        allocation.diversification as "concentre" | "equilibre" | "large"
      }
      initialAmounts={initialAmounts}
      initialScenario={(allocation.scenario as Scenario) ?? "central"}
      initialDistPace={allocation.dist_pace ?? 0}
      funds={funds}
    />
  );
}
