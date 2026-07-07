import type { Fund, RiskProfile, Vehicle } from "@/types/domain";
import { activeFunds } from "@/lib/funds";

/* =========================================================================
   Éligibilité d'un fonds à la catégorisation de l'investisseur — logique pure.
   Un fonds est retenu si son véhicule fait partie des enveloppes acceptées, si
   son gating MiFID est respecté, s'il est finançable dans l'enveloppe et si sa
   note de risque est compatible avec la tolérance retenue. Réutilisé par le
   funnel (UI de sélection) ET la Server Action (sécurisation serveur).
   ========================================================================= */

/** Note de risque maximale admise par profil déclaré. */
export const RISK_CAP: Record<RiskProfile, number> = {
  prudent: 3,
  equilibre: 4,
  dynamique: 5,
  offensif: 5,
};

export interface EligibilityCriteria {
  /** Enveloppe dédiée : borne de finançabilité (min_ticket ≤ enveloppe). */
  envelope: number;
  /** Enveloppes / véhicules acceptés par l'investisseur. */
  acceptedVehicles: Vehicle[];
  /** L'investisseur est professionnel (ou contrepartie éligible). */
  professional: boolean;
  /** Profil de risque déclaré (détermine le plafond de note de risque). */
  riskProfile: RiskProfile;
}

/** Un fonds est-il éligible à la catégorisation de l'investisseur ? */
export function isEligible(fund: Fund, crit: EligibilityCriteria): boolean {
  // Véhicule accepté (aucune enveloppe cochée ⇒ rien d'éligible).
  if (!crit.acceptedVehicles.includes(fund.vehicle as Vehicle)) return false;
  // Gating MiFID : fonds réservé aux professionnels.
  if (fund.professional_only && !crit.professional) return false;
  // Finançabilité : le ticket minimum doit tenir dans l'enveloppe.
  if (fund.min_ticket > crit.envelope) return false;
  // Compatibilité de risque (note nulle traitée comme neutre = 3).
  const risk = fund.risk_score ?? 3;
  if (risk > RISK_CAP[crit.riskProfile]) return false;
  return true;
}

/** Sous-ensemble éligible de la gamme active, trié par sort_order. */
export function eligibleFunds(funds: Fund[], crit: EligibilityCriteria): Fund[] {
  return activeFunds(funds).filter((f) => isEligible(f, crit));
}
