import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Badge } from "@/components/ui/Badge";
import { DoubleChevron } from "@/components/ui/DoubleChevron";
import { TitleAccent } from "@/components/ui/TitleAccent";
import { FundCover } from "@/components/fund/FundCover";
import { createClient } from "@/lib/supabase/server";
import { normalizeFund, formatEuro, formatMultiple, formatPercent } from "@/lib/funds";
import {
  accentWordFor,
  assetClassFor,
  buildCommercial,
  findArchivedFund,
  findNewFund,
  FUND_DOCUMENTS,
  openStatus,
  toneForFund,
  type ArchivedFund,
  type NewFund,
} from "@/lib/catalog";
import { getTransparence } from "@/lib/fonds/transparence";
import { FundComposition } from "@/components/fund/FundComposition";
import type { Fund } from "@/types/domain";

const CONTACT = "partenaires@privatecorner.fr";

/** Bloc statistique du bandeau latéral. */
function SideStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3 last:border-0">
      <span className="text-[13px] text-mist">{label}</span>
      <span className="text-[16px] font-medium tracking-[-0.01em] text-white">
        {value}
      </span>
    </div>
  );
}

/** Chip de document de la salle de données (démonstration, non téléchargeable). */
function DocChip({ label, kind }: { label: string; kind: string }) {
  return (
    <span
      title="Document de démonstration"
      className="inline-flex items-center gap-3 rounded-card border border-black/10 bg-white px-4 py-3 text-[14px] text-slate"
    >
      <FileText size={17} className="shrink-0 text-coral" />
      <span className="flex-1">{label}</span>
      <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-muted">
        {kind} <Download size={13} />
      </span>
    </span>
  );
}

function BackLink() {
  return (
    <Link
      href="/fonds"
      className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-opacity hover:opacity-70"
    >
      <ArrowLeft size={15} /> Retour à la gamme
    </Link>
  );
}

export default async function FundCommercialPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ intent?: string }>;
}) {
  const { slug } = await params;
  const { intent } = await searchParams;

  const supabase = await createClient();
  const { data: fundRow } = await supabase
    .from("funds")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (fundRow) return <OpenFundPage fund={normalizeFund(fundRow as Fund)} />;

  const newFund = findNewFund(slug);
  if (newFund) return <NewFundPage fund={newFund} intent={intent} />;

  const archived = findArchivedFund(slug);
  if (archived) return <ArchivedFundPage fund={archived} />;

  notFound();
}

/* ------------------------------------------------------------------ Open */

