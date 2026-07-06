"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { BUCKET_LABEL, BUCKET_ORDER, formatPercent } from "@/lib/funds";
import { useThemeColors } from "@/lib/useThemeColors";
import type { Fund, StrategyBucket } from "@/types/domain";

/**
 * alloc-bucket-donut — répartition par poche (tokens --color-bucket-*, DESIGN_SYSTEM §2.b).
 */
export function BucketDonut({
  amounts,
  fundsById,
}: {
  amounts: Record<string, number>;
  fundsById: Map<string, Fund>;
}) {
  const colors = useThemeColors();

  const byBucket: Record<StrategyBucket, number> = {
    defensif: 0,
    coeur: 0,
    croissance: 0,
    satellite: 0,
  };
  for (const [id, amt] of Object.entries(amounts)) {
    const f = fundsById.get(id);
    if (f) byBucket[f.bucket] += amt;
  }
  const total = Object.values(byBucket).reduce((s, v) => s + v, 0);
  const data = BUCKET_ORDER.filter((b) => byBucket[b] > 0).map((b) => ({
    bucket: b,
    value: byBucket[b],
  }));

  const colorFor = (b: StrategyBucket) =>
    colors?.[`bucket-${b}` as const] ?? "transparent";

  return (
    <div className="rounded-card border border-black/10 bg-white p-5">
      <p className="text-[12px] uppercase tracking-[0.06em] text-muted">
        Répartition par poche
      </p>
      <div className="mt-3 flex items-center gap-6">
        <div className="h-[140px] w-[140px] shrink-0">
          {colors && total > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="bucket"
                  innerRadius={44}
                  outerRadius={68}
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {data.map((d) => (
                    <Cell key={d.bucket} fill={colorFor(d.bucket)} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <ul className="flex flex-col gap-2">
          {data.map((d) => (
            <li key={d.bucket} className="flex items-center gap-2 text-[13px]">
              <span
                className="inline-block h-2.5 w-2.5 rounded-pill"
                style={{ background: colorFor(d.bucket) }}
              />
              <span className="text-slate">{BUCKET_LABEL[d.bucket]}</span>
              <span className="text-muted">
                {formatPercent(d.value / total, 0)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
