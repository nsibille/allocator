import { Funnel } from "@/components/funnel/Funnel";
import { createClient } from "@/lib/supabase/server";
import type { Experience } from "@/stores/funnel.store";
import type { RiskProfile } from "@/types/domain";

/** Funnel de qualification (client). §8.1 — 6 étapes, Zod par étape, moteur à la validation.
 *  `?client=<id>` rattache la piste à un client existant (lancée depuis sa fiche) :
 *  patrimoine & profil de risque sont alors pré-remplis depuis la fiche et remis à jour
 *  à la génération de l'allocation. */
const EXPERIENCES: Experience[] = ["novice", "initie", "averti"];

export default async function NewAllocationPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client: clientId } = await searchParams;

  let presetClientReference: string | undefined;
  let preset:
    | {
        patrimoine: number | null;
        riskProfile: RiskProfile | null;
        experience: Experience | null;
      }
    | undefined;

  if (clientId) {
    const supabase = await createClient();
    const { data: client } = await supabase
      .from("clients")
      .select(
        "reference, first_name, last_name, patrimoine_financier, risk_profile, experience",
      )
      .eq("id", clientId)
      .single();
    if (client) {
      presetClientReference =
        [client.first_name, client.last_name].filter(Boolean).join(" ") ||
        client.reference;
      preset = {
        patrimoine:
          client.patrimoine_financier != null
            ? Number(client.patrimoine_financier)
            : null,
        riskProfile: client.risk_profile ?? null,
        experience:
          client.experience &&
          EXPERIENCES.includes(client.experience as Experience)
            ? (client.experience as Experience)
            : null,
      };
    }
  }

  const linked = Boolean(clientId && presetClientReference);

  return (
    <Funnel
      presetClientId={linked ? clientId : undefined}
      presetClientReference={presetClientReference}
      preset={linked ? preset : undefined}
    />
  );
}
