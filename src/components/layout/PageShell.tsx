import { type ReactNode } from "react";

/**
 * layout-page-shell — conteneur centré 1160px, marge latérale 40px (handoff §Grille).
 */
export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={["mx-auto w-full px-10", className].join(" ")}
      style={{ maxWidth: "var(--container)" }}
    >
      {children}
    </div>
  );
}
