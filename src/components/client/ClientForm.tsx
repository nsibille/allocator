"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import {
  createInvestor,
  updateInvestorIdentity,
} from "@/app/(app)/clients/actions";
import type { ClientIdentityInput } from "@/lib/client/schema";
import type { ClientStatus, RiskProfile } from "@/types/domain";

/**
 * client-form-identity — saisie de l'identité nominative + attributs de base.
 * Sert la création (`mode="create"`) et l'édition (`mode="edit"`). Registre clair.
 */
type FormState = {
  reference: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  birth_date: string;
  nationality: string;
  status: ClientStatus;
  patrimoine_financier: string;
  risk_profile: RiskProfile | "";
  horizon_years: string;
  notes: string;
};

const STATUS_OPTIONS = [
  { value: "prospect", label: "Prospect" },
  { value: "actif", label: "Actif" },
  { value: "archive", label: "Archivé" },
] as const;

const RISK_OPTIONS = [
  { value: "prudent", label: "Prudent" },
  { value: "equilibre", label: "Équilibré" },
  { value: "dynamique", label: "Dynamique" },
  { value: "offensif", label: "Offensif" },
] as const;

export function ClientForm({
  mode,
  clientId,
  initial,
}: {
  mode: "create" | "edit";
  clientId?: string;
  initial?: Partial<FormState>;
}) {
  const [form, setForm] = useState<FormState>({
    reference: initial?.reference ?? "",
    first_name: initial?.first_name ?? "",
    last_name: initial?.last_name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    address: initial?.address ?? "",
    birth_date: initial?.birth_date ?? "",
    nationality: initial?.nationality ?? "",
    status: initial?.status ?? "prospect",
    patrimoine_financier: initial?.patrimoine_financier ?? "",
    risk_profile: initial?.risk_profile ?? "",
    horizon_years: initial?.horizon_years ?? "",
    notes: initial?.notes ?? "",
  });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  }

  function onSubmit() {
    const payload: ClientIdentityInput = {
      reference: form.reference.trim() || undefined,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      birth_date: form.birth_date || undefined,
      nationality: form.nationality,
      status: form.status,
      patrimoine_financier: form.patrimoine_financier
        ? Number(form.patrimoine_financier)
        : null,
      risk_profile: form.risk_profile || null,
      horizon_years: form.horizon_years ? Number(form.horizon_years) : null,
      notes: form.notes,
    };

    startTransition(async () => {
      const res =
        mode === "create"
          ? await createInvestor(payload)
          : await updateInvestorIdentity(clientId as string, payload);
      // En cas de succès, l'action redirige ; on ne reçoit un retour qu'en cas d'erreur.
      if (res && "error" in res) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-card border border-black/10 bg-white p-6 md:p-8">
        <h2 className="text-[20px] font-medium tracking-[-0.01em]">Identité</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field
            registre="light"
            label="Prénom"
            value={form.first_name}
            onChange={(e) => set("first_name", e.target.value)}
            placeholder="Jean"
          />
          <Field
            registre="light"
            label="Nom"
            value={form.last_name}
            onChange={(e) => set("last_name", e.target.value)}
            placeholder="Dupont"
          />
          <Field
            registre="light"
            label="Référence interne"
            value={form.reference}
            onChange={(e) => set("reference", e.target.value)}
            placeholder="Générée automatiquement si vide"
          />
          <Field
            registre="light"
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jean.dupont@email.fr"
          />
          <Field
            registre="light"
            label="Téléphone"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+33 6 12 34 56 78"
          />
          <Field
            registre="light"
            label="Date de naissance"
            type="date"
            value={form.birth_date}
            onChange={(e) => set("birth_date", e.target.value)}
          />
          <Field
            registre="light"
            label="Nationalité"
            value={form.nationality}
            onChange={(e) => set("nationality", e.target.value)}
            placeholder="Française"
          />
          <Field
            registre="light"
            label="Adresse"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="12 rue de la Paix, 75002 Paris"
          />
        </div>

        <div className="mt-6">
          <span className="mb-2.5 block text-[13px] text-slate">Statut</span>
          <Segmented
            registre="light"
            options={STATUS_OPTIONS as unknown as { value: string; label: string }[]}
            value={form.status}
            onChange={(v) => set("status", v as ClientStatus)}
          />
        </div>
      </section>

      <section className="rounded-card border border-black/10 bg-white p-6 md:p-8">
        <h2 className="text-[20px] font-medium tracking-[-0.01em]">
          Profil patrimonial
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field
            registre="light"
            label="Patrimoine financier net"
            type="number"
            inputMode="decimal"
            suffix="€"
            value={form.patrimoine_financier}
            onChange={(e) => set("patrimoine_financier", e.target.value)}
            placeholder="2 000 000"
          />
          <Field
            registre="light"
            label="Horizon d'investissement"
            type="number"
            inputMode="numeric"
            suffix="ans"
            value={form.horizon_years}
            onChange={(e) => set("horizon_years", e.target.value)}
            placeholder="10"
          />
        </div>
        <div className="mt-6">
          <span className="mb-2.5 block text-[13px] text-slate">
            Profil de risque
          </span>
          <Segmented
            registre="light"
            options={RISK_OPTIONS as unknown as { value: string; label: string }[]}
            value={form.risk_profile}
            onChange={(v) => set("risk_profile", v as RiskProfile)}
          />
        </div>
        <label className="mt-6 block">
          <span className="mb-2.5 block text-[13px] text-slate">Notes</span>
          <textarea
            className="w-full rounded-field border border-black/15 bg-white px-4 py-3.5 text-slate outline-none transition-colors focus:border-coral"
            rows={3}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Contexte, objectifs, points d'attention…"
          />
        </label>
      </section>

      {error && <p className="text-[14px] text-coral">{error}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={onSubmit} disabled={pending}>
          {pending
            ? "Enregistrement…"
            : mode === "create"
              ? "Créer le client"
              : "Enregistrer les modifications"}
        </Button>
        <Link
          href={mode === "edit" && clientId ? `/clients/${clientId}` : "/clients"}
          className="text-[14px] text-muted transition-opacity hover:opacity-70"
        >
          Annuler
        </Link>
      </div>
    </div>
  );
}
