"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
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
import { compactEuro } from "@/lib/funds";
import { useThemeColors, type ThemeColorKey } from "@/lib/useThemeColors";

/** Formateurs sérialisables (une clé traverse la frontière serveur→client). */
export type FormatKey = "euro" | "count";
const FORMATTERS: Record<FormatKey, (v: number) => string> = {
  euro: compactEuro,
  count: (v) => String(v),
};

/**
 * portal-dashboard-charts — primitives Recharts du tableau de bord (registre clair).
 * Couleurs via tokens uniquement (aucun hex en dur). Palette catégorielle limitée
 * aux poches data-viz sanctionnées (muted / teal / coral / coral-deep) : séparation
 * CVD validée, jamais color-only (légende + libellés directs systématiques).
 */

export type Segment = { name: string; value: number; colorKey: ThemeColorKey };

function ChartSkeleton({ h }: { h: number }) {
  return (
    <div
      className="w-full animate-pulse rounded-card bg-black/5"
      style={{ height: h }}
    />
  );
}

/** Tooltip clair partagé (fond blanc, bordure fine, encre slate). */
function lightTooltip(format: (v: number) => string) {
  return function LightTooltip({
    active,
    payload,
  }: TooltipProps<ValueType, NameType>) {
    if (!active || !payload || payload.length === 0) return null;
    const p = payload[0];
    const fill = (p.payload as { fill?: string } | undefined)?.fill;
    return (
      <div className="rounded-field border border-black/10 bg-white px-3 py-2 shadow-[0_10px_30px_-12px_rgba(19,30,35,0.35)]">
        <div className="flex items-center gap-2 text-[13px]">
          <span
            className="inline-block h-2 w-2 rounded-pill"
            style={{ background: fill ?? "transparent" }}
          />
          <span className="text-muted">{String(p.name)}</span>
          <span className="ml-3 font-medium text-slate">
            {format(Number(p.value))}
          </span>
        </div>
      </div>
    );
  };
}

/* ---- Donut (composition / identité) ------------------------------------- */
export function DonutChart({
  segments,
  size = 176,
  thickness = 26,
}: {
  segments: Segment[];
  size?: number;
  thickness?: number;
}) {
  const colors = useThemeColors();
  if (!colors) return <ChartSkeleton h={size} />;
  const data = segments
    .filter((s) => s.value > 0)
    .map((s) => ({ name: s.name, value: s.value, fill: colors[s.colorKey] }));

  return (
    <div style={{ height: size }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={lightTooltip(FORMATTERS.count)} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={size / 2 - thickness}
            outerRadius={size / 2}
            paddingAngle={2}
            stroke="none"
            startAngle={90}
            endAngle={-270}
            isAnimationActive={false}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---- Barres horizontales (magnitude / classement) ----------------------- */
export type HBarDatum = { name: string; value: number; colorKey?: ThemeColorKey };

export function HBarChart({
  data,
  format = "euro",
  colorKey = "coral",
  labelWidth = 168,
  barSize = 16,
  rowHeight = 40,
}: {
  data: HBarDatum[];
  format?: FormatKey;
  colorKey?: ThemeColorKey;
  labelWidth?: number;
  barSize?: number;
  rowHeight?: number;
}) {
  const colors = useThemeColors();
  const fmt = FORMATTERS[format];
  const height = Math.max(data.length * rowHeight + 8, rowHeight);
  if (!colors) return <ChartSkeleton h={height} />;
  const max = Math.max(...data.map((d) => d.value), 1);
  const rows = data.map((d) => ({
    ...d,
    fill: colors[d.colorKey ?? colorKey],
  }));

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={rows}
          margin={{ top: 0, right: 64, bottom: 0, left: 0 }}
          barCategoryGap={10}
        >
          <XAxis type="number" domain={[0, max]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={labelWidth}
            tick={{ fill: colors.slate, fontSize: 13 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: colors["coral-wash"] }}
            content={lightTooltip(fmt)}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={barSize} isAnimationActive={false}>
            {rows.map((r) => (
              <Cell key={r.name} fill={r.fill} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              // Espaces insécables : évite que Recharts scinde le libellé sur
              // deux lignes quand la barre est courte (largeur de barre héritée).
              formatter={(v: number) => fmt(v).replace(/ /g, " ")}
              style={{ fill: colors.slate, fontSize: 12, fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
