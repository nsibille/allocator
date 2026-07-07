"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { formatEuroCompact } from "@/lib/funds";
import { useThemeColors } from "@/lib/useThemeColors";
import type { CollectionPoint } from "@/lib/portal/dashboard";

/**
 * portal-dashboard-collection-trend — collecte cumulée sur 12 mois glissants.
 * Série unique (magnitude → une seule teinte corail) sur registre sombre : aire
 * corail-wash + ligne corail, grille et axes atténués. Aucun hex en dur.
 */
export function CollectionTrendChart({ points }: { points: CollectionPoint[] }) {
  const colors = useThemeColors();
  if (!colors)
    return <div className="h-[220px] w-full animate-pulse rounded-card bg-white/5" />;

  const data = points.map((p) => ({
    month: p.month,
    "Collecte cumulée": p.cumulative,
  }));

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="collection-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.coral} stopOpacity={0.34} />
              <stop offset="100%" stopColor={colors.coral} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={colors.line} />
          <XAxis
            dataKey="month"
            tick={{ fill: colors.mist, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: colors.line }}
            interval="preserveStartEnd"
            minTickGap={12}
          />
          <YAxis
            tickFormatter={(v: number) => formatEuroCompact(v)}
            tick={{ fill: colors.mist, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: colors.line }} />
          <Area
            dataKey="Collecte cumulée"
            type="monotone"
            stroke={colors.coral}
            strokeWidth={2}
            fill="url(#collection-fill)"
            dot={false}
            activeDot={{ r: 4, fill: colors.coral, stroke: colors.base }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendTooltip({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null;
  const value = Number(payload[0]?.value ?? 0);
  return (
    <div className="rounded-field border border-line bg-ink px-3 py-2 text-white">
      <p className="mb-1 text-[12px] text-mist">{label}</p>
      <p className="text-[15px] font-medium tracking-[-0.02em]">
        {formatEuroCompact(value)}
      </p>
      <p className="mt-0.5 text-[11px] uppercase tracking-[0.06em] text-mist">
        Collecte cumulée
      </p>
    </div>
  );
}
