"use client";

import { type ReactNode } from "react";

/**
 * ui-segmented — pilules côte à côte ; sélectionné = bordure corail + fond coral-wash
 * (handoff §Formulaires). Mono ou multi-sélection.
 */
export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  hint?: ReactNode;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  multiple = false,
  columns,
  registre = "light",
}: {
  options: SegmentedOption<T>[];
  value: T | T[];
  onChange: (value: T) => void;
  multiple?: boolean;
  columns?: number;
  registre?: "dark" | "light";
}) {
  const selected = Array.isArray(value) ? value : [value];
  const isLight = registre === "light";

  return (
    <div
      role={multiple ? "group" : "radiogroup"}
      className={columns ? "grid gap-2.5" : "flex flex-wrap gap-2.5"}
      style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` } : undefined}
    >
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            role={multiple ? "checkbox" : "radio"}
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={[
              "rounded-pill border px-4 py-2.5 text-left text-[14px] transition-colors",
              active
                ? "border-coral bg-coral-wash text-coral"
                : isLight
                  ? "border-black/15 text-slate hover:border-coral/50"
                  : "border-line text-white hover:border-white/50",
            ].join(" ")}
          >
            <span className="block font-medium leading-tight">{opt.label}</span>
            {opt.hint != null && (
              <span
                className={[
                  "mt-0.5 block text-[12px] leading-tight",
                  active ? "text-coral/80" : "text-muted",
                ].join(" ")}
              >
                {opt.hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
