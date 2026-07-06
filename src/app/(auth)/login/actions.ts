"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Connexion email / mot de passe (Supabase Auth). */
export async function signIn(_prev: string | null, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return error.message;

  redirect("/");
}

/** Inscription email / mot de passe. Le trigger handle_new_user crée le profil + rattache au cabinet démo. */
export async function signUp(_prev: string | null, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) return error.message;

  redirect("/");
}
