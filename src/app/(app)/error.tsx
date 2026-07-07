"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

/** Frontière d'erreur (voix de l'interface, action de reprise). */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <PageShell className="py-24">
      <div className="mx-auto max-w-lg text-center">
        <Eyebrow>Une anomalie</Eyebrow>
        <h1 className="mt-3 text-[26px] font-medium leading-[32px]">
          Quelque chose s&apos;est <em className="pc">interrompu</em>.
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          L&apos;écran n&apos;a pas pu se charger. Réessayez ; si le problème
          persiste, revenez au tableau de bord.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>Réessayer</Button>
        </div>
      </div>
    </PageShell>
  );
}
