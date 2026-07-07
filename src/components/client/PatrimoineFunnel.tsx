"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { addAsset, updateAsset } from "@/app/(app)/clients/actions";
import {
  ASSET_CLASSES,
  GEO_ZONES,
  assetClassDef,
  type AssetClassDef,
} from "@/lib/client/patrimoine.config";
import type { ClientAssetRow } from "@/types/domain";

/**
 * client-patrimoine-funnel — saisie d'un avoir en funnel piloté par la classe
 * d'actif : (1) choix de la classe, (2) champs contextuels (enveloppe fiscale,
 * type de support, zone géographique) propres à cette classe. Évite les
 * combinaisons absurdes du formulaire plat précédent.
 */
function Select({
  label,
  value,
  onChange,
  options,
  includeAuto,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { key: string; label: string }[];
  includeAuto?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-[13px] text-slate">{label}</span>
      <span className="flex items-center rounded-field border border-black/15 bg-white px-4 py-3.5 focus-within:border-coral">
        <select
          className="w-full bg-transparent text-slate outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {includeAuto && <option value="">Automatique (défaut)</option>}
          {options.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

export function PatrimoineFunnel({
  clientId,
  editing,
  onDone,
}: {
  clientId: string;
  editing: ClientAssetRow | null;
  onDone: () => void;
}) {
  const [step, setStep] = useState<"class" | "details">("class");
  const [classKey, setClassKey] = useState<string>(ASSET_CLASSES[0].key);
  const [support, setSupport] = useState("");
  const [envelope, setEnvelope] = useState("");
  const [geography, setGeography] = useState("");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Passage en mode édition : pré-remplir et aller directement au détail.
  useEffect(() => {
    if (!editing) return;
    setStep("details");
    setClassKey(editing.category);
    setSupport(editing.support);
    setEnvelope(editing.envelope ?? "");
    setGeography(editing.geography ?? "");
    setLabel(editing.label);
    setValue(String(Number(editing.value)));
    setNote(editing.note ?? "");
    setError(null);
  }, [editing]);

  const def: AssetClassDef | undefined = assetClassDef(classKey);

  function pickClass(c: AssetClassDef) {
    setClassKey(c.key);
    setSupport(c.supports[0]?.key ?? "");
    setEnvelope(c.envelopes?.[0]?.key ?? "");
    setGeography("");
    setStep("details");
    setError(null);
  }

  function resetAll() {
    setStep("class");
    setClassKey(ASSET_CLASSES[0].key);
    setSupport("");
    setEnvelope("");
    setGeography("");
    setLabel("");
    setValue("");
    setNote("");
    setError(null);
    onDone();
  }

  function goBack() {
    if (editing) resetAll();
    else setStep("class");
  }

  async function onSubmit() {
    if (!def) return;
    const num = Number(value.replace(/\s/g, "").replace(",", "."));
    if (label.trim().length < 2) return setError("Libellé requis.");
    if (!Number.isFinite(num) || num < 0)
      return setError("Valorisation invalide.");

    setPending(true);
    const payload = {
      category: classKey,
      support: support || "autre",
      envelope: def.envelopes ? envelope || undefined : undefined,
      geography: def.geography ? geography || undefined : undefined,
      label: label.trim(),
      value: num,
      note: note.trim() || undefined,
    };
    const res = editing
      ? await updateAsset(clientId, editing.id, payload)
      : await addAsset(clientId, payload);
    setPending(false);
    if (res && "error" in res) setError(res.error);
    else resetAll();
  }

  /* ------------------------------------------------------------ Étape 1 */
  if (step === "class" && !editing) {
    return (
      <section className="rounded-card border border-black/10 bg-white p-6 md:p-8">
        <h2 className="text-[20px] font-medium tracking-[-0.01em]">
          Ajouter un avoir
        </h2>
        <p className="mt-1 text-[13px] text-muted">
          Choisissez d'abord la classe d'actif.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ASSET_CLASSES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => pickClass(c)}
              className="flex flex-col items-start gap-1 rounded-card border border-black/10 bg-cream-2 p-5 text-left transition-colors hover:border-coral"
            >
              <span className="text-[22px] leading-none">{c.glyph}</span>
              <span className="mt-2 font-medium text-slate">{c.label}</span>
              <span className="text-[12px] leading-[17px] text-muted">
                {c.description}
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------------ Étape 2 */
  return (
    <section className="rounded-card border border-black/10 bg-white p-6 md:p-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-coral"
        >
          <ArrowLeft size={15} /> {editing ? "Annuler" : "Changer de classe"}
        </button>
      </div>
      <h2 className="mt-3 text-[20px] font-medium tracking-[-0.01em]">
        {editing ? "Modifier l'avoir" : "Ajouter un avoir"}
        <span className="ml-2 text-[15px] font-normal text-muted">
          {def?.glyph} {def?.label}
        </span>
      </h2>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {def?.envelopes && (
          <Select
            label="Enveloppe"
            value={envelope}
            onChange={setEnvelope}
            options={def.envelopes}
          />
        )}
        {def && def.supports.length > 1 && (
          <Select
            label={def.key === "immobilier" ? "Type de bien" : "Support"}
            value={support}
            onChange={setSupport}
            options={def.supports}
          />
        )}
        <Field
          registre="light"
          label="Libellé"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={
            classKey === "immobilier"
              ? "Ex. Appartement Lyon 6e"
              : classKey === "actions_fonds"
                ? "Ex. ETF MSCI World"
                : "Libellé de l'avoir"
          }
        />
        <Field
          registre="light"
          label="Valorisation (€)"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ex. 250000"
        />
        {def?.geography && (
          <Select
            label="Zone géographique (exposition)"
            value={geography}
            onChange={setGeography}
            options={GEO_ZONES}
            includeAuto
          />
        )}
        <div className="md:col-span-2">
          <Field
            registre="light"
            label="Note (optionnel)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex. Nue-propriété, crédit en cours…"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button onClick={onSubmit} disabled={pending}>
          {editing ? "Enregistrer" : "Ajouter au patrimoine"}
        </Button>
        {error && <span className="text-[14px] text-coral">{error}</span>}
      </div>
    </section>
  );
}
