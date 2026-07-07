"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProjectionRow } from "@/types/domain";
import { useThemeColors } from "@/lib/useThemeColors";
import { ChartTooltip } from "./ChartTooltip";

/**
 * proj-chart-jcurve — trésorerie nette cumulée : aire corail-wash + ligne corail,
 * ligne zéro de référence. Signature produit (DESIGN_SYSTEM §8).
 */
export function JCurveChart({ rows }: { rows: ProjectionRow[] }) {
  const colors = useThemeColors();
  if (!colors)
    return <div className="h-[260px] w-full animate-pulse rounded-card bg-black/5" />;

  const data = rows.map((r) => ({
    year: r.year,
    "Trésorerie nette": Math.round(r.netCashCumulative),
  }));
  const euroTick = (v: number) => `${Math.round(v / 1000)}k`;

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="jcurve-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.coral} stopOpacity={0.28} />
              <stop offset="100%" stopColor={colors.coral} stopOpacity={0.04} />
            </linearGradient>
          </defs>
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
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: colors.line }} />
          <ReferenceLine y={0} stroke={colors.muted} strokeDasharray="3 3" />
          <Area
            dataKey="Trésorerie nette"
            type="monotone"
            stroke={colors.coral}
            strokeWidth={2}
            fill="url(#jcurve-fill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
