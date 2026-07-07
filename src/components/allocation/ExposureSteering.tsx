"use client";

import { useMemo, useState } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { formatPercent } from "@/lib/funds";
import { useAllocationStore } from "@/stores/allocation.store";
import {
  AXIS_LABEL,
  consolidateExposures,
  steerableFunds,
  steerToTarget,
  unionAxisLabels,
  type ExposureAxis,
} from "@/lib/allocation/exposure";
import type { Fund } from "@/types/domain";

/**
 * alloc-exposure-steering — pilotage inverse : l'utilisateur fixe une exposition
 * cible (curseurs par zone géographique ou secteur d'activité) et le moteur
 * re-répartit en temps réel le capital entre les fonds du panier pour s'en
 * approcher (moindres carrés sur le simplexe). Affiche cible vs atteint.
 */
export function ExposureSteering({
  lines,
  fundsById,
  envelope,
}: {
  lines: { fundId: string; amount: number }[];
  fundsById: Map<string, Fund>;
  envelope: number;
}) {
  const applyAmounts = useAllocationStore((s) => s.applyAmounts);
  const [axis, setAxis] = useState<ExposureAxis>("geography");
  const [targetByLabel, setTargetByLabel] = useState<Record<string, number>>({});
  const [achieved, setAchieved] = useState<Record<string, number>>({});

  const basket = steerableFunds(lines, fundsById);
  const zones = useMemo(
    () => unionAxisLabels(basket, axis),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [axis, basket.map((f) => f.id).join(",")],
  );

  // Exposition consolidée actuelle (%), sert de valeur par défaut des curseurs.
  const current = useMemo(() => {
    const cons = consolidateExposures(lines, fundsById)[axis];
    const map: Record<string, number> = {};
    for (const s of cons) map[s.label] = Math.round(s.weight * 100);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines, fundsById, axis]);

  function reset() {
    setTargetByLabel({});
    setAchieved({});
  }

  function changeAxis(next: ExposureAxis) {
    setAxis(next);
    setTargetByLabel({});
    setAchieved({});
  }

  function onTarget(zone: string, value: number) {
    // Au premier réglage, on fige toutes les zones sur l'exposition courante
    // pour ne déplacer que celle qu'on ajuste.
    const seeded =
      Object.keys(targetByLabel).length > 0
        ? targetByLabel
        : Object.fromEntries(zones.map((z) => [z, current[z] ?? 0]));
    const next = { ...seeded, [zone]: value };
    setTargetByLabel(next);

    const targetArr = zones.map((z) => next[z] ?? current[z] ?? 0);
    const outcome = steerToTarget(
      lines,
      fundsById,
      axis,
      zones,
      targetArr,
      envelope,
    );
    if (Object.keys(outcome.amounts).length > 0) applyAmounts(outcome.amounts);
    setAchieved(
      Object.fromEntries(outcome.achieved.map((a) => [a.label, a.weight])),
    );
  }

  const targetOf = (z: string) => targetByLabel[z] ?? current[z] ?? 0;
  const achievedOf = (z: string) =>
    achieved[z] != null ? achieved[z] : (current[z] ?? 0) / 100;

  return (
    <section className="rounded-card border border-black/10 bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-medium tracking-[-0.01em]">
            Piloter par <em className="pc">cible</em>
          </h2>
          <p className="mt-1 max-w-xl text-[13px] text-muted">
            Fixez une exposition cible : le moteur re-répartit le capital entre
            les fonds du panier pour s'en approcher, en temps réel.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-[13px] font-medium text-coral transition-opacity hover:opacity-70"
        >
          Réinitialiser sur l'actuel
        </button>
      </div>

      <div className="mt-5">
        <Segmented<ExposureAxis>
          options={[
            { value: "geography", label: AXIS_LABEL.geography },
            { value: "sector", label: AXIS_LABEL.sector },
          ]}
          value={axis}
          onChange={changeAxis}
        />
      </div>

      {basket.length < 2 ? (
        <p className="mt-6 text-[14px] text-muted">
          Ajoutez au moins deux fonds transparisés à la répartition pour piloter
          l'exposition par cible.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-5">
          {zones.map((zone) => {
            const target = Math.round(targetOf(zone));
            const got = achievedOf(zone);
            const gap = Math.round(got * 100) - target;
            return (
              <li key={zone}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14px] font-medium text-slate">
                    {zone}
                  </span>
                  <span className="text-[12px] text-muted">
                    cible{" "}
                    <span className="font-medium text-slate">{target} %</span> ·
                    obtenu{" "}
                    <span className="font-medium text-coral">
                      {formatPercent(got, 0)}
                    </span>
                    {Math.abs(gap) >= 3 && (
                      <span className="ml-1 text-muted">
                        (écart {gap > 0 ? "+" : ""}
                        {gap} pt)
                      </span>
                    )}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={target}
                  onChange={(e) => onTarget(zone, Number(e.target.value))}
                  aria-label={`Cible ${zone}`}
                  className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-pill bg-black/10 accent-coral"
                />
              </li>
            );
          })}
        </ul>
      )}

      {basket.length >= 2 && (
        <p className="mt-6 text-[12px] leading-[18px] text-muted">
          Le pilotage ne re-répartit que les fonds déjà sélectionnés (montants
          arrondis au pas du ticket). L'écart « obtenu » traduit la faisabilité :
          l'exposition atteignable est bornée par la composition des fonds du
          panier. Donnée illustrative de transparisation.
        </p>
      )}
    </section>
  );
}
