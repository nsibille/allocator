import { Funnel } from "@/components/funnel/Funnel";
import { createClient } from "@/lib/supabase/server";

/** Funnel de qualification (client). §8.1 — 6 étapes, Zod par étape, moteur à la validation.
 *  `?client=<id>` rattache la piste à un client existant (lancée depuis sa fiche). */
export default async function NewAllocationPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client: clientId } = await searchParams;

  let presetClientReference: string | undefined;
  if (clientId) {
    const supabase = await createClient();
    const { data: client } = await supabase
      .from("clients")
      .select("reference, first_name, last_name")
      .eq("id", clientId)
      .single();
    if (client) {
      presetClientReference =
        [client.first_name, client.last_name].filter(Boolean).join(" ") ||
        client.reference;
    }
  }

  return (
    <Funnel
      presetClientId={clientId && presetClientReference ? clientId : undefined}
      presetClientReference={presetClientReference}
    />
  );
}
