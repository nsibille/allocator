import { type ReactNode } from "react";

export interface BarItem {
  key: string;
  label: ReactNode;
  sublabel?: ReactNode;
  /** Valeur formatée affichée à droite (ex. « 5,0 M€ »). */
  value: ReactNode;
  /** Longueur relative de la barre, 0–1. */
  ratio: number;
  /** Contenu additionnel sous la barre (ex. part %, badge). */
  meta?: ReactNode;
}

/**
 * portal-dashboard-bar-list — liste de barres horizontales corail par magnitude
 * (part décroissante). Présentation pure côté serveur (aucune lib de graphe),
 * dérivée du motif `fund-exposure-bars`. Barre pleine corail = emphase, sinon
 * corail atténué. Aucun hex en dur.
 */
export function BarList({
  items,
  emphasis = false,
}: {
  items: BarItem[];
  emphasis?: boolean;
}) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((it) => (
        <li key={it.key}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-[14px] text-slate">
              {it.label}
            </span>
            <span className="shrink-0 text-[14px] font-medium tabular-nums tracking-[-0.02em]">
              {it.value}
            </span>
          </div>
          {it.sublabel != null && (
            <span className="mt-0.5 block text-[12px] text-muted">
              {it.sublabel}
            </span>
          )}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-pill bg-black/10">
            <div
              className={[
                "h-full rounded-pill",
                emphasis ? "bg-coral" : "bg-coral/70",
              ].join(" ")}
              style={{ width: `${Math.max(2, Math.round(it.ratio * 100))}%` }}
            />
          </div>
          {it.meta != null && (
            <div className="mt-1.5 text-[12px] text-muted">{it.meta}</div>
          )}
        </li>
      ))}
    </ul>
  );
}
