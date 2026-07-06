import type { AllocationStatus, BulletinStatus } from "@/types/domain";

/* Libellés + tons de statut. Corail = signal « en cours / abouti » ; gris = neutre. */

export const ALLOCATION_STATUS: Record<
  AllocationStatus,
  { label: string; tone: "active" | "neutral" }
> = {
  draft: { label: "Brouillon", tone: "neutral" },
  proposed: { label: "Proposée", tone: "active" },
  validated: { label: "Validée", tone: "active" },
  subscribed: { label: "Souscrite", tone: "active" },
  archived: { label: "Archivée", tone: "neutral" },
};

export const BULLETIN_STATUS: Record<
  BulletinStatus,
  { label: string; tone: "active" | "neutral" }
> = {
  generated: { label: "Généré", tone: "active" },
  sent: { label: "Envoyé", tone: "active" },
  signed: { label: "Signé", tone: "active" },
  received: { label: "Reçu", tone: "neutral" },
};

export const RISK_PROFILE_LABEL: Record<string, string> = {
  prudent: "Prudent",
  equilibre: "Équilibré",
  dynamique: "Dynamique",
  offensif: "Offensif",
};
