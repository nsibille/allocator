"use client";

import { useEffect, useState } from "react";

/**
 * Lit les tokens de couleur depuis les variables CSS (:root) pour alimenter Recharts
 * en valeurs concrètes — aucun hex en dur (règle DESIGN_SYSTEM). Résolu après montage.
 */
const TOKENS = [
  "coral",
  "coral-deep",
  "coral-wash",
  "teal",
  "muted",
  "mist",
  "line",
  "base",
  "slate",
  "bucket-defensif",
  "bucket-coeur",
  "bucket-croissance",
  "bucket-satellite",
] as const;

export type ThemeColorKey = (typeof TOKENS)[number];

export function useThemeColors(): Record<ThemeColorKey, string> | null {
  const [colors, setColors] = useState<Record<ThemeColorKey, string> | null>(
    null,
  );

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const read = (t: ThemeColorKey) =>
      style.getPropertyValue(`--color-${t}`).trim();
    const out = {} as Record<ThemeColorKey, string>;
    for (const t of TOKENS) out[t] = read(t);
    setColors(out);
  }, []);

  return colors;
}
