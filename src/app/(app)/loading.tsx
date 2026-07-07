import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/Skeleton";

/** Skeleton de chargement générique (listes du cabinet). */
export default function Loading() {
  return (
    <PageShell className="py-14">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-11 w-72" />
      <Skeleton className="mt-10 h-24 w-full" />
      <div className="mt-8 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] w-full" />
        ))}
      </div>
    </PageShell>
  );
}
