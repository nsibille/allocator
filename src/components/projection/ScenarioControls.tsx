"use client";

import type { Scenario } from "@/types/domain";

/**
 * proj-controls-scenario (ui-tabs) — prudent / central / optimiste.
 * Actif = texte renforcé + soulignement corail.
 */
const OPTIONS: { value: Scenario; label: string }[] = [
  { value: "prudent", label: "Prudent" },
  { value: "central", label: "Central" },
  { value: "optimiste", label: "Optimiste" },
];

export function ScenarioControls({
  value,
  onChange,
}: {
  value: Scenario;
  onChange: (s: Scenario) => void;
}) {
  return (
    <div role="tablist" className="flex gap-6 border-b border-black/10">
      {OPTIONS.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(o.value)}
            className={[
              "-mb-px border-b-2 pb-2.5 text-[14px] transition-colors",
              active
                ? "border-coral font-medium text-slate"
                : "border-transparent text-muted hover:text-slate",
            ].join(" ")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
