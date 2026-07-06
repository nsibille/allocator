"use client";

import { Minus, Plus } from "lucide-react";

/**
 * alloc-stepper-ticket — incrémente/décrémente au pas du ticket, borné par le cap.
 */
export function TicketStepper({
  value,
  step,
  max,
  onChange,
}: {
  value: number;
  step: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const dec = () => onChange(Math.max(0, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  return (
    <div className="inline-flex items-center rounded-pill border border-black/15">
      <button
        type="button"
        aria-label="Retirer un ticket"
        onClick={dec}
        disabled={value <= 0}
        className="flex h-8 w-8 items-center justify-center rounded-pill text-slate transition-colors hover:text-coral disabled:opacity-30"
      >
        <Minus size={15} />
      </button>
      <button
        type="button"
        aria-label="Ajouter un ticket"
        onClick={inc}
        disabled={value + step > max}
        className="flex h-8 w-8 items-center justify-center rounded-pill text-slate transition-colors hover:text-coral disabled:opacity-30"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
