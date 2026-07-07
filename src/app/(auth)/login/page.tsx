"use client";

import { useActionState, useState } from "react";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Field } from "@/components/ui/Field";
import { signIn, signUp } from "./actions";

/**
 * auth-login-panel — connexion email/mot de passe (handoff : focus corail).
 * Registre sombre hero-gradient à gauche, carte de connexion claire à droite.
 * (auth-login-google = V2, non activé — voir CLAUDE_CODE_PROMPT §9.)
 */
export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action = mode === "signin" ? signIn : signUp;
  const [error, formAction, pending] = useActionState<string | null, FormData>(
    action,
    null,
  );

  return (
    <main
      className="grid min-h-dvh grid-cols-1 lg:grid-cols-2"
      style={{ background: "var(--hero-gradient)" }}
    >
      {/* Volet marque (registre sombre) */}
      <section className="hidden flex-col justify-between p-14 text-white lg:flex">
        <Brand />
        <div className="max-w-md">
          <Eyebrow>Portail d&apos;allocation CGP</Eyebrow>
          <h1 className="mt-5 text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
            L&apos;accès aux <em className="pc">marchés privés</em>, en gestion
            déléguée.
          </h1>
          <p className="mt-5 text-[17px] leading-[26px] text-mist">
            Qualifiez le besoin, composez l&apos;allocation sur la gamme Private
            Corner, projetez la courbe en J et générez les bulletins de
            souscription.
          </p>
        </div>
        <p className="text-[12px] tracking-[0.06em] text-muted">
          Private Corner — Société de gestion agréée AMF GP-20000038
        </p>
      </section>

      {/* Volet connexion (registre clair) */}
      <section className="flex items-center justify-center bg-cream p-8 text-slate">
        <div className="w-full max-w-[400px]">
          <Eyebrow>{mode === "signin" ? "Connexion" : "Créer un compte"}</Eyebrow>
          <h2 className="mt-3 text-[26px] font-medium leading-[32px]">
            {mode === "signin" ? (
              <>
                Bienvenue sur <em className="pc">My Corner</em>
              </>
            ) : (
              <>
                Rejoindre <em className="pc">Private Corner</em>
              </>
            )}
          </h2>

          <form action={formAction} className="mt-8 flex flex-col gap-4">
            {mode === "signup" && (
              <Field
                registre="light"
                name="full_name"
                label="Nom complet"
                autoComplete="name"
                placeholder="Camille Durand"
              />
            )}
            <Field
              registre="light"
              name="email"
              type="email"
              label="Adresse e-mail"
              autoComplete="email"
              required
              placeholder="vous@cabinet.fr"
            />
            <Field
              registre="light"
              name="password"
              type="password"
              label="Mot de passe"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              required
              minLength={6}
              placeholder="••••••••"
            />

            {error && (
              <p role="alert" className="text-[13px] text-coral">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth disabled={pending}>
              {pending
                ? "Un instant…"
                : mode === "signin"
                  ? "Se connecter"
                  : "Créer le compte"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() =>
              setMode((m) => (m === "signin" ? "signup" : "signin"))
            }
            className="mt-6 text-[13px] text-coral underline-offset-4 hover:underline"
          >
            {mode === "signin"
              ? "Pas encore de compte ? Créer un compte"
              : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </section>
    </main>
  );
}
