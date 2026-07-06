"use client";

import type { TooltipProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { formatEuro } from "@/lib/funds";

/**
 * proj-chart-tooltip — tooltip commun : fond base, bordure line (registre sombre).
 */
export function ChartTooltip({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-field border border-line bg-base px-3 py-2 text-white shadow-none">
      <p className="mb-1 text-[12px] text-mist">Année {label}</p>
      <ul className="flex flex-col gap-0.5">
        {payload.map((p) => (
          <li key={p.name} className="flex items-center gap-2 text-[13px]">
            <span
              className="inline-block h-2 w-2 rounded-pill"
              style={{ background: (p.color as string) ?? "transparent" }}
            />
            <span className="text-mist">{p.name}</span>
            <span className="ml-auto font-medium">
              {formatEuro(Math.round(Number(p.value)))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
