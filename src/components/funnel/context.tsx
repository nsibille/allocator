"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Fund } from "@/types/domain";

/**
 * Contexte du funnel : expose la gamme active (chargée côté serveur) aux étapes
 * profil et sélection, sans re-fetch côté client.
 */
const FunnelFundsContext = createContext<Fund[]>([]);

export function FunnelFundsProvider({
  funds,
  children,
}: {
  funds: Fund[];
  children: ReactNode;
}) {
  return (
    <FunnelFundsContext.Provider value={funds}>
      {children}
    </FunnelFundsContext.Provider>
  );
}

export function useFunnelFunds(): Fund[] {
  return useContext(FunnelFundsContext);
}
