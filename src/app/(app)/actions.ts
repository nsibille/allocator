"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Déconnexion : ferme la session Supabase puis renvoie vers /login. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
