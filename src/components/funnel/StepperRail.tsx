"use client";

import { STEPS } from "@/lib/funnel/steps.config";
import { useFunnelStore } from "@/stores/funnel.store";
import { isStepValid } from "@/lib/funnel/schema";

/**
 * funnel-stepper-rail (layout-sidebar-progress) — rail de progression latéral.
 * Étape active soulignée corail ; étapes franchies cliquables.
 */
export function StepperRail() {
  const state = useFunnelStore();
  const { step, goTo } = state;

  return (
    <nav aria-label="Progression" className="flex flex-col gap-1">
      {STEPS.map((s, i) => {
        const active = i === step;
        const reachable = i <= step || isStepValid(i - 1, state);
        return (
          <button
            key={s.slug}
            type="button"
            disabled={!reachable}
            onClick={() => reachable && goTo(i)}
            className={[
              "flex items-center gap-3 rounded-field px-3 py-2.5 text-left transition-colors",
              active ? "bg-coral-wash" : "hover:bg-black/5",
              reachable ? "cursor-pointer" : "cursor-not-allowed opacity-50",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-pill border text-[12px] font-medium",
                active
                  ? "border-coral bg-coral text-white"
                  : "border-black/20 text-muted",
              ].join(" ")}
            >
              {i + 1}
            </span>
            <span
              className={[
                "text-[13px] leading-tight",
                active ? "text-coral" : "text-slate",
              ].join(" ")}
            >
              {s.title}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
