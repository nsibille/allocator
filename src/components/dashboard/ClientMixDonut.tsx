"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TooltipProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { useThemeColors, type ThemeColorKey } from "@/lib/useThemeColors";

export interface DonutSlice {
  label: string;
  value: number;
  /** Token de couleur (voir useThemeColors). */
  colorKey: ThemeColorKey;
}

/**
 * portal-dashboard-client-mix — répartition de la base (prospects vs clients),
 * cohortes mutuellement exclusives. Teintes neutres (muted / teal) : le corail
 * reste réservé au signal (cohorte « à réinvestir », affichée hors donut).
 * Anneau ajouré, total au centre. Un écart de 2px (anneau surface) sépare les
 * segments. Aucun hex en dur — couleurs lues sur les tokens.
 */
export function ClientMixDonut({
  slices,
  centerValue,
  centerLabel,
}: {
  slices: DonutSlice[];
  centerValue: string;
  centerLabel: string;
}) {
  const colors = useThemeColors();
  if (!colors)
    return (
      <div className="mx-auto h-[176px] w-[176px] animate-pulse rounded-full bg-black/5" />
    );

  const data = slices.map((s) => ({
    name: s.label,
    value: s.value,
    fill: colors[s.colorKey],
  }));

  return (
    <div className="relative mx-auto h-[176px] w-[176px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={86}
            startAngle={90}
            endAngle={-270}
            paddingAngle={2}
            stroke="var(--color-cream)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.fill} />
            ))}
          </Pie>
          <Tooltip content={<DonutTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[30px] font-medium leading-none tracking-[-0.02em]">
          {centerValue}
        </span>
        <span className="mt-1.5 text-[11px] uppercase tracking-[0.06em] text-muted">
          {centerLabel}
        </span>
      </div>
    </div>
  );
}

function DonutTooltip({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  return (
    <div className="rounded-field border border-black/10 bg-white px-3 py-2">
      <div className="flex items-center gap-2 text-[13px] text-slate">
        <span
          className="inline-block h-2 w-2 rounded-pill"
          style={{ background: (p.payload?.fill as string) ?? "transparent" }}
        />
        <span>{p.name}</span>
        <span className="ml-auto font-medium">{Number(p.value)}</span>
      </div>
    </div>
  );
}
