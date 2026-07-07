"use client";

import { useMemo, useState } from "react";
import { formatPercent } from "@/lib/funds";
import { useAllocationStore } from "@/stores/allocation.store";
import {
  AXIS_LABEL,
  consolidateExposures,
  steerableFunds,
  steerMultiAxis,
  unionAxisLabels,
  type AxisTarget,
  type ExposureAxis,
} from "@/lib/allocation/exposure";
import type { Fund } from "@/types/domain";

const AXES: ExposureAxis[] = ["geography", "sector", "stage"];
type AxisMap<T> = Record<ExposureAxis, T>;
const emptyMaps = (): AxisMap<Record<string, number>> => ({
  geography: {},
  sector: {},
  stage: {},
});

/**
 * alloc-exposure-steering — pilotage inverse MULTI-AXES : l'utilisateur active
 * un ou plusieurs axes (géographie, secteur d'activité, stade) et fixe des
 * expositions cibles ; le moteur re-répartit le capital entre les fonds du
 * panier pour approcher toutes les cibles simultanément (moindres carrés sur le
 * simplexe). Affiche cible vs atteint par axe (faisabilité).
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
  const [active, setActive] = useState<AxisMap<boolean>>({
    geography: true,
    sector: false,
    stage: false,
  });
  const [targets, setTargets] = useState<AxisMap<Record<string, number>>>(
    emptyMaps(),
  );
  const [achieved, setAchieved] = useState<AxisMap<Record<string, number>>>(
    emptyMaps(),
  );

  const basket = steerableFunds(lines, fundsById);
  const basketKey = basket.map((f) => f.id).join(",");

  // Zones par axe (stable) + exposition consolidée actuelle en % par axe.
  const zonesByAxis = useMemo(() => {
    const out = {} as AxisMap<string[]>;
    for (const a of AXES) out[a] = unionAxisLabels(basket, a);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basketKey]);

  const currentPct = useMemo(() => {
    const cons = consolidateExposures(lines, fundsById);
    const out = emptyMaps();
    for (const a of AXES)
      for (const s of cons[a]) out[a][s.label] = Math.round(s.weight * 100);
    return out;
  }, [lines, fundsById]);

  const seededMap = (axis: ExposureAxis): Record<string, number> =>
    Object.fromEntries(zonesByAxis[axis].map((z) => [z, currentPct[axis][z] ?? 0]));

  function runSolve(
    nextTargets: AxisMap<Record<string, number>>,
    nextActive: AxisMap<boolean>,
  ) {
    const axesTargets: AxisTarget[] = AXES.filter(
      (a) => nextActive[a] && zonesByAxis[a].length > 0,
    ).map((a) => ({
      axis: a,
      zones: zonesByAxis[a],
      target: zonesByAxis[a].map(
        (z) => nextTargets[a][z] ?? currentPct[a][z] ?? 0,
      ),
    }));

    const out = steerMultiAxis(lines, fundsById, axesTargets, envelope);
    if (Object.keys(out.amounts).length > 0) applyAmounts(out.amounts);

    const ach = emptyMaps();
    (Object.keys(out.achieved) as ExposureAxis[]).forEach((a) => {
      for (const s of out.achieved[a] ?? []) ach[a][s.label] = s.weight;
    });
    setAchieved(ach);
  }

  function onSlide(axis: ExposureAxis, zone: string, value: number) {
    const seeded =
      Object.keys(targets[axis]).length > 0 ? targets[axis] : seededMap(axis);
    const next = { ...targets, [axis]: { ...seeded, [zone]: value } };
    setTargets(next);
    runSolve(next, active);
  }

  function toggle(axis: ExposureAxis) {
    const on = !active[axis];
    const nextActive = { ...active, [axis]: on };
    const next =
      on && Object.keys(targets[axis]).length === 0
        ? { ...targets, [axis]: seededMap(axis) }
        : targets;
    setActive(nextActive);
    setTargets(next);
    runSolve(next, nextActive);
  }

  function reset() {
    setTargets(emptyMaps());
    setAchieved(emptyMaps());
  }

  const targetOf = (a: ExposureAxis, z: string) =>
    Math.round(targets[a][z] ?? currentPct[a][z] ?? 0);
  const achievedOf = (a: ExposureAxis, z: string) =>
    achieved[a][z] != null ? achieved[a][z] : (currentPct[a][z] ?? 0) / 100;

  const enoughFunds = basket.length >= 2;
  const activeCount = AXES.filter((a) => active[a]).length;

  return (
    <section className="rounded-card border border-black/10 bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-medium tracking-[-0.01em]">
            Piloter par <em className="pc">cible</em>
          </h2>
          <p className="mt-1 max-w-xl text-[13px] text-muted">
            Activez un ou plusieurs axes et fixez des expositions cibles : le
            moteur re-répartit le capital pour les approcher toutes en même
            temps, en temps réel.
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

      {/* Sélecteur d'axes (multi-sélection) */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        {AXES.map((a) => {
          const on = active[a];
          return (
            <button
              key={a}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(a)}
              className={[
                "rounded-pill border px-4 py-2 text-[13px] font-medium transition-colors",
                on
                  ? "border-coral bg-coral-wash text-coral"
                  : "border-black/15 text-slate hover:border-coral/50",
              ].join(" ")}
            >
              {AXIS_LABEL[a]}
            </button>
          );
        })}
      </div>

      {!enoughFunds ? (
        <p className="mt-6 text-[14px] text-muted">
          Ajoutez au moins deux fonds transparisés à la répartition pour piloter
          l'exposition par cible.
        </p>
      ) : activeCount === 0 ? (
        <p className="mt-6 text-[14px] text-muted">
          Activez un axe ci-dessus pour définir une exposition cible.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {AXES.filter((a) => active[a] && zonesByAxis[a].length > 0).map(
            (axis) => (
              <div key={axis}>
                <h3 className="text-[13px] font-medium uppercase tracking-[0.06em] text-slate">
                  {AXIS_LABEL[axis]}
                </h3>
                <ul className="mt-4 flex flex-col gap-5">
                  {zonesByAxis[axis].map((zone) => {
                    const target = targetOf(axis, zone);
                    const got = achievedOf(axis, zone);
                    const gap = Math.round(got * 100) - target;
                    return (
                      <li key={zone}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[14px] font-medium text-slate">
                            {zone}
                          </span>
                          <span className="text-[12px] text-muted">
                            cible{" "}
                            <span className="font-medium text-slate">
                              {target} %
                            </span>{" "}
                            · obtenu{" "}
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
                          onChange={(e) =>
                            onSlide(axis, zone, Number(e.target.value))
                          }
                          aria-label={`Cible ${AXIS_LABEL[axis]} — ${zone}`}
                          className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-pill bg-black/10 accent-coral"
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            ),
          )}
        </div>
      )}

      {enoughFunds && activeCount > 0 && (
        <p className="mt-6 text-[12px] leading-[18px] text-muted">
          {activeCount > 1
            ? "Les axes actifs sont optimisés conjointement : atteindre une cible sur un axe peut en contraindre un autre. "
            : ""}
          Le pilotage ne re-répartit que les fonds déjà sélectionnés (montants
          arrondis au pas du ticket). L'écart « obtenu » traduit la faisabilité,
          bornée par la composition des fonds du panier. Donnée illustrative de
          transparisation.
        </p>
      )}
    </section>
  );
}
