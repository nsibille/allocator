import Link from "next/link";
import { Brand } from "./Brand";
import { PageShell } from "./PageShell";

/**
 * layout-app-header — barre : monogramme+wordmark, nav uppercase .06em, sélecteur langue EN|FR.
 * Deux registres (handoff §Navigation) : `dark` (socle sombre) / `light` (fond cream, texte slate).
 */
type NavItem = { href: string; label: string };

const DEFAULT_NAV: NavItem[] = [
  { href: "/", label: "Tableau de bord" },
  { href: "/conseillers", label: "Conseillers" },
  { href: "/documents", label: "Documents" },
  { href: "/fonds", label: "Nos fonds" },
  { href: "/offres", label: "Offres" },
  { href: "/souscriptions", label: "Souscriptions" },
  { href: "/investisseurs", label: "Investisseurs" },
  { href: "/retrocessions", label: "Rétrocessions" },
];

export function AppHeader({
  variant = "dark",
  nav = DEFAULT_NAV,
  action,
}: {
  variant?: "dark" | "light";
  nav?: NavItem[];
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
      <PageShell className="flex h-[68px] items-center justify-between">
        <Link href="/" aria-label="Private Corner — accueil">
          <Brand />
        </Link>

        <nav className="hidden items-center gap-6 xl:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-[13px] uppercase tracking-[0.06em] transition-opacity hover:opacity-70"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <span
            className={[
              "hidden text-[12px] tracking-[0.06em] sm:inline",
              isDark ? "text-mist" : "text-muted",
            ].join(" ")}
          >
            EN<span className="mx-1 opacity-40">|</span>
            <span className="text-coral">FR</span>
          </span>
          {action}
        </div>
      </PageShell>

      {/* Nav repliée (défilement horizontal sous xl) */}
      <PageShell className="flex gap-6 overflow-x-auto pb-3 xl:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap text-[13px] uppercase tracking-[0.06em] transition-opacity hover:opacity-70"
          >
            {item.label}
          </Link>
        ))}
      </PageShell>
    </header>
  );
}
