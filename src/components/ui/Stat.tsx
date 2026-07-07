import { type ReactNode } from "react";

/**
 * ui-stat — chiffre Neue Montreal 500 (jamais mono), unité en corail, label muted dessous.
 * Handoff §Indicateurs/stats + §Échelle typo (stat 26–46px, -.02em).
 */
export function Stat({
  value,
  unit,
  label,
  size = "md",
  className = "",
}: {
  value: ReactNode;
  unit?: ReactNode;
  label?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeCls =
    size === "lg"
      ? "text-[46px]"
      : size === "sm"
        ? "text-[26px]"
        : "text-[34px]";

  return (
    <div className={className}>
      <div
        className={[
          "font-medium tracking-[-0.02em] leading-none",
          sizeCls,
        ].join(" ")}
      >
        {value}
        {unit != null && <span className="text-coral"> {unit}</span>}
      </div>
      {label != null && (
        <div className="mt-2 text-[11px] uppercase tracking-[0.06em] text-muted">
          {label}
        </div>
      )}
    </div>
  );
}
