"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProjectionRow } from "@/types/domain";
import { useThemeColors } from "@/lib/useThemeColors";
import { ChartTooltip } from "./ChartTooltip";

/**
 * proj-chart-cashflow — appels (muted, en négatif) / distributions (teal) / VL ligne corail.
 * Couleurs via tokens (aucun hex en dur).
 */
export function CashflowChart({ rows }: { rows: ProjectionRow[] }) {
  const colors = useThemeColors();
  if (!colors) return <ChartSkeleton />;

  const data = rows.map((r) => ({
    year: r.year,
    Appels: -Math.round(r.calls),
    Distributions: Math.round(r.distributions),
    VL: Math.round(r.nav),
  }));
  const euroTick = (v: number) => `${Math.round(v / 1000)}k`;

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid vertical={false} stroke={colors.line} />
          <XAxis
            dataKey="year"
            tick={{ fill: colors.muted, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: colors.line }}
          />
          <YAxis
            tickFormatter={euroTick}
            tick={{ fill: colors.muted, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: colors["coral-wash"] }} />
          <Bar dataKey="Appels" fill={colors.muted} radius={[2, 2, 0, 0]} stackId="cf" isAnimationActive={false} />
          <Bar dataKey="Distributions" fill={colors.teal} radius={[2, 2, 0, 0]} stackId="cf" isAnimationActive={false} />
          <Line
            dataKey="VL"
            type="monotone"
            stroke={colors.coral}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-[260px] w-full animate-pulse rounded-card bg-black/5" />;
}
