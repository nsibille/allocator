import type {
  AllocationStatus,
  BulletinStatus,
  ClientStatus,
  DocumentStatus,
} from "@/types/domain";

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

export const CLIENT_STATUS: Record<
  ClientStatus,
  { label: string; tone: "active" | "neutral" }
> = {
  prospect: { label: "Prospect", tone: "neutral" },
  actif: { label: "Actif", tone: "active" },
  archive: { label: "Archivé", tone: "neutral" },
};

export const DOCUMENT_STATUS: Record<
  DocumentStatus,
  { label: string; tone: "active" | "neutral" }
> = {
  manquant: { label: "Manquant", tone: "neutral" },
  recu: { label: "Reçu", tone: "active" },
  valide: { label: "Validé", tone: "active" },
  expire: { label: "Expiré", tone: "neutral" },
};

export const RISK_PROFILE_LABEL: Record<string, string> = {
  prudent: "Prudent",
  equilibre: "Équilibré",
  dynamique: "Dynamique",
  offensif: "Offensif",
};
