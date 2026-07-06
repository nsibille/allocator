import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/Skeleton";

/** Skeleton de la note d'allocation (couverture + projections + répartition). */
export default function Loading() {
  return (
    <>
      <div style={{ background: "var(--hero-gradient)" }}>
        <PageShell className="py-14">
          <Skeleton className="h-3 w-32 bg-white/10" />
          <Skeleton className="mt-3 h-11 w-80 bg-white/10" />
          <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 bg-white/10" />
            ))}
          </div>
        </PageShell>
      </div>
      <PageShell className="py-14">
        <Skeleton className="h-7 w-40" />
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </PageShell>
    </>
  );
}
