import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { TitleAccent } from "@/components/ui/TitleAccent";
import { DoubleChevron } from "@/components/ui/DoubleChevron";
import { FundCover } from "@/components/fund/FundCover";
import { formatEuro, formatMultiple, formatPercent } from "@/lib/funds";
import {
  accentWordFor,
  assetClassFor,
  fundFacts,
  openStatus,
  toneForFund,
  type ArchivedFund,
  type NewFund,
} from "@/lib/catalog";
import type { Fund } from "@/types/domain";

/**
 * fund-card-summary — carte de fonds ouverte à la souscription : visuel génératif,
 * eyebrow classe d'actif (corail) + badge statut, titre (mot Saol italic), stats
 * en grille 2 colonnes, CTA « Découvrir » + lien « Investir ». Radius 18px, bordure fine.
 */
export function FundCard({ fund }: { fund: Fund }) {
  const status = openStatus(fund);
  const tone = toneForFund(fund.bucket, fund.pacing);
  const facts = fundFacts(fund);
  const stats: { label: string; value: string }[] = [
    { label: "Stratégie", value: fund.strategy },
    { label: "Ticket min.", value: formatEuro(fund.min_ticket) },
    { label: "Secteur", value: facts.sector },
    { label: "Géographie", value: facts.geography },
    { label: "Positionnement", value: facts.positioning },
    { label: "Closing final", value: fund.closing_label },
  ];

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-black/10 bg-white transition-colors hover:border-coral">
      <Link href={`/fonds/${fund.slug}`} className="block">
        <div className="relative aspect-[16/10] w-full">
          <FundCover seed={fund.slug} tone={tone} rounded={false} className="h-full w-full" />
          <div className="absolute left-4 top-4">
            <Badge tone={status === "open" ? "active" : "neutral"} className="backdrop-blur-sm">
              {status === "open" ? "En cours de levée" : "Souscription continue"}
            </Badge>
          </div>
          <div className="absolute right-4 top-4">
            <Badge tone="outline" className="bg-ink/40 backdrop-blur-sm">
              {assetClassFor(fund.pacing)}
            </Badge>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] uppercase tracking-[0.14em] text-coral">
          Feeder — fonds de fonds
        </p>
        <Link href={`/fonds/${fund.slug}`}>
          <TitleAccent
            as="h3"
            title={fund.name}
            accentWord={accentWordFor(fund.name)}
            className="mt-2 min-h-[52px] text-[21px] font-medium leading-[26px] tracking-[-0.01em] transition-colors group-hover:text-coral"
          />
        </Link>
        <p className="mt-1.5 text-[13px] text-muted">{fund.manager}</p>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-black/10 pt-5">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-[11px] uppercase tracking-[0.06em] text-muted">
                {s.label}
              </dt>
              <dd className="mt-1 text-[15px] font-medium tracking-[-0.01em] text-slate">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex items-center gap-4 pt-6">
          <Link
            href={`/fonds/${fund.slug}`}
            className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-pill bg-coral px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-coral-deep"
          >
            <span>Découvrir le fonds</span>
            <DoubleChevron />
          </Link>
          <Link
            href={`/fonds/${fund.slug}/souscrire`}
            className="whitespace-nowrap text-[13px] font-medium text-slate transition-colors hover:text-coral"
          >
            Investir
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * fund-card-new — carte d'un fonds en préparation (gamme fictive). CTA doubles :
 * « Demander des informations » et « Me conventionner », plus lien vers la page
 * commerciale. Pas de souscription immédiate (fonds non ouvert).
 */
export function NewFundCard({ fund }: { fund: NewFund }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-black/10 bg-white transition-colors hover:border-coral">
      <Link href={`/fonds/${fund.slug}`} className="block">
        <div className="relative aspect-[16/10] w-full">
          <FundCover seed={fund.seed} tone={fund.tone} rounded={false} className="h-full w-full" />
          <div className="absolute left-4 top-4">
            <Badge tone="outline" className="bg-ink/40 backdrop-blur-sm">
              Nouveau
            </Badge>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] uppercase tracking-[0.14em] text-coral">{fund.strategy}</p>
        <Link href={`/fonds/${fund.slug}`}>
          <TitleAccent
            as="h3"
            title={fund.name}
            accentWord={fund.accentWord}
            className="mt-2 min-h-[52px] text-[21px] font-medium leading-[26px] tracking-[-0.01em] transition-colors group-hover:text-coral"
          />
        </Link>
        <p className="mt-2 min-h-[42px] text-[14px] leading-[21px] text-muted">
          {fund.tagline}
        </p>
        <p className="mt-3 text-[13px] font-medium text-slate">{fund.expectedClosing}</p>

        <div className="mt-auto flex flex-col gap-2.5 pt-6">
          <Link
            href={`/fonds/${fund.slug}?intent=infos`}
            className="inline-flex items-center justify-center gap-2.5 rounded-pill bg-coral px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-coral-deep"
          >
            <span>Demander des informations</span>
            <DoubleChevron />
          </Link>
          <div className="flex items-center justify-between">
            <Link
              href={`/fonds/${fund.slug}?intent=convention`}
              className="text-[13px] font-medium text-slate transition-colors hover:text-coral"
            >
              Me conventionner
            </Link>
            <Link
              href={`/fonds/${fund.slug}`}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-coral transition-opacity hover:opacity-70"
            >
              Page commerciale <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * fund-archive-row — ligne d'un fonds clôturé (gamme fictive) : vignette, millésime,
 * performance réalisée. Registre neutre (pas de signal corail).
 */
export function ArchivedFundRow({ fund }: { fund: ArchivedFund }) {
  const stats: { label: string; value: string }[] = [
    { label: "Millésime", value: String(fund.vintage) },
    { label: "TVPI réalisé", value: formatMultiple(fund.realizedMultiple) },
    { label: "DPI", value: formatMultiple(fund.dpi) },
    { label: "TRI net", value: formatPercent(fund.netIrr) },
  ];
  return (
    <Link
      href={`/fonds/${fund.slug}`}
      className="flex flex-wrap items-center gap-5 rounded-card border border-black/10 bg-cream-2 px-5 py-4 transition-colors hover:border-black/25"
    >
      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-[10px]">
        <FundCover seed={fund.seed} tone="closed" rounded={false} className="h-full w-full" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <p className="truncate font-medium text-slate">{fund.name}</p>
          <Badge tone="neutral">{fund.status}</Badge>
        </div>
        <p className="mt-0.5 text-[13px] text-muted">
          {fund.manager} · {fund.strategy}
        </p>
      </div>
      <dl className="flex flex-wrap gap-x-7 gap-y-2">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="text-[10px] uppercase tracking-[0.06em] text-muted">{s.label}</dt>
            <dd className="mt-0.5 text-[15px] font-medium tracking-[-0.01em] text-slate">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>
    </Link>
  );
}
