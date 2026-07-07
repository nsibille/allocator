import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { createClient } from "@/lib/supabase/server";

/**
 * Garde d'auth (CLAUDE_CODE_PROMPT §9) : redirige vers /login sans session.
 * proxy.ts assure déjà le refresh + la redirection ; ce garde est la ceinture serveur.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-dvh bg-cream text-slate">
      <AppHeader variant="light" action={<AccountMenu email={user.email} />} />
      {children}
    </div>
  );
}
