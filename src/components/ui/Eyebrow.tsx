import { type ReactNode } from "react";

/**
 * ui-eyebrow-label — sur-titre corail, letter-spacing .24em, uppercase (handoff §Échelle typo).
 */
export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={[
        "text-coral uppercase text-xs leading-none",
        "tracking-[0.24em]",
        className,
      ].join(" ")}
    >
      {children}
    </p>
  );
}
