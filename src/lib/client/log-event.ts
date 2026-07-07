import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database.types";
import type { ClientEventType, EventActor } from "@/types/domain";
import { EVENT_TYPES } from "./events.config";

/**
 * Journalise un événement dans la timeline d'activité d'un client.
 * Helper serveur (appelé depuis les Server Actions / Route Handlers). Best-effort :
 * un échec de log ne doit jamais faire échouer l'action métier appelante.
 */
export async function logClientEvent(
  supabase: SupabaseClient<Database>,
  params: {
    clientId: string;
    cabinetId: string;
    type: ClientEventType;
    actor?: EventActor;
    title?: string | null;
    body?: string | null;
    data?: Record<string, Json>;
    occurredAt?: string;
  },
): Promise<void> {
  try {
    await supabase.from("client_events").insert({
      client_id: params.clientId,
      cabinet_id: params.cabinetId,
      type: params.type,
      actor: params.actor ?? EVENT_TYPES[params.type].defaultActor,
      title: params.title ?? null,
      body: params.body ?? null,
      data: (params.data ?? {}) as Json,
      occurred_at: params.occurredAt ?? undefined,
    });
  } catch {
    // Best-effort : la timeline ne doit pas bloquer le flux métier.
  }
}
