import { create } from "zustand";
import type { Scenario } from "@/types/domain";

/* État d'édition de l'allocation en cours (Zustand). Persisté en base par debounce. */

export interface AllocationEditState {
  allocationId: string;
  /** Montants par fonds (fundId → euros). */
  amounts: Record<string, number>;
  scenario: Scenario;
  distPace: number;
  /** Compteur de révisions — incrémenté à chaque édition (déclenche la sauvegarde). */
  rev: number;

  init: (payload: {
    allocationId: string;
    amounts: Record<string, number>;
    scenario: Scenario;
    distPace: number;
  }) => void;
  setAmount: (fundId: string, amount: number) => void;
  addFund: (fundId: string, amount: number) => void;
  removeFund: (fundId: string) => void;
  setScenario: (s: Scenario) => void;
  setPace: (p: number) => void;
}

export const useAllocationStore = create<AllocationEditState>((set) => ({
  allocationId: "",
  amounts: {},
  scenario: "central",
  distPace: 0,
  rev: 0,

  init: ({ allocationId, amounts, scenario, distPace }) =>
    set({ allocationId, amounts, scenario, distPace, rev: 0 }),

  setAmount: (fundId, amount) =>
    set((s) => ({
      amounts: { ...s.amounts, [fundId]: Math.max(0, amount) },
      rev: s.rev + 1,
    })),

  addFund: (fundId, amount) =>
    set((s) =>
      s.amounts[fundId] != null
        ? s
        : { amounts: { ...s.amounts, [fundId]: amount }, rev: s.rev + 1 },
    ),

  removeFund: (fundId) =>
    set((s) => {
      const next = { ...s.amounts };
      delete next[fundId];
      return { amounts: next, rev: s.rev + 1 };
    }),

  setScenario: (scenario) => set((s) => ({ scenario, rev: s.rev + 1 })),
  setPace: (distPace) => set((s) => ({ distPace, rev: s.rev + 1 })),
}));
