"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/app/(app)/actions";

/** Bouton de déconnexion (dans layout-app-header). */
export function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        aria-label="Se déconnecter"
        className="flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-coral"
      >
        <LogOut size={15} />
        <span className="hidden sm:inline">Déconnexion</span>
      </button>
    </form>
  );
}
