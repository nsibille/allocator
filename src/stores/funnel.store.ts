import { create } from "zustand";
import type {
  Diversification,
  Experience,
  Immobilisation,
  LossCapacity,
  MifidStatus,
  Objective,
  PacingProfile,
  ReactionBaisse,
  RevenusStability,
  RiskProfile,
  Vehicle,
} from "@/types/domain";

/* État du funnel de qualification (Zustand, non persisté tant que non sauvegardé). */

// Ré-exports historiques (types déplacés vers types/domain).
export type { Experience, Immobilisation };

export interface FunnelState {
  step: number; // 0..7 (8 étapes)

  // Étape 1 — cabinet, client & catégorisation
  clientReference: string;
  mifidStatus: MifidStatus;
  acceptedVehicles: Vehicle[];
  ticketMin: number;

  // Étape 2 — patrimoine & enveloppe
  patrimoine: number | null;
  envelope: number;
  revenusStability: RevenusStability | null;

  // Étape 3 — profil de risque
  riskProfile: RiskProfile | null;
  experience: Experience | null;
  lossCapacity: LossCapacity | null;
  reactionBaisse: ReactionBaisse | null;

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

  // Étape 8 — sélection des fonds
  autoSelect: boolean;
  selectedFundIds: string[];

  set: <K extends keyof FunnelState>(key: K, value: FunnelState[K]) => void;
  toggleObjective: (o: Objective) => void;
  toggleStrategy: (s: PacingProfile) => void;
  toggleVehicle: (v: Vehicle) => void;
  toggleFund: (id: string) => void;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  reset: () => void;
}

export const STEP_COUNT = 8;
export const ENVELOPE_MIN = 25000;

const INITIAL = {
  step: 0,
  clientReference: "",
  mifidStatus: "non_professionnel" as MifidStatus,
  acceptedVehicles: ["eltif"] as Vehicle[],
  ticketMin: 100000,
  patrimoine: null,
  envelope: 200000,
  revenusStability: null,
  riskProfile: null,
  experience: null,
  lossCapacity: null,
  reactionBaisse: null,
  horizonYears: 10,
  immobilisation: null,
  callCapacity: false,
  objectives: [] as Objective[],
  strategies: [] as PacingProfile[],
  esg: false,
  diversification: "equilibre" as Diversification,
  autoSelect: true,
  selectedFundIds: [] as string[],
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

  toggleVehicle: (v) =>
    set((s) => ({
      acceptedVehicles: s.acceptedVehicles.includes(v)
        ? s.acceptedVehicles.filter((x) => x !== v)
        : [...s.acceptedVehicles, v],
    })),

  toggleFund: (id) =>
    set((s) => ({
      selectedFundIds: s.selectedFundIds.includes(id)
        ? s.selectedFundIds.filter((x) => x !== id)
        : [...s.selectedFundIds, id],
    })),

  next: () => set((s) => ({ step: Math.min(STEP_COUNT - 1, s.step + 1) })),
  prev: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
  goTo: (step) => set({ step: Math.max(0, Math.min(STEP_COUNT - 1, step)) }),
  reset: () => set(INITIAL),
}));
