"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Receipt,
  UserRound,
  Users,
} from "lucide-react";
import { signOut } from "@/app/(app)/actions";

/**
 * layout-account-menu — regroupe les accès personnels du CGP sous « Mon compte » :
 * édition du profil, conseillers rattachés, rétrocessions, langue et déconnexion.
 * Allège la barre principale (handoff §Navigation). Registre clair (écrans de travail).
 */
type AccountLink = {
  href: string;
  label: string;
  icon: typeof UserRound;
};

const ACCOUNT_LINKS: AccountLink[] = [
  { href: "/compte", label: "Édition de mon profil", icon: UserRound },
  { href: "/conseillers", label: "Mes conseillers", icon: Users },
  { href: "/retrocessions", label: "Rétrocessions", icon: Receipt },
];

export function AccountMenu({ email }: { email?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Ferme sur navigation (le composant persiste dans le layout).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Ferme au clic extérieur + Échap.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          "flex items-center gap-2 rounded-pill border px-3.5 py-2 text-[13px] transition-colors",
          open
            ? "border-coral text-coral"
            : "border-black/15 text-slate hover:border-coral hover:text-coral",
        ].join(" ")}
      >
        <UserRound size={16} />
        <span className="hidden sm:inline">Mon compte</span>
        <ChevronDown
          size={15}
          className={[
            "transition-transform duration-150",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 rounded-card border border-black/10 bg-white p-2 shadow-[0_18px_50px_-12px_rgba(19,30,35,0.28)]"
        >
          <div className="px-3 pb-2 pt-1.5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
              Connecté en tant que
            </p>
            <p className="mt-1 truncate text-[13px] font-medium text-slate">
              {email ?? "—"}
            </p>
          </div>

          <div className="my-1 h-px bg-black/10" />

          {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              className="flex items-center gap-3 rounded-field px-3 py-2.5 text-[14px] text-slate transition-colors hover:bg-cream"
            >
              <Icon size={16} className="shrink-0 text-muted" />
              {label}
            </Link>
          ))}

          <div className="my-1 h-px bg-black/10" />

          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-[13px] text-muted">Langue</span>
            <div className="flex items-center overflow-hidden rounded-pill border border-black/15 text-[12px]">
              <button
                type="button"
                className="px-2.5 py-1 text-slate transition-colors hover:bg-cream"
              >
                EN
              </button>
              <span
                aria-current="true"
                className="bg-coral px-2.5 py-1 font-medium text-white"
              >
                FR
              </span>
            </div>
          </div>

          <div className="my-1 h-px bg-black/10" />

          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-field px-3 py-2.5 text-left text-[14px] text-slate transition-colors hover:bg-coral-wash hover:text-coral"
            >
              <LogOut size={16} className="shrink-0" />
              Déconnexion
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
