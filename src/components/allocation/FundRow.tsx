"use client";

import { X } from "lucide-react";
import { TicketStepper } from "./TicketStepper";
import {
  BUCKET_COLOR_VAR,
  BUCKET_LABEL,
  formatEuro,
  formatPercent,
  PACING_LABEL,
} from "@/lib/funds";
import type { Fund } from "@/types/domain";

/**
 * alloc-fund-row — ligne de fonds éditable (motif fund-card-summary en rangée).
 * Stepper au pas du ticket, part de l'enveloppe, retrait.
 */
export function FundRow({
  fund,
  amount,
  total,
  cap,
  onChange,
  onRemove,
}: {
  fund: Fund;
  amount: number;
  total: number;
  cap: number;
  onChange: (amount: number) => void;
  onRemove: () => void;
}) {
  return (
    <li className="rounded-card border border-black/10 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-pill"
              style={{ background: BUCKET_COLOR_VAR[fund.bucket] }}
            />
            <p className="text-[11px] uppercase tracking-[0.14em] text-coral">
              {PACING_LABEL[fund.pacing]}
            </p>
          </div>
          <p className="mt-1 truncate font-medium">{fund.name}</p>
          <p className="text-[13px] text-muted">
            {fund.manager} · poche {BUCKET_LABEL[fund.bucket]} · ticket{" "}
            {formatEuro(fund.min_ticket)}
          </p>
        </div>
        <button
          type="button"
          aria-label="Retirer le fonds"
          onClick={onRemove}
          className="shrink-0 text-muted transition-colors hover:text-coral"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <TicketStepper
          value={amount}
          step={fund.min_ticket}
          max={cap}
          onChange={onChange}
        />
        <div className="text-right">
          <p className="text-[20px] font-medium tracking-[-0.02em]">
            {formatEuro(amount)}
          </p>
          <p className="text-[13px] text-muted">
            {total > 0 ? formatPercent(amount / total, 0) : "—"}
          </p>
        </div>
      </div>
    </li>
  );
}
