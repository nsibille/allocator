import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { createClient } from "@/lib/supabase/server";

/**
 * Tableau de bord : liste des allocations du cabinet (RLS-scopée).
 * Placeholder d'étape — la liste réelle + empty state actionnable arrivent avec le funnel.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: allocations } = await supabase
    .from("allocations")
    .select("id, name, envelope_amount, status, updated_at")
    .order("updated_at", { ascending: false });

  const isEmpty = !allocations || allocations.length === 0;

  return (
    <PageShell className="py-16">
      <Eyebrow>Cabinet</Eyebrow>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
          Vos <em className="pc">allocations</em>
        </h1>
        <Link href="/allocations/new">
          <Button>Nouvelle allocation</Button>
        </Link>
      </div>

      {isEmpty ? (
        <div className="mt-10 rounded-card border border-black/10 bg-cream-2 p-12 text-center">
          <p className="text-[17px] leading-[26px] text-slate">
            Aucune allocation pour l&apos;instant.
          </p>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">
            Lancez le funnel de qualification pour composer une première
            allocation sur la gamme Private Corner.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/allocations/new">
              <Button>Démarrer la qualification</Button>
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-10 flex flex-col gap-3">
          {allocations.map((a) => (
            <li key={a.id}>
              <Link
                href={`/allocations/${a.id}`}
                className="flex items-center justify-between rounded-card border border-black/10 bg-white px-6 py-5 transition-colors hover:border-coral"
              >
                <span className="font-medium">{a.name}</span>
                <span className="text-[13px] uppercase tracking-[0.06em] text-muted">
                  {a.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
