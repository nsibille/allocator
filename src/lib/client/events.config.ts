import type { ClientEventType, EventActor } from "@/types/domain";

/**
 * Registre des types d'événements de la timeline relationnelle (CRM data-driven).
 * Donnée pure (pas de dépendance UI) : libellés FR, catégorie, acteur par défaut,
 * accent (corail = signal fort : souscription / flux financier), champ montant.
 * Les icônes sont mappées côté composant client (`ClientTimeline`).
 */
export type EventCategory =
  | "relation"
  | "consultation"
  | "qualification"
  | "souscription"
  | "flux"
  | "systeme";

export interface EventTypeMeta {
  label: string;
  category: EventCategory;
  defaultActor: EventActor;
  /** Signal fort → puce/accent corail (respecte l'accent unique). */
  accent?: boolean;
  /** Affiche un champ montant dans le composeur et une pastille montant. */
  financial?: boolean;
  /** Proposé dans le composeur manuel du CGP. */
  manual?: boolean;
}

export const EVENT_TYPES: Record<ClientEventType, EventTypeMeta> = {
  client_created: { label: "Client créé", category: "systeme", defaultActor: "conseiller" },
  login: {
    label: "Connexion au portail",
    category: "consultation",
    defaultActor: "client",
    manual: true,
  },
  fund_viewed: {
    label: "Consultation d'un fonds",
    category: "consultation",
    defaultActor: "client",
    manual: true,
  },
  document_viewed: {
    label: "Document consulté",
    category: "consultation",
    defaultActor: "client",
    manual: true,
  },
  document_downloaded: {
    label: "Document téléchargé",
    category: "consultation",
    defaultActor: "client",
    manual: true,
  },
  document_added: {
    label: "Document ajouté",
    category: "qualification",
    defaultActor: "conseiller",
  },
  document_updated: {
    label: "Document mis à jour",
    category: "qualification",
    defaultActor: "conseiller",
  },
  proposal_created: {
    label: "Proposition d'investissement",
    category: "souscription",
    defaultActor: "conseiller",
    accent: true,
  },
  proposal_sent: {
    label: "Proposition envoyée",
    category: "souscription",
    defaultActor: "conseiller",
    accent: true,
    manual: true,
  },
  proposal_viewed: {
    label: "Proposition consultée",
    category: "consultation",
    defaultActor: "client",
    manual: true,
  },
  questionnaire_updated: {
    label: "Questionnaire mis à jour",
    category: "qualification",
    defaultActor: "conseiller",
  },
  profile_updated: {
    label: "Fiche mise à jour",
    category: "qualification",
    defaultActor: "conseiller",
  },
  status_changed: {
    label: "Changement de statut",
    category: "qualification",
    defaultActor: "conseiller",
  },
  contact_added: {
    label: "Contact ajouté",
    category: "qualification",
    defaultActor: "conseiller",
    manual: true,
  },
  phone_call: {
    label: "Échange téléphonique",
    category: "relation",
    defaultActor: "conseiller",
    manual: true,
  },
  meeting: {
    label: "Rendez-vous",
    category: "relation",
    defaultActor: "conseiller",
    manual: true,
  },
  email: {
    label: "Email",
    category: "relation",
    defaultActor: "conseiller",
    manual: true,
  },
  note: {
    label: "Note du CGP",
    category: "relation",
    defaultActor: "conseiller",
    manual: true,
  },
  subscription_created: {
    label: "Souscription générée",
    category: "souscription",
    defaultActor: "conseiller",
    accent: true,
    financial: true,
  },
  subscription_signed: {
    label: "Bulletin signé",
    category: "souscription",
    defaultActor: "client",
    accent: true,
    manual: true,
  },
  capital_call: {
    label: "Appel de fonds",
    category: "flux",
    defaultActor: "systeme",
    accent: true,
    financial: true,
    manual: true,
  },
  distribution: {
    label: "Distribution",
    category: "flux",
    defaultActor: "systeme",
    accent: true,
    financial: true,
    manual: true,
  },
  other: {
    label: "Événement",
    category: "systeme",
    defaultActor: "conseiller",
    manual: true,
  },
};

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; order: number }
> = {
  relation: { label: "Relation", order: 0 },
  souscription: { label: "Souscription", order: 1 },
  flux: { label: "Flux", order: 2 },
  qualification: { label: "Qualification", order: 3 },
  consultation: { label: "Consultation", order: 4 },
  systeme: { label: "Système", order: 5 },
};

export const ACTOR_LABEL: Record<EventActor, string> = {
  conseiller: "CGP",
  client: "Client",
  systeme: "Système",
};

/** États d'un flux (appel / distribution) pour `data.state`. */
export const FLOW_STATE_LABEL: Record<string, string> = {
  annoncee: "Annoncée",
  recue: "Reçue",
  lue: "Lue",
  payee: "Payée",
  encaissee: "Encaissée",
};

/** Types proposés dans le composeur manuel, ordonnés par catégorie. */
export const MANUAL_EVENT_TYPES = (
  Object.keys(EVENT_TYPES) as ClientEventType[]
)
  .filter((t) => EVENT_TYPES[t].manual)
  .sort(
    (a, b) =>
      CATEGORY_META[EVENT_TYPES[a].category].order -
      CATEGORY_META[EVENT_TYPES[b].category].order,
  );
