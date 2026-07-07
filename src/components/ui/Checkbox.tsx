"use client";

import { type ReactNode } from "react";
import { Check } from "lucide-react";

/**
 * ui-checkbox — carré 20px radius 6px ; coché = fond corail + ✓ blanc (handoff §Formulaires).
 */
export function Checkbox({
  checked,
  onChange,
  label,
  registre = "light",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  registre?: "dark" | "light";
}) {
  const isLight = registre === "light";
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 select-none">
      <span
        onClick={() => onChange(!checked)}
        className={[
          "flex h-5 w-5 items-center justify-center rounded-[6px] border transition-colors",
          checked
            ? "border-coral bg-coral text-white"
            : isLight
              ? "border-black/25 bg-white"
              : "border-line bg-base",
        ].join(" ")}
      >
        {checked && <Check size={14} strokeWidth={2.5} />}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={isLight ? "text-slate" : "text-white"}>{label}</span>
    </label>
  );
}
