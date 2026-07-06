import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { DoubleChevron } from "./DoubleChevron";

/**
 * ui-button — CTA pilule (radius 999px) à chevron double.
 * Variantes (handoff §Boutons) :
 *  - primary   : fond corail, texte blanc, chevron blanc  (ui-button-primary)
 *  - secondary : transparent, bordure line, texte blanc    (ui-button-secondary)
 *  - light     : sur fond corail — fond cream, texte corail (ui-button-light)
 *  - ghost     : lien corail + chevron                      (ui-button-ghost)
 */
type Variant = "primary" | "secondary" | "light" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-coral text-white hover:bg-coral-deep disabled:bg-surface-disabled disabled:text-muted disabled:border disabled:border-line-2",
  secondary:
    "bg-transparent text-white border border-line hover:border-white disabled:text-muted disabled:border-line-2",
  light: "bg-cream text-coral hover:bg-white disabled:opacity-50",
  ghost:
    "bg-transparent text-coral px-0 hover:opacity-70 disabled:text-muted",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
  /** Masque le chevron double (rare — ex. bouton icône seul). */
  hideChevron?: boolean;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  children,
  hideChevron = false,
  fullWidth = false,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2.5 rounded-pill",
        "text-[15px] font-medium leading-none transition-colors duration-150",
        variant === "ghost" ? "py-1" : "px-7 py-[15px]",
        fullWidth ? "w-full" : "",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        VARIANTS[variant],
        className,
      ].join(" ")}
    >
      <span>{children}</span>
      {!hideChevron && <DoubleChevron />}
    </button>
  );
}
