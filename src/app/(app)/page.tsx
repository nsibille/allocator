import {
  DashboardView,
  type DashboardData,
} from "@/components/dashboard/DashboardView";
import { createClient } from "@/lib/supabase/server";

/**
 * Accueil du portail = poste de pilotage du cabinet (portal-dashboard).
 * Charge les agrégats clients & allocations réels (RLS-scopés) puis délègue le
 * rendu à `DashboardView`. Le reste des indicateurs (collecte, performance,
 * conventions) provient du jeu de démonstration `lib/portal/demo.ts`.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data: clientsRaw }, { data: allocationsRaw }] = await Promise.all([
    supabase.from("clients").select("id, status"),
    supabase
      .from("allocations")
      .select("id, name, envelope_amount, risk_profile, status, updated_at, client_id")
      .order("updated_at", { ascending: false }),
  ]);

  const clients = clientsRaw ?? [];
  const allocations = allocationsRaw ?? [];

  const byStatus: Record<string, number> = { prospect: 0, actif: 0, archive: 0 };
  for (const c of clients) byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;

  // Investisseurs déjà engagés = clients prêts à réinvestir (pipeline de réemploi).
  const reinvestIds = new Set(
    allocations
      .filter((a) => a.status === "subscribed" || a.status === "validated")
      .map((a) => a.client_id)
      .filter(Boolean),
  );

  const data: DashboardData = {
    clientsCount: clients.length,
    byStatus,
    reinvestCount: reinvestIds.size,
    allocationsCount: allocations.length,
    proposedCount: allocations.filter((a) => a.status === "proposed").length,
    recentAllocations: allocations.slice(0, 5).map((a) => ({
      id: a.id,
      name: a.name,
      envelope_amount: a.envelope_amount,
      risk_profile: a.risk_profile,
      status: a.status,
      updated_at: a.updated_at,
    })),
  };

  return <DashboardView data={data} />;
}
