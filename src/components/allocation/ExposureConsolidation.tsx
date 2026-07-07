import { ExposureBars } from "@/components/fund/ExposureBars";
import { formatEuro } from "@/lib/funds";
import { AXIS_LABEL, type ConsolidatedExposure } from "@/lib/allocation/exposure";

/**
 * alloc-exposure-consolidation — exposition consolidée du portefeuille en
 * look-through (géo / secteur / stade), pondérée par le capital et recalculée
 * en temps réel à chaque ajustement de la répartition. Barres corail (réutilise
 * `fund-exposure-bars`). Donnée illustrative issue de la transparisation.
 */
export function ExposureConsolidation({
  exposure,
}: {
  exposure: ConsolidatedExposure;
}) {
  const { geography, sector, stage, covered, total } = exposure;
  const empty = total <= 0 || covered <= 0;

  return (
    <section className="rounded-card border border-black/10 bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-medium tracking-[-0.01em]">
            Exposition <em className="pc">consolidée</em>
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            Transparisation pondérée par le capital — mise à jour en temps réel
            selon la répartition.
          </p>
        </div>
        {!empty && covered < total && (
          <p className="text-[12px] text-muted">
            {formatEuro(covered)} / {formatEuro(total)} transparisés
          </p>
        )}
      </div>

      {empty ? (
        <p className="mt-6 text-[14px] text-muted">
          Ajoutez des fonds à la répartition pour visualiser l'exposition
          consolidée du portefeuille.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
          <ExposureBars title={AXIS_LABEL.geography} slices={geography} emphasis />
          <ExposureBars title={AXIS_LABEL.sector} slices={sector} emphasis />
          <ExposureBars title={AXIS_LABEL.stage} slices={stage} emphasis />
        </div>
      )}
    </section>
  );
}
