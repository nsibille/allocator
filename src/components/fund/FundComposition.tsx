import { formatPercent } from "@/lib/funds";
import { byWeightDesc, type FundTransparence } from "@/lib/fonds/transparence";
import { ExposureBars } from "./ExposureBars";

/**
 * fund-composition — transparisation d'un fonds (look-through) : architecture
 * et repères, sous-jacents (fonds maîtres / paniers), puis expositions
 * géographie / secteur / stade en barres. Registre clair, accent corail unique.
 * Donnée illustrative (voir `lib/fonds/transparence.ts`).
 */
export function FundComposition({
  t,
  esgScore,
}: {
  t: FundTransparence;
  esgScore?: number | null;
}) {
  const facts: { label: string; value: string }[] = [
    { label: "Architecture", value: t.structureType },
    { label: "Millésime", value: t.vintage },
    { label: "Rôle en allocation", value: t.coeurSatellite },
    { label: "Note de risque", value: `${t.riskNote} / 5` },
    { label: "Illiquidité", value: `~ ${t.illiquidityYears} ans` },
    { label: "Devise", value: t.currency },
  ];
  if (esgScore != null && esgScore > 0) {
    facts.push({
      label: "Orientation durable",
      value: esgScore >= 2 ? "Thématique (transition)" : "Prise en compte ESG",
    });
  }

  const single = t.holdings.length === 1;

  return (
    <section className="mt-12">
      <h2 className="text-[22px] font-medium tracking-[-0.01em]">
        Composition <em className="pc">transparisée</em>
      </h2>
      <p className="mt-2 max-w-2xl text-[14px] text-muted">
        Vue en transparence (look-through) du véhicule vers ses sous-jacents et
        ses expositions. Donnée illustrative construite à partir des stratégies
        connues des gérants — elle ne reflète pas un portefeuille réel.
      </p>

      {/* Repères d'architecture */}
      <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
        {facts.map((f) => (
          <div key={f.label} className="border-b border-black/10 pb-3">
            <dt className="text-[11px] uppercase tracking-[0.06em] text-muted">
              {f.label}
            </dt>
            <dd className="mt-1 text-[15px] font-medium text-slate">{f.value}</dd>
          </div>
        ))}
      </dl>

      {/* Sous-jacents */}
      <h3 className="mt-8 text-[13px] font-medium uppercase tracking-[0.06em] text-slate">
        {single ? "Fonds maître" : "Sous-jacents"}
        <span className="ml-2 font-normal text-muted">
          {t.holdings.length} ligne{t.holdings.length > 1 ? "s" : ""}
        </span>
      </h3>
      <ul className="mt-4 flex flex-col gap-2.5">
        {byWeightDesc(t.holdings.map((h) => ({ label: h.name, weight: h.weight }))).map(
          (row) => {
            const h = t.holdings.find((x) => x.name === row.label)!;
            return (
              <li
                key={h.name}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-card border border-black/10 bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-slate">
                    {h.name}
                  </p>
                  <p className="text-[12px] text-muted">
                    {h.manager} · millésime {h.vintage}
                  </p>
                </div>
                {!single && (
                  <span className="text-[15px] font-medium tracking-[-0.01em] text-slate">
                    {formatPercent(h.weight, 0)}
                  </span>
                )}
              </li>
            );
          },
        )}
      </ul>

      {/* Expositions en look-through */}
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
        <ExposureBars title="Géographie" slices={t.geography} emphasis />
        <ExposureBars title="Secteur" slices={t.sector} emphasis />
        <ExposureBars title="Stade" slices={t.stage} emphasis />
      </div>
    </section>
  );
}
