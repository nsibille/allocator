import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ArchivedFundRow,
  FundCard,
  NewFundCard,
} from "@/components/fund/FundCard";
import { createClient } from "@/lib/supabase/server";
import { activeFunds } from "@/lib/funds";
import {
  ARCHIVED_FUNDS,
  ASSET_CLASS_ORDER,
  NEW_FUNDS,
  assetClassFor,
} from "@/lib/catalog";
import type { Fund } from "@/types/domain";

/**
 * fund-catalog — page de promotion de la gamme : fonds ouverts à la souscription
 * (gamme réelle), nouveaux fonds en préparation et fonds archivés (démonstration).
 * Chaque carte mène à la page commerciale du fonds et à l'initiation de souscription.
 */
export default async function FondsPage() {
  const supabase = await createClient();
  const { data: fundRows } = await supabase
    .from("funds")
    .select("*")
    .eq("is_active", true);

  const funds = activeFunds((fundRows ?? []) as Fund[]);

  return (
    <PageShell className="py-14">
      {/* Hero d'introduction */}
      <header className="max-w-2xl">
        <Eyebrow>Gamme Private Corner</Eyebrow>
        <h1 className="mt-4 text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
          Nos fonds ouverts à la <em className="pc">souscription</em>
        </h1>
        <p className="mt-4 text-[17px] leading-[26px] text-slate">
          Chaque véhicule est un <strong className="font-medium">feeder (fonds de
          fonds)</strong> donnant accès, dès 100 000 €, aux stratégies de gérants
          institutionnels de premier rang — Ardian, EQT, Tikehau, Blue Owl,
          Keensight, Meridiam ou Mérieux. Sélectionnez un fonds pour accéder à sa
          page commerciale, sa documentation et initier une souscription pour le
          compte d'un client.
        </p>
      </header>

      {/* Fonds ouverts, groupés par classe d'actif (comme la source) */}
      <section className="mt-12">
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-[26px] font-medium leading-[32px] tracking-[-0.01em]">
            En cours de levée
          </h2>
          <p className="text-[13px] text-muted">
            {funds.length} fonds ouverts · ticket dès{" "}
            {funds.length
              ? new Intl.NumberFormat("fr-FR").format(
                  Math.min(...funds.map((f) => f.min_ticket)),
                )
              : "—"}{" "}
            €
          </p>
        </div>

        {funds.length === 0 ? (
          <EmptyState
            className="mt-8"
            title="Aucun fonds ouvert à la souscription pour l'instant."
            description="La gamme sera enrichie prochainement. Revenez consulter les nouveaux fonds ci-dessous."
          />
        ) : (
          ASSET_CLASS_ORDER.map((assetClass) => {
            const classFunds = funds.filter(
              (f) => assetClassFor(f.pacing) === assetClass,
            );
            if (classFunds.length === 0) return null;
            return (
              <div key={assetClass} className="mt-10 first:mt-8">
                <div className="flex items-baseline gap-3">
                  <h3 className="text-[15px] font-medium uppercase tracking-[0.06em] text-slate">
                    {assetClass}
                  </h3>
                  <span className="text-[13px] text-muted">
                    {classFunds.length} fonds
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {classFunds.map((fund) => (
                    <FundCard key={fund.id} fund={fund} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Nouveaux fonds (en préparation) */}
      <section className="mt-20">
        <Eyebrow>À venir</Eyebrow>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[26px] font-medium leading-[32px] tracking-[-0.01em]">
            Nouveaux <em className="pc">fonds</em>
          </h2>
          <p className="max-w-md text-[14px] text-muted">
            Fonds en cours de structuration. Demandez des informations ou
            conventionnez-vous dès à présent pour être prioritaire à l'ouverture.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {NEW_FUNDS.map((fund) => (
            <NewFundCard key={fund.slug} fund={fund} />
          ))}
        </div>
      </section>

      {/* Fonds archivés (clôturés) */}
      <section className="mt-20">
        <Eyebrow>Historique</Eyebrow>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[26px] font-medium leading-[32px] tracking-[-0.01em]">
            Fonds archivés
          </h2>
          <p className="text-[14px] text-muted">
            Millésimes clôturés — performances réalisées à titre indicatif.
          </p>
        </div>
        <ul className="mt-8 flex flex-col gap-3">
          {ARCHIVED_FUNDS.map((fund) => (
            <li key={fund.slug}>
              <ArchivedFundRow fund={fund} />
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-16 max-w-3xl text-[12px] leading-[18px] text-muted">
        Communication à caractère promotionnel réservée aux professionnels et
        investisseurs avertis. Investir dans des fonds de capital-investissement
        présente un risque de perte en capital et une liquidité réduite. Les
        performances passées ne préjugent pas des performances futures. Private
        Corner — société de gestion agréée AMF GP-20000038.
      </p>
    </PageShell>
  );
}
