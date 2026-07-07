"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * layout-primary-nav — navigation principale (outils de travail quotidiens).
 * État actif signalé au corail (l'accent signale, ne décore pas). Le reste des
 * accès personnels (profil, conseillers, rétrocessions, langue, déconnexion) est
 * regroupé dans `layout-account-menu`.
 */
export type NavItem = { href: string; label: string };

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Accueil" },
  { href: "/clients", label: "Clients" },
  { href: "/fonds", label: "Nos fonds" },
  { href: "/offres", label: "Offres" },
  { href: "/souscriptions", label: "Souscriptions" },
  { href: "/documents", label: "Documents" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function PrimaryNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav className={className}>
      {PRIMARY_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={[
              "whitespace-nowrap text-[13px] uppercase tracking-[0.06em] transition-colors",
              active ? "text-coral" : "hover:text-coral",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
