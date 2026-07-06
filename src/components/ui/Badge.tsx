import { type ReactNode } from "react";

/**
 * ui-badge — pilule de statut. Deux tons uniquement (règle corail unique) :
 *  - `active`  : fond coral-wash, texte corail, puce ronde (« en cours »)  → ui-badge-status
 *  - `neutral` : fond gris discret, texte muted, bordure fine              → ui-badge-neutral
 * `outline` : bordure + texte corail, uppercase (ui-badge-outline).
 */
type Tone = "active" | "neutral" | "outline";

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-[12px] leading-none";
  const tones: Record<Tone, string> = {
    active: "bg-coral-wash text-coral",
    neutral: "bg-black/5 text-muted border border-black/10",
    outline:
      "border border-coral text-coral uppercase tracking-[0.14em] text-[11px]",
  };
  return (
    <span className={[base, tones[tone], className].join(" ")}>
      {tone === "active" && (
        <span className="inline-block h-1.5 w-1.5 rounded-pill bg-coral" />
      )}
      {children}
    </span>
  );
}
