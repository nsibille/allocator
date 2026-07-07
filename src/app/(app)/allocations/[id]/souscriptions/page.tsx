import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DoubleChevron } from "@/components/ui/DoubleChevron";
import { createClient } from "@/lib/supabase/server";
import { formatEuro, PACING_LABEL } from "@/lib/funds";
import { BULLETIN_STATUS } from "@/lib/status";
import type { PacingProfile } from "@/types/domain";

/** Suivi des bulletins de souscription générés pour une allocation. */
export default async function SubscriptionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: allocation } = await supabase
    .from("allocations")
    .select("id, name")
    .eq("id", id)
    .single();
  if (!allocation) notFound();

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("id, reference, amount, status, generated_at, funds(name, manager, pacing)")
    .eq("allocation_id", id)
    .order("generated_at", { ascending: true });

  const list = subs ?? [];
  const total = list.reduce((s, x) => s + Number(x.amount), 0);

  return (
    <PageShell className="py-14">
      <Link
        href={`/allocations/${id}`}
        className="text-[13px] text-muted transition-opacity hover:opacity-70"
      >
        ← Retour à la note
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Souscriptions</Eyebrow>
          <h1 className="mt-3 text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
            {allocation.name}
          </h1>
        </div>
        <a
          href={`/api/pdf/bulletins/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 rounded-pill bg-coral px-7 py-[15px] text-[15px] font-medium text-white transition-colors hover:bg-coral-deep"
        >
          <span>{list.length ? "Télécharger les bulletins" : "Générer les bulletins"}</span>
          <DoubleChevron />
        </a>
      </div>

      {list.length === 0 ? (
        <EmptyState
          className="mt-10"
          title="Aucun bulletin généré."
          description="Générez les bulletins de souscription : un bulletin par compartiment est créé et suivi ici."
        />
      ) : (
        <>
          <ul className="mt-8 flex flex-col gap-3">
            {list.map((sub) => {
              const fund = sub.funds as {
                name: string;
                manager: string;
                pacing: PacingProfile;
              } | null;
              const st = BULLETIN_STATUS[sub.status];
              return (
                <li
                  key={sub.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-black/10 bg-white px-6 py-5"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{fund?.name ?? "—"}</p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      Réf. {sub.reference}
                      {fund ? ` · ${PACING_LABEL[fund.pacing]}` : ""} · généré le{" "}
                      {format(new Date(sub.generated_at), "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[17px] font-medium tracking-[-0.02em]">
                      {formatEuro(Number(sub.amount))}
                    </span>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-right text-[14px] text-muted">
            Total souscrit ·{" "}
            <span className="font-medium text-slate">{formatEuro(total)}</span>
          </p>
        </>
      )}
    </PageShell>
  );
}