function OpenFundPage({ fund }: { fund: Fund }) {
  const status = openStatus(fund);
  const tone = toneForFund(fund.bucket, fund.pacing);
  const c = buildCommercial(fund);
  const transparence = getTransparence(fund.slug);

  return (
    <PageShell className="py-12">
      <BackLink />

      {/* Bandeau visuel */}
      <div className="relative mt-5 overflow-hidden rounded-card">
        <FundCover seed={fund.slug} tone={tone} rounded={false} className="h-64 w-full sm:h-80" />
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          <div className="flex items-center gap-3">
            <Eyebrow>{assetClassFor(fund.pacing)}</Eyebrow>
            <Badge tone={status === "open" ? "active" : "neutral"}>
              {status === "open" ? "En cours de levée" : "Souscription continue"}
            </Badge>
          </div>
          <TitleAccent
            as="h1"
            title={fund.name}
            accentWord={accentWordFor(fund.name)}
            className="mt-3 max-w-3xl text-[38px] font-medium leading-[42px] tracking-[-0.01em] text-white"
          />
          <p className="mt-2 text-[16px] text-mist">
            {fund.manager} · Clôture {fund.closing_label}
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        {/* Contenu commercial */}
        <div>
          <p className="text-[20px] font-medium leading-[28px] tracking-[-0.01em] text-slate">
            {c.tagline}
          </p>
          <p className="mt-4 text-[16px] leading-[26px] text-slate">{c.pitch}</p>

          <h2 className="mt-12 text-[22px] font-medium tracking-[-0.01em]">
            Points <em className="pc">clés</em>
          </h2>
          <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {c.highlights.map((h) => (
              <div
                key={h.label}
                className="flex items-baseline justify-between gap-4 border-b border-black/10 pb-3"
              >
                <dt className="text-[13px] text-muted">{h.label}</dt>
                <dd className="text-right text-[15px] font-medium text-slate">
                  {h.value}
                </dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-12 text-[22px] font-medium tracking-[-0.01em]">
            Stratégie d'<em className="pc">investissement</em>
          </h2>
          <ul className="mt-5 flex flex-col gap-3">
            {c.strategy.map((s) => (
              <li key={s} className="flex gap-3 text-[15px] leading-[23px] text-slate">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-pill bg-coral" />
                {s}
              </li>
            ))}
          </ul>

          {transparence && (
            <FundComposition t={transparence} esgScore={fund.esg_score} />
          )}

          <h2 className="mt-12 text-[22px] font-medium tracking-[-0.01em]">Documentation</h2>
          <p className="mt-2 text-[14px] text-muted">
            Salle de données du fonds — accessibles après conventionnement.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FUND_DOCUMENTS.map((d) => (
              <DocChip key={d.label} label={d.label} kind={d.kind} />
            ))}
          </div>
        </div>

        {/* Bandeau d'action (registre sombre) */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-card border border-line bg-base p-6 text-white">
            <p className="text-[12px] uppercase tracking-[0.14em] text-mist">
              Souscription
            </p>
            <div className="mt-4">
              <SideStat label="Ticket minimum" value={formatEuro(fund.min_ticket)} />
              <SideStat
                label="Objectif de multiple"
                value={`${formatMultiple(fund.target_multiple)} brut`}
              />
              <SideStat label="TRI brut cible" value={formatPercent(fund.target_gross_irr)} />
              <SideStat label="Clôture" value={fund.closing_label} />
            </div>

            <Link
              href={`/fonds/${fund.slug}/souscrire`}
              className="mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-pill bg-coral px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-coral-deep"
            >
              <span>Initier une souscription</span>
              <DoubleChevron />
            </Link>
            <a
              href={`mailto:${CONTACT}?subject=${encodeURIComponent(`Informations — ${fund.name}`)}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-pill border border-line px-6 py-3 text-[14px] font-medium text-white transition-colors hover:border-white"
            >
              Demander des informations
            </a>
            <p className="mt-4 text-center text-[12px] text-mist">
              Souscription pour le compte d'un investisseur du cabinet.
            </p>
          </div>
        </aside>
      </div>

      <AmfMention />
    </PageShell>
  );
}

/* ------------------------------------------------------------------- New */

function NewFundPage({
  fund,
  intent,
}: {
  fund: NewFund;
  intent?: string;
}) {
  const intentLabel =
    intent === "convention"
      ? "Votre demande de conventionnement"
      : intent === "infos"
        ? "Votre demande d'informations"
        : null;

  return (
    <PageShell className="py-12">
      <BackLink />

      <div className="relative mt-5 overflow-hidden rounded-card">
        <FundCover seed={fund.seed} tone={fund.tone} rounded={false} className="h-64 w-full sm:h-80" />
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          <div className="flex items-center gap-3">
            <Eyebrow>{fund.strategy}</Eyebrow>
            <Badge tone="outline">Nouveau fonds</Badge>
          </div>
          <TitleAccent
            as="h1"
            title={fund.name}
            accentWord={fund.accentWord}
            className="mt-3 max-w-3xl text-[38px] font-medium leading-[42px] tracking-[-0.01em] text-white"
          />
          <p className="mt-2 text-[16px] text-mist">
            {fund.manager} · {fund.expectedClosing}
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-[20px] font-medium leading-[28px] tracking-[-0.01em] text-slate">
            {fund.tagline}
          </p>
          <p className="mt-4 text-[16px] leading-[26px] text-slate">{fund.pitch}</p>

          <h2 className="mt-12 text-[22px] font-medium tracking-[-0.01em]">
            Points <em className="pc">clés</em>
          </h2>
          <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {[
              { label: "Stratégie", value: fund.strategy },
              { label: "Gérant", value: fund.manager },
              { label: "Géographies", value: fund.geographies },
              { label: "Ouverture", value: fund.expectedClosing },
              { label: "Multiple cible", value: `${formatMultiple(fund.targetMultiple)} brut` },
              { label: "TRI brut cible", value: formatPercent(fund.targetIrr) },
              { label: "Ticket minimum", value: formatEuro(fund.minTicket) },
            ].map((h) => (
              <div
                key={h.label}
                className="flex items-baseline justify-between gap-4 border-b border-black/10 pb-3"
              >
                <dt className="text-[13px] text-muted">{h.label}</dt>
                <dd className="text-right text-[15px] font-medium text-slate">{h.value}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-12 text-[22px] font-medium tracking-[-0.01em]">
            Stratégie d'<em className="pc">investissement</em>
          </h2>
          <ul className="mt-5 flex flex-col gap-3">
            {fund.strategyPoints.map((s) => (
              <li key={s} className="flex gap-3 text-[15px] leading-[23px] text-slate">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-pill bg-coral" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-card border border-line bg-base p-6 text-white">
            <p className="text-[12px] uppercase tracking-[0.14em] text-mist">
              Fonds en préparation
            </p>
            <p className="mt-3 text-[14px] leading-[21px] text-mist">
              La souscription n'est pas encore ouverte. Manifestez votre intérêt
              pour accéder à la documentation et être prioritaire à l'ouverture.
            </p>

            {intentLabel && (
              <div className="mt-4 rounded-field border border-coral bg-coral-wash px-4 py-3 text-[13px] text-coral">
                {intentLabel} a bien été prise en compte — notre équipe partenaires
                revient vers vous.
              </div>
            )}

            <a
              href={`mailto:${CONTACT}?subject=${encodeURIComponent(`Informations — ${fund.name}`)}`}
              className="mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-pill bg-coral px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-coral-deep"
            >
              <span>Demander des informations</span>
              <DoubleChevron />
            </a>
            <a
              href={`mailto:${CONTACT}?subject=${encodeURIComponent(`Conventionnement — ${fund.name}`)}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-pill border border-line px-6 py-3 text-[14px] font-medium text-white transition-colors hover:border-white"
            >
              Me conventionner
            </a>
          </div>
        </aside>
      </div>

      <AmfMention />
    </PageShell>
  );
}

/* --------------------------------------------------------------- Archived */

function ArchivedFundPage({ fund }: { fund: ArchivedFund }) {
  return (
    <PageShell className="py-12">
      <BackLink />

      <div className="relative mt-5 overflow-hidden rounded-card">
        <FundCover seed={fund.seed} tone="closed" rounded={false} className="h-56 w-full sm:h-72" />
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          <div className="flex items-center gap-3">
            <Eyebrow>Millésime {fund.vintage}</Eyebrow>
            <Badge tone="neutral">{fund.status}</Badge>
          </div>
          <TitleAccent
            as="h1"
            title={fund.name}
            accentWord={fund.accentWord}
            className="mt-3 max-w-3xl text-[34px] font-medium leading-[40px] tracking-[-0.01em] text-white"
          />
          <p className="mt-2 text-[16px] text-mist">
            {fund.manager} · {fund.strategy}
          </p>
        </div>
      </div>

      <div className="mt-10 max-w-3xl">
        <h2 className="text-[22px] font-medium tracking-[-0.01em]">
          Performance <em className="pc">réalisée</em>
        </h2>
        <p className="mt-2 text-[14px] text-muted">
          Fonds clôturé — indicateurs à titre historique. Les performances passées
          ne préjugent pas des performances futures.
        </p>
        <dl className="mt-6 grid grid-cols-3 gap-6 rounded-card border border-black/10 bg-cream-2 p-6">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.06em] text-muted">TVPI réalisé</dt>
            <dd className="mt-1 text-[28px] font-medium tracking-[-0.02em] text-slate">
              {formatMultiple(fund.realizedMultiple)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.06em] text-muted">DPI</dt>
            <dd className="mt-1 text-[28px] font-medium tracking-[-0.02em] text-slate">
              {formatMultiple(fund.dpi)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.06em] text-muted">TRI net</dt>
            <dd className="mt-1 text-[28px] font-medium tracking-[-0.02em] text-slate">
              {formatPercent(fund.netIrr)}
            </dd>
          </div>
        </dl>

        <Link
          href="/fonds"
          className="mt-8 inline-flex items-center justify-center gap-2.5 rounded-pill bg-coral px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-coral-deep"
        >
          <span>Voir les fonds ouverts</span>
          <DoubleChevron />
        </Link>
      </div>

      <AmfMention />
    </PageShell>
  );
}

function AmfMention() {
  return (
    <p className="mt-16 max-w-3xl text-[12px] leading-[18px] text-muted">
      Communication à caractère promotionnel. Investir dans des fonds de
      capital-investissement présente un risque de perte en capital et une
      liquidité réduite ; l'horizon de placement est long. Les performances
      passées ne préjugent pas des performances futures. Private Corner — société
      de gestion agréée AMF GP-20000038.
    </p>
  );
}
