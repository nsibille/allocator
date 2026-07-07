"use client";

import { formatEuro } from "@/lib/funds";
import type { Fund } from "@/types/domain";

/**
 * alloc-vintage-timeline — échelonnement des millésimes (closings). Points corail.
 * Signature produit (avec proj-chart-jcurve) — DESIGN_SYSTEM §8.
 */
export function VintageTimeline({
  amounts,
  fundsById,
}: {
  amounts: Record<string, number>;
  fundsById: Map<string, Fund>;
}) {
  const nodes = Object.entries(amounts)
    .map(([id, amount]) => ({ fund: fundsById.get(id), amount }))
    .filter((n): n is { fund: Fund; amount: number } => Boolean(n.fund))
    .sort((a, b) => {
      // closing_date croissant ; "En continu" (null) en fin.
      const da = a.fund.closing_date ?? "9999-99-99";
      const db = b.fund.closing_date ?? "9999-99-99";
      return da.localeCompare(db);
    });

  if (nodes.length === 0) return null;

  return (
    <div className="rounded-card border border-black/10 bg-white p-5">
      <p className="text-[12px] uppercase tracking-[0.06em] text-muted">
        Timeline des millésimes
      </p>
      <div className="mt-5 overflow-x-auto pb-2">
        <div className="relative flex min-w-max gap-8">
          {/* ligne de base */}
          <div className="absolute left-0 right-0 top-1.5 h-px bg-black/10" />
          {nodes.map(({ fund, amount }) => (
            <div key={fund.id} className="relative flex w-40 flex-col gap-1.5">
              <span className="h-3 w-3 rounded-pill border-2 border-coral bg-cream" />
              <span className="text-[13px] font-medium text-coral">
                {fund.closing_label}
              </span>
              <span className="truncate text-[13px] text-slate" title={fund.name}>
                {fund.name}
              </span>
              <span className="text-[12px] text-muted">{formatEuro(amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
