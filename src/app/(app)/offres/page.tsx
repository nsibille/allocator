import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Badge } from "@/components/ui/Badge";
import { formatEuro, formatPercent } from "@/lib/funds";
import { OFFERS } from "@/lib/portal/demo";

/**
 * portal-offers-table — offres de distribution ouvertes au cabinet, groupées
 * par fonds puis déclinées par part (ISIN, ticket minimum, valorisation,
 * frais d'entrée, statut). Données de démonstration (`lib/portal/demo.ts`).
 */
export default function OffresPage() {
  const shareCount = OFFERS.reduce((s, o) => s + o.shares.length, 0);

  const headers = [
    "Fonds / Part",
    "Investissement minimum",
    "Valorisation",
    "Frais d'entrée",
    "Statut",
  ];

  return (
    <PageShell className="py-14">
      <Eyebrow>Distribution</Eyebrow>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
          Nos offres de <em className="pc">distribution</em>
        </h1>
        <p className="text-[13px] text-muted">
          {OFFERS.length} fonds · {shareCount} parts
        </p>
      </div>

      <div className="mt-10 overflow-x-auto rounded-card border border-black/10 bg-white">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="border-b border-black/15 text-left">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-[11px] uppercase tracking-[0.06em] text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {OFFERS.map((offer) => (
              <FundGroup key={offer.id} offer={offer} colSpan={headers.length} />
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 max-w-3xl text-[12px] leading-[18px] text-muted">
        Communication à caractère promotionnel réservée aux professionnels et
        investisseurs avertis. Les offres présentées sont fournies à titre de
        démonstration. Investir dans des fonds de capital-investissement présente
        un risque de perte en capital et une liquidité réduite.
      </p>
    </PageShell>
  );
}

function FundGroup({
  offer,
  colSpan,
}: {
  offer: (typeof OFFERS)[number];
  colSpan: number;
}) {
  return (
    <>
      <tr className="bg-cream-2/70">
        <td colSpan={colSpan} className="px-6 py-3">
          <span className="font-medium">{offer.fundName}</span>
          <span className="ml-3 text-[12px] text-muted">{offer.period}</span>
        </td>
      </tr>
      {offer.shares.map((share) => (
        <tr
          key={share.code}
          className="border-b border-black/10 transition-colors hover:bg-cream-2/40"
        >
          <td className="px-6 py-4 text-slate">{share.code}</td>
          <td className="px-6 py-4 text-slate">
            {formatEuro(share.minInvestment)}
          </td>
          <td className="px-6 py-4 text-slate">
            {share.nav > 0 ? (
              <>
                {formatEuro(share.nav)}
                {share.navDate && (
                  <span className="mt-0.5 block text-[12px] text-muted">
                    {format(new Date(share.navDate), "d MMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                )}
              </>
            ) : (
              "—"
            )}
          </td>
          <td className="px-6 py-4 text-slate">
            {share.entryFee > 0 ? formatPercent(share.entryFee, 2) : "0 %"}
          </td>
          <td className="px-6 py-4">
            <Badge tone={share.status.tone}>{share.status.label}</Badge>
          </td>
        </tr>
      ))}
    </>
  );
}
