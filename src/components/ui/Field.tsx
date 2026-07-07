import { type InputHTMLAttributes, type ReactNode } from "react";

/**
 * ui-field-text — champ texte : label mist, fond base, bordure line, radius 12px,
 * focus → bordure corail (handoff §Formulaires). Suffixe d'unité optionnel (ui-field-currency).
 * Registre `dark` (fond sombre) par défaut ; `light` pour les écrans de travail cream.
 */
type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  suffix?: ReactNode;
  registre?: "dark" | "light";
};

export function Field({
  label,
  suffix,
  registre = "dark",
  id,
  className = "",
  ...rest
}: FieldProps) {
  const fieldId = id ?? rest.name;
  const isLight = registre === "light";
  return (
    <label htmlFor={fieldId} className="block">
      <span
        className={[
          "mb-2.5 block text-[13px]",
          isLight ? "text-slate" : "text-mist",
        ].join(" ")}
      >
        {label}
      </span>
      <span
        className={[
          "flex items-center rounded-field border px-4 py-3.5 transition-colors",
          "focus-within:border-coral",
          isLight
            ? "bg-white border-black/15 text-slate"
            : "bg-base border-line text-white",
        ].join(" ")}
      >
        <input
          id={fieldId}
          className={[
            "w-full bg-transparent outline-none placeholder:text-muted",
            className,
          ].join(" ")}
          {...rest}
        />
        {suffix != null && (
          <span className="ml-2 shrink-0 text-muted">{suffix}</span>
        )}
      </span>
    </label>
  );
}
