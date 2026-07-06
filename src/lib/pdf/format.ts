import { formatEuro, formatMultiple, formatPercent } from "@/lib/funds";

/**
 * Formats sûrs pour le PDF : les séparateurs de milliers fr-FR utilisent une espace
 * fine insécable (U+202F) absente des polices intégrées @react-pdf (Helvetica) — on la
 * remplace, ainsi que l'espace insécable (U+00A0), par une espace normale.
 */
const cleanNbsp = (s: string) => s.replace(/[\u202F\u00A0]/g, " ");

export const pdfEuro = (n: number) => cleanNbsp(formatEuro(n));
export const pdfPercent = (n: number, digits?: number) =>
  cleanNbsp(formatPercent(n, digits));
export const pdfMultiple = (n: number, digits?: number) =>
  cleanNbsp(formatMultiple(n, digits));
