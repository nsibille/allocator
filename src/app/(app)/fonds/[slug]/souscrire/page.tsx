import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Badge } from "@/components/ui/Badge";
import { FundCover } from "@/components/fund/FundCover";
import {
  SubscriptionInitForm,
  type InvestorOption,
} from "@/components/fund/SubscriptionInitForm";
import { createClient } from "@/lib/supabase/server";
import { normalizeFund, formatEuro } from "@/lib/funds";
import { fundFacts, openStatus, toneForFund } from "@/lib/catalog";
import type { Fund } from "@/types/domain";

/**
 * fund-subscribe — écran d'initiation d'une souscription pour un fonds ouvert.
 * Réservé à la gamme réelle (les nouveaux fonds ne sont pas encore ouverts).
 */
export default async function SubscribePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: fundRow } = await supabase
    .from("funds")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!fundRow) notFound();

  const fund = normalizeFund(fundRow as Fund);
  const status = openStatus(fund);
  const tone = toneForFund(fund.bucket, fund.pacing);
  const facts = fundFacts(fund);

  const { data: clients } = await supabase
    .from("clients")
    .select("id, reference, first_name, last_name")
    .order("created_at", { ascending: false });

  const investors: InvestorOption[] = (clients ?? []).map((c) => ({
    id: c.id,
    label:
      [c.first_name, c.last_name].filter(Boolean).join(" ") || c.reference,
  }));

  return (
    <PageShell className="py-12">
      <Link
        href={`/fonds/${fund.slug}`}
        className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-opacity hover:opacity-70"
      >
        <ArrowLeft size={15} /> Retour à la page du fonds
      </Link>

      <div className="mt-5 flex flex-col gap-2">
        <Eyebrow>Initier une souscription</Eyebrow>
        <h1 className="text-[34px] font-medium leading-[40px] tracking-[-0.01em]">
          {fund.name}
        </h1>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        {/* Rappel du fonds */}
        <div>
          <div className="overflow-hidden rounded-card border border-black/10">
            <FundCover seed={fund.slug} tone={tone} rounded={false} className="h-48 w-full" />
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-coral">
                  {facts.assetClass}
                </p>
                <Badge tone={status === "open" ? "active" : "neutral"}>
                  {status === "open" ? "En cours de levée" : "Souscription continue"}
                </Badge>
              </div>
              <p className="mt-2 text-[18px] font-medium">{fund.name}</p>
              <p className="mt-1 text-[13px] text-muted">
                {fund.manager} · feeder (fonds de fonds)
              </p>

              <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-black/10 pt-6">
                {[
                  { label: "Stratégie", value: fund.strategy },
                  { label: "Ticket minimum", value: formatEuro(fund.min_ticket) },
                  { label: "Secteur", value: facts.sector },
                  { label: "Géographie", value: facts.geography },
                  { label: "Positionnement", value: facts.positioning },
                  { label: "Closing final", value: fund.closing_label },
                ].map((s) => (
                  <div key={s.label}>
                    <dt className="text-[11px] uppercase tracking-[0.06em] text-muted">
                      {s.label}
                    </dt>
                    <dd className="mt-1 text-[15px] font-medium text-slate">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <p className="mt-6 max-w-xl text-[13px] leading-[20px] text-muted">
            La création de la souscription génère une note d'allocation
            mono-fonds au statut « proposée ». Vous pourrez y ajuster le montant,
            visualiser les projections puis générer le bulletin de souscription.
          </p>
        </div>

        {/* Formulaire */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <SubscriptionInitForm
            fundSlug={fund.slug}
            minTicket={fund.min_ticket}
            investors={investors}
          />
        </div>
      </div>
    </PageShell>
  );
}
