import Link from "next/link";
import { Brand } from "./Brand";
import { PageShell } from "./PageShell";
import { PrimaryNav } from "./PrimaryNav";

/**
 * layout-app-header — barre : monogramme+wordmark, nav principale (outils de
 * travail) et bloc « Mon compte » (accès personnels : profil, conseillers,
 * rétrocessions, langue, déconnexion). Deux registres (handoff §Navigation) :
 * `dark` (socle sombre) / `light` (fond cream, texte slate).
 */
export function AppHeader({
  variant = "dark",
  action,
}: {
  variant?: "dark" | "light";
  action?: React.ReactNode;
}) {
  const isDark = variant === "dark";
  return (
    <header
      className={[
        "w-full border-b",
        isDark
          ? "bg-base text-white border-line-2"
          : "bg-cream text-slate border-black/10",
      ].join(" ")}
    >
      <PageShell className="flex h-[68px] items-center justify-between gap-6">
        <Link href="/" aria-label="Private Corner — accueil" className="shrink-0">
          <Brand />
        </Link>

        <PrimaryNav className="hidden items-center gap-7 xl:flex" />

        <div className="flex shrink-0 items-center gap-4">{action}</div>
      </PageShell>

      {/* Nav repliée (défilement horizontal sous xl) */}
      <PageShell className="flex gap-6 overflow-x-auto pb-3 xl:hidden">
        <PrimaryNav className="flex items-center gap-6" />
      </PageShell>
    </header>
  );
}
