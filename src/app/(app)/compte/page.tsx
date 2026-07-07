import { revalidatePath } from "next/cache";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TitleAccent } from "@/components/ui/TitleAccent";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

/**
 * portal-account-profile — édition du profil du CGP connecté (identité + cabinet).
 * Point d'accès depuis « Mon compte » (layout-account-menu). L'email provient de la
 * session Supabase ; les autres champs sont un échafaudage de démonstration en
 * attendant une table `profiles` dédiée (persistance à câbler).
 */
async function saveProfile() {
  "use server";
  // TODO(persistence) : brancher sur une table `profiles` (MCP Supabase).
  revalidatePath("/compte");
}

export default async function ComptePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <PageShell className="py-14">
      <Eyebrow>Mon compte</Eyebrow>
      <TitleAccent
        className="mt-3 text-[42px] font-medium leading-[46px] tracking-[-0.01em]"
        title="Éditer mon profil"
        accentWord="profil"
      />
      <p className="mt-3 max-w-2xl text-[15px] text-muted">
        Vos coordonnées de conseiller et les informations du cabinet, utilisées
        sur les propositions et bulletins générés depuis le portail.
      </p>

      <form action={saveProfile} className="mt-10 max-w-3xl">
        <section className="rounded-card border border-black/10 bg-white p-6">
          <h2 className="text-[13px] uppercase tracking-[0.06em] text-muted">
            Identité
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              registre="light"
              name="first_name"
              label="Prénom"
              defaultValue="Camille"
            />
            <Field
              registre="light"
              name="last_name"
              label="Nom"
              defaultValue="Rousseau"
            />
            <Field
              registre="light"
              name="email"
              type="email"
              label="Email"
              defaultValue={user?.email ?? ""}
            />
            <Field
              registre="light"
              name="phone"
              type="tel"
              label="Téléphone"
              defaultValue="+33 6 12 34 56 78"
            />
          </div>
        </section>

        <section className="mt-6 rounded-card border border-black/10 bg-white p-6">
          <h2 className="text-[13px] uppercase tracking-[0.06em] text-muted">
            Cabinet
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              registre="light"
              name="firm"
              label="Cabinet"
              defaultValue="Cabinet Chevallier"
            />
            <Field
              registre="light"
              name="role"
              label="Rôle"
              defaultValue="Conseiller principal"
            />
            <Field
              registre="light"
              name="orias"
              label="Numéro ORIAS"
              defaultValue="12 345 678"
            />
            <Field
              registre="light"
              name="rcs"
              label="RCS / SIREN"
              defaultValue="824 512 337"
            />
          </div>
        </section>

        <div className="mt-8 flex justify-end">
          <Button type="submit">Enregistrer</Button>
        </div>
      </form>
    </PageShell>
  );
}
