import { type ReactNode } from "react";

/**
 * ui-empty-state — état vide actionnable (§10). Pas d'ombre, contraste + bordure fine.
 */
export function EmptyState({
  title,
  description,
  action,
  className = "",
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-card border border-black/10 bg-cream-2 p-12 text-center",
        className,
      ].join(" ")}
    >
      <p className="text-[17px] leading-[26px] text-slate">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
