"use client";

import { formatEuro } from "@/lib/funds";

/**
 * alloc-total-indicator — total alloué vs enveloppe. L'écart est signalé en corail
 * (jamais de rouge/vert de statut — DESIGN_SYSTEM §1).
 */
export function TotalIndicator({
  total,
  envelope,
}: {
  total: number;
  envelope: number;
}) {
  const diff = total - envelope;
  const pct = envelope > 0 ? Math.min(1, total / envelope) : 0;
  const aligned = Math.abs(diff) < 1;

  return (
    <div className="rounded-card border border-black/10 bg-white p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-[0.06em] text-muted">
            Total alloué
          </p>
          <p className="mt-1 text-[26px] font-medium tracking-[-0.02em]">
            {formatEuro(total)}
          </p>
        </div>
        <p className="text-[13px] text-muted">
          Enveloppe {formatEuro(envelope)}
        </p>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-pill bg-black/10">
        <div
          className="h-full rounded-pill bg-coral transition-[width] duration-200"
          style={{ width: `${pct * 100}%` }}
        />
      </div>

      <p className="mt-2 text-[13px]">
        {aligned ? (
          <span className="text-muted">Aligné sur l&apos;enveloppe.</span>
        ) : (
          <span className="text-coral">
            {diff > 0 ? "Dépassement de " : "Sous l'enveloppe de "}
            {formatEuro(Math.abs(diff))}
          </span>
        )}
      </p>
    </div>
  );
}
