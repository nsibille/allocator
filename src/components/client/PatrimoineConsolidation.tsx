import { ExposureBars } from "@/components/fund/ExposureBars";
import { formatEuro } from "@/lib/funds";
import type { WealthConsolidation, WealthSlice } from "@/lib/client/wealth";

/**
 * client-patrimoine-consolidation — vue patrimoniale totale : croise les avoirs
 * déclarés et les souscriptions Private Corner (transparisées) pour exposer le
 * patrimoine global par classe d'actif, coté / non coté et géographie. Barres
 * corail (réutilise `fund-exposure-bars`). Non-coté PC en look-through réel,
 * avoirs cotés déclarés via grille d'hypothèses indicative.
 */
export function PatrimoineConsolidation({
  consolidation,
}: {
  consolidation: WealthConsolidation;
}) {
  const { total, declaredTotal, privateCornerTotal, byAssetClass, byListing, byGeography } =
    consolidation;

  const toWeights = (slices: WealthSlice[]) =>
    slices.map((s) => ({ label: s.label, weight: total > 0 ? s.value / total : 0 }));

  if (total <= 0) {
    return (
      <section className="rounded-card border border-black/10 bg-white p-6 md:p-8">
        <h2 className="text-[20px] font-medium tracking-[-0.01em]">
          Vue patrimoniale <em className="pc">consolidée</em>
        </h2>
        <p className="mt-3 text-[14px] text-muted">
          Renseignez des avoirs ci-dessous et/ou générez des souscriptions
          Private Corner pour visualiser l'exposition patrimoniale globale.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-black/10 bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-medium tracking-[-0.01em]">
            Vue patrimoniale <em className="pc">consolidée</em>
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            Patrimoine déclaré {formatEuro(declaredTotal)}
            <span className="mx-1.5 opacity-40">+</span>
            Private Corner {formatEuro(privateCornerTotal)}
          </p>
        </div>
        <p className="text-[26px] font-medium tracking-[-0.02em]">
          {formatEuro(total)}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
        <ExposureBars title="Classe d'actif" slices={toWeights(byAssetClass)} emphasis />
        <ExposureBars title="Coté / Non coté" slices={toWeights(byListing)} emphasis />
        <ExposureBars title="Géographie" slices={toWeights(byGeography)} emphasis />
      </div>

      <p className="mt-6 text-[12px] leading-[18px] text-muted">
        Le non-coté Private Corner est ventilé en transparence (look-through
        réel). Les avoirs cotés déclarés (ETF, actions, fonds…) sont ventilés via
        une grille d'hypothèses indicative par support. Vue à titre d'aide à la
        diversification, non contractuelle.
      </p>
    </section>
  );
}
