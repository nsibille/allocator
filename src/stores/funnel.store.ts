import { create } from "zustand";
import type {
  Diversification,
  Objective,
  PacingProfile,
  RiskProfile,
} from "@/types/domain";

/* État du funnel de qualification (Zustand, non persisté tant que non sauvegardé). */

export type Experience = "novice" | "initie" | "averti";
export type Immobilisation = "faible" | "moyenne" | "forte";

export interface FunnelState {
  step: number; // 0..5 (6 étapes)

  // Étape 1 — cabinet & client
  clientReference: string;
  /** Piste rattachée à une fiche existante : patrimoine & profil sont alors
   *  pré-remplis depuis la fiche et toute modification la met à jour. */
  linkedClient: boolean;

  // Étape 2 — patrimoine & enveloppe
  patrimoine: number | null;
  envelope: number;

  // Étape 3 — profil de risque
  riskProfile: RiskProfile | null;
  experience: Experience | null;

  // Étape 4 — horizon & liquidité
  horizonYears: number;
  immobilisation: Immobilisation | null;
  callCapacity: boolean;

  // Étape 5 — objectifs & thèmes
  objectives: Objective[];
  strategies: PacingProfile[];
  esg: boolean;

  // Étape 6 — diversification
  diversification: Diversification;

  set: <K extends keyof FunnelState>(key: K, value: FunnelState[K]) => void;
  toggleObjective: (o: Objective) => void;
  toggleStrategy: (s: PacingProfile) => void;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  reset: () => void;
}

export const STEP_COUNT = 6;
export const ENVELOPE_MIN = 25000;

const INITIAL = {
  step: 0,
  clientReference: "",
  linkedClient: false,
  patrimoine: null,
  envelope: 200000,
  riskProfile: null,
  experience: null,
  horizonYears: 10,
  immobilisation: null,
  callCapacity: false,
  objectives: [] as Objective[],
  strategies: [] as PacingProfile[],
  esg: false,
  diversification: "equilibre" as Diversification,
};

export const useFunnelStore = create<FunnelState>((set) => ({
  ...INITIAL,

  set: (key, value) => set({ [key]: value } as Partial<FunnelState>),

  toggleObjective: (o) =>
    set((s) => ({
      objectives: s.objectives.includes(o)
        ? s.objectives.filter((x) => x !== o)
        : [...s.objectives, o],
    })),

  toggleStrategy: (st) =>
    set((s) => ({
      strategies: s.strategies.includes(st)
        ? s.strategies.filter((x) => x !== st)
        : [...s.strategies, st],
    })),

  next: () => set((s) => ({ step: Math.min(STEP_COUNT - 1, s.step + 1) })),
  prev: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  goTo: (step) => set({ step: Math.max(0, Math.min(STEP_COUNT - 1, step)) }),
  reset: () => set(INITIAL),
}));
