import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

/** Introuvable (voix de l'interface). */
export default function NotFound() {
  return (
    <PageShell className="py-24">
      <div className="mx-auto max-w-lg text-center">
        <Eyebrow>Introuvable</Eyebrow>
        <h1 className="mt-3 text-[26px] font-medium leading-[32px]">
          Cette page n&apos;<em className="pc">existe</em> pas.
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          Le contenu demandé est introuvable ou n&apos;appartient pas à votre
          cabinet.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/">
            <Button>Retour au tableau de bord</Button>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
