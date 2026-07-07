import { Funnel } from "@/components/funnel/Funnel";
import { createClient } from "@/lib/supabase/server";
import { activeFunds } from "@/lib/funds";
import type { Fund } from "@/types/domain";

/** Funnel de qualification (client). §8.1 — 8 étapes, Zod par étape, moteur à la validation.
 *  `?client=<id>` rattache la piste à un client existant (lancée depuis sa fiche). */
export default async function NewAllocationPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client: clientId } = await searchParams;
  const supabase = await createClient();

  const [{ data: fundRows }, clientRes] = await Promise.all([
    supabase.from("funds").select("*").eq("is_active", true),
    clientId
      ? supabase
          .from("clients")
          .select("reference, first_name, last_name")
          .eq("id", clientId)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const funds = activeFunds((fundRows ?? []) as Fund[]);

  let presetClientReference: string | undefined;
  const client = clientRes.data;
  if (client) {
    presetClientReference =
      [client.first_name, client.last_name].filter(Boolean).join(" ") ||
      client.reference;
  }

  return (
    <Funnel
      funds={funds}
      presetClientId={clientId && presetClientReference ? clientId : undefined}
      presetClientReference={presetClientReference}
    />
  );
}
