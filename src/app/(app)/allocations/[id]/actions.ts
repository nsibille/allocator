"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/* Persistance des ajustements de la note d'allocation (édition live, debounce). */

const schema = z.object({
  allocationId: z.string().uuid(),
  scenario: z.enum(["prudent", "central", "optimiste"]),
  distPace: z.number().int().min(-2).max(2),
  lines: z
    .array(
      z.object({
        fundId: z.string().uuid(),
        amount: z.number().min(0),
      }),
    )
    .max(50),
});

export type SaveAllocationInput = z.infer<typeof schema>;

export async function saveAllocation(
  raw: SaveAllocationInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Données invalides." };
  const { allocationId, scenario, distPace, lines } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Session expirée." };

  // Scénario + rythme sur l'allocation (RLS : cabinet de l'utilisateur uniquement).
  const { error: allocErr } = await supabase
    .from("allocations")
    .update({ scenario, dist_pace: distPace })
    .eq("id", allocationId);
  if (allocErr) return { ok: false, error: "Échec de la sauvegarde." };

  const kept = lines.filter((l) => l.amount > 0);
  const keptIds = kept.map((l) => l.fundId);

  // Supprime les lignes retirées ou mises à zéro.
  const delQuery = supabase
    .from("allocation_lines")
    .delete()
    .eq("allocation_id", allocationId);
  if (keptIds.length > 0) {
    await delQuery.not("fund_id", "in", `(${keptIds.join(",")})`);
  } else {
    await delQuery;
  }

  // Upsert des lignes conservées (contrainte unique allocation_id+fund_id).
  if (kept.length > 0) {
    const { error: upErr } = await supabase.from("allocation_lines").upsert(
      kept.map((l) => ({
        allocation_id: allocationId,
        fund_id: l.fundId,
        amount: l.amount,
      })),
      { onConflict: "allocation_id,fund_id" },
    );
    if (upErr) return { ok: false, error: "Échec de la sauvegarde des lignes." };
  }

  return { ok: true };
}
