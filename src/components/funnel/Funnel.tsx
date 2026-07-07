"use client";

import { useState, useTransition } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TitleAccent } from "@/components/ui/TitleAccent";
import { STEPS } from "@/lib/funnel/steps.config";
import { validateStep } from "@/lib/funnel/schema";
import { STEP_COUNT, useFunnelStore } from "@/stores/funnel.store";
import { StepperRail } from "./StepperRail";
import { STEP_COMPONENTS } from "./steps";
import { createAllocation } from "@/app/(app)/allocations/new/actions";

export function Funnel() {
  const state = useFunnelStore();
  const { step, next, prev } = state;
  const [pending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const meta = STEPS[step];
  const StepBody = STEP_COMPONENTS[step];
  const validation = validateStep(step, state);
  const isLast = step === STEP_COUNT - 1;

  function handleNext() {
    if (!validation.success) return;
    if (!isLast) {
      next();
      return;
    }
    setSubmitError(null);
    startTransition(async () => {
      const res = await createAllocation({
        clientReference: state.clientReference,
        patrimoine: state.patrimoine,
        envelope: state.envelope,
        riskProfile: state.riskProfile!,
        experience: state.experience!,
        horizonYears: state.horizonYears,
        immobilisation: state.immobilisation!,
        callCapacity: state.callCapacity,
        objectives: state.objectives,
        strategies: state.strategies,
        esg: state.esg,
        diversification: state.diversification,
      });
      // En cas de succès, la Server Action redirige ; ici on ne reçoit qu'une erreur.
      if (res && "error" in res) setSubmitError(res.error);
    });
  }

  return (
    <PageShell className="py-14">
      <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
        <aside className="lg:pt-2">
          <StepperRail />
        </aside>

        <section className="max-w-[560px]">
          <Eyebrow>{meta.eyebrow}</Eyebrow>
          <TitleAccent
            title={meta.title}
            accentWord={meta.accentWord}
            className="mt-3 text-[42px] font-medium leading-[46px] tracking-[-0.01em]"
          />
          <p className="mt-3 text-[16px] leading-[24px] text-muted">
            {meta.subtitle}
          </p>

          <div className="mt-9">
            <StepBody />
          </div>

          {/* funnel-nav-footer */}
          <div className="mt-10 flex items-center justify-between border-t border-black/10 pt-6">
            <button
              type="button"
              onClick={prev}
              disabled={step === 0 || pending}
              className="text-[14px] text-muted transition-opacity hover:opacity-70 disabled:opacity-30"
            >
              ← Retour
            </button>

            <div className="flex flex-col items-end gap-2">
              {!validation.success && (
                <span className="text-[13px] text-muted">
                  {validation.error}
                </span>
              )}
              {submitError && (
                <span role="alert" className="text-[13px] text-coral">
                  {submitError}
                </span>
              )}
              <Button
                onClick={handleNext}
                disabled={!validation.success || pending}
              >
                {pending
                  ? "Composition…"
                  : isLast
                    ? "Générer l'allocation"
                    : "Continuer"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
