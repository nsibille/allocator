"use client";

import { Plus } from "lucide-react";
import { formatEuro, PACING_LABEL } from "@/lib/funds";
import type { Fund } from "@/types/domain";

/**
 * alloc-fund-picker — ajout de fonds hors allocation (pilules).
 */
export function FundPicker({
  available,
  onAdd,
}: {
  available: Fund[];
  onAdd: (fund: Fund) => void;
}) {
  if (available.length === 0) return null;
  return (
    <div>
      <p className="mb-3 text-[12px] uppercase tracking-[0.06em] text-muted">
        Ajouter un compartiment
      </p>
      <div className="flex flex-wrap gap-2">
        {available.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onAdd(f)}
            className="inline-flex items-center gap-1.5 rounded-pill border border-black/15 px-3.5 py-1.5 text-[13px] text-slate transition-colors hover:border-coral hover:text-coral"
          >
            <Plus size={13} />
            <span>{f.name}</span>
            <span className="text-muted">· {PACING_LABEL[f.pacing]}</span>
            <span className="text-muted">· {formatEuro(f.min_ticket)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
