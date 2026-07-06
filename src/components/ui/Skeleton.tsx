/**
 * ui-skeleton — bloc de chargement. Animation coupée sous prefers-reduced-motion (globals.css).
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={["animate-pulse rounded-card bg-black/5", className].join(" ")}
      aria-hidden="true"
    />
  );
}
