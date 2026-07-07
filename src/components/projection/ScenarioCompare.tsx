"use client";

import { useMemo } from "react";
import { projectPortfolio } from "@/lib/projection/engine";
import { formatMultiple, formatPercent } from "@/lib/funds";
import type { AllocationLine, Fund, Scenario } from "@/types/domain";

/**
 * proj-scenario-compare — comparatif compact des trois scénarios (prudent /
 * central / optimiste). Le sélecteur reste le pilote de l'affichage détaillé ;
 * ces mini-cartes donnent le contraste TVPI / TRI sans tout afficher en même
 * temps. La carte active est signalée en corail et sélectionne au clic.
 */
const SCENARII: { value: Scenario; label: string }[] = [
  { value: "prudent", label: "Prudent" },
  { value: "central", label: "Central" },
  { value: "optimiste", label: "Optimiste" },
];

export function ScenarioCompare({
  lines,
  fundsById,
  distPace,
  value,
  onChange,
}: {
  lines: AllocationLine[];
  fundsById: Map<string, Fund>;
  distPace: number;
  value: Scenario;
  onChange: (s: Scenario) => void;
}) {
  const metrics = useMemo(
    () =>
      SCENARII.map((s) => ({
        ...s,
        m: projectPortfolio(lines, fundsById, {
          scenario: s.value,
          distPace,
        }).metrics,
      })),
    [lines, fundsById, distPace],
  );

  return (
    <div className="grid grid-cols-3 gap-3">
      {metrics.map(({ value: v, label, m }) => {
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(v)}
            className={[
              "rounded-card border p-4 text-left transition-colors",
              active
                ? "border-coral bg-coral-wash"
                : "border-black/10 bg-white hover:border-coral/50",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <span
                className={[
                  "text-[13px] font-medium",
                  active ? "text-coral" : "text-slate",
                ].join(" ")}
              >
                {label}
              </span>
              {active && (
                <span className="text-[11px] uppercase tracking-[0.12em] text-coral">
                  Affiché
                </span>
              )}
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-[11px] uppercase tracking-[0.06em] text-muted">
                TVPI
              </span>
              <span className="text-[18px] font-medium tracking-[-0.02em]">
                {formatMultiple(m.tvpi)}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-[11px] uppercase tracking-[0.06em] text-muted">
                TRI net
              </span>
              <span className="text-[15px] font-medium text-slate">
                {formatPercent(m.netIrr)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
