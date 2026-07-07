import { formatPercent } from "@/lib/funds";
import { byWeightDesc, type ExposureSlice } from "@/lib/fonds/transparence";

/**
 * fund-exposure-bars — un axe d'exposition en barres horizontales corail
 * (poids décroissant). Présentation pure (serveur ou client), aucune lib de
 * graphe. Réutilisé par la fiche fonds et l'éditeur d'allocation.
 */
export function ExposureBars({
  title,
  slices,
  emphasis = false,
}: {
  title: string;
  slices: ExposureSlice[];
  /** Barres en corail plein (emphase) vs corail atténué. */
  emphasis?: boolean;
}) {
  const sorted = byWeightDesc(slices);
  return (
    <div>
      <h3 className="text-[13px] font-medium uppercase tracking-[0.06em] text-slate">
        {title}
      </h3>
      {sorted.length === 0 ? (
        <p className="mt-3 text-[13px] text-muted">—</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {sorted.map((s) => (
            <li key={s.label}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] text-slate">{s.label}</span>
                <span className="text-[12px] font-medium tabular-nums text-muted">
                  {formatPercent(s.weight, 0)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-pill bg-black/10">
                <div
                  className={[
                    "h-full rounded-pill transition-[width] duration-300",
                    emphasis ? "bg-coral" : "bg-coral/70",
                  ].join(" ")}
                  style={{ width: `${Math.round(s.weight * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
