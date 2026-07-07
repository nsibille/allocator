"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { addAsset, deleteAsset, updateAsset } from "@/app/(app)/clients/actions";
import { formatEuro, formatPercent } from "@/lib/funds";
import {
  ASSET_CATEGORIES,
  ASSET_SUPPORTS,
  categoryLabel,
  supportLabel,
} from "@/lib/client/patrimoine.config";
import type { ClientAssetRow } from "@/types/domain";

/**
 * client-patrimoine — patrimoine déclaré de l'investisseur (avoirs hors gamme
 * Private Corner) : synthèse par enveloppe + saisie / édition / suppression des
 * avoirs (enveloppe, support, libellé, valorisation). Server actions, RLS.
 */
export function PatrimoineTab({
  clientId,
  assets,
}: {
  clientId: string;
  assets: ClientAssetRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [category, setCategory] = useState(ASSET_CATEGORIES[0].key);
  const [support, setSupport] = useState(ASSET_SUPPORTS[0].key);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");

  const total = assets.reduce((s, a) => s + Number(a.value), 0);
  const groups = ASSET_CATEGORIES.map((c) => ({
    ...c,
    items: assets.filter((a) => a.category === c.key),
  })).filter((g) => g.items.length > 0);

  function resetForm() {
    setEditingId(null);
    setCategory(ASSET_CATEGORIES[0].key);
    setSupport(ASSET_SUPPORTS[0].key);
    setLabel("");
    setValue("");
    setNote("");
    setError(null);
  }

  function onSubmit() {
    const num = Number(value.replace(/\s/g, "").replace(",", "."));
    if (label.trim().length < 2) return setError("Libellé requis.");
    if (!Number.isFinite(num) || num < 0)
      return setError("Valorisation invalide.");

    startTransition(async () => {
      const payload = {
        category,
        support,
        label: label.trim(),
        value: num,
        note: note.trim() || undefined,
      };
      const res = editingId
        ? await updateAsset(clientId, editingId, payload)
        : await addAsset(clientId, payload);
      if (res && "error" in res) setError(res.error);
      else resetForm();
    });
  }

  function onEdit(a: ClientAssetRow) {
    setEditingId(a.id);
    setCategory(a.category);
    setSupport(a.support);
    setLabel(a.label);
    setValue(String(Number(a.value)));
    setNote(a.note ?? "");
    setError(null);
  }

  function onDelete(a: ClientAssetRow) {
    startTransition(async () => {
      const res = await deleteAsset(clientId, a.id);
      if (res && "error" in res) setError(res.error);
      else if (editingId === a.id) resetForm();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Synthèse par enveloppe */}
      <section className="rounded-card border border-black/10 bg-white p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-[20px] font-medium tracking-[-0.01em]">
            Patrimoine déclaré
          </h2>
          <p className="text-[26px] font-medium tracking-[-0.02em]">
            {formatEuro(total)}
          </p>
        </div>
        {groups.length > 0 && (
          <ul className="mt-6 flex flex-col gap-3">
            {groups.map((g) => {
              const catTotal = g.items.reduce((s, a) => s + Number(a.value), 0);
              const share = total > 0 ? catTotal / total : 0;
              return (
                <li key={g.key}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[14px] text-slate">{g.label}</span>
                    <span className="text-[13px] text-muted">
                      {formatEuro(catTotal)} · {formatPercent(share, 0)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-pill bg-black/10">
                    <div
                      className="h-full rounded-pill bg-coral"
                      style={{ width: `${Math.round(share * 100)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Formulaire ajout / édition */}
      <section className="rounded-card border border-black/10 bg-white p-6 md:p-8">
        <h2 className="text-[20px] font-medium tracking-[-0.01em]">
          {editingId ? "Modifier l'avoir" : "Ajouter un avoir"}
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2.5 block text-[13px] text-slate">Enveloppe</span>
            <span className="flex items-center rounded-field border border-black/15 bg-white px-4 py-3.5 focus-within:border-coral">
              <select
                className="w-full bg-transparent text-slate outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {ASSET_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label className="block">
            <span className="mb-2.5 block text-[13px] text-slate">Support</span>
            <span className="flex items-center rounded-field border border-black/15 bg-white px-4 py-3.5 focus-within:border-coral">
              <select
                className="w-full bg-transparent text-slate outline-none"
                value={support}
                onChange={(e) => setSupport(e.target.value)}
              >
                {ASSET_SUPPORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <Field
            registre="light"
            label="Libellé"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex. Résidence principale, ETF MSCI World"
          />
          <Field
            registre="light"
            label="Valorisation (€)"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ex. 250000"
          />
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
            {editingId ? "Enregistrer" : "Ajouter au patrimoine"}
          </Button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={pending}
              className="text-[14px] text-muted transition-colors hover:text-slate"
            >
              Annuler
            </button>
          )}
          {error && <span className="text-[14px] text-coral">{error}</span>}
        </div>
      </section>

      {/* Liste des avoirs groupée par enveloppe */}
      {assets.length === 0 ? (
        <EmptyState
          title="Aucun avoir renseigné."
          description="Constituez la photographie patrimoniale du client : immobilier (résidence principale, locatif), PEA, PER, assurance-vie, autres fonds de Private Equity, comptes-titres…"
        />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((g) => (
            <section key={g.key}>
              <h3 className="text-[13px] font-medium uppercase tracking-[0.06em] text-slate">
                {g.label}
              </h3>
              <ul className="mt-3 flex flex-col gap-3">
                {g.items.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-black/10 bg-white px-6 py-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{a.label}</p>
                      <p className="mt-0.5 text-[13px] text-muted">
                        {supportLabel(a.support)}
                        {a.note ? ` · ${a.note}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[17px] font-medium tracking-[-0.02em]">
                        {formatEuro(Number(a.value))}
                      </span>
                      <button
                        type="button"
                        onClick={() => onEdit(a)}
                        disabled={pending}
                        className="text-[13px] text-muted transition-colors hover:text-coral disabled:opacity-50"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(a)}
                        disabled={pending}
                        className="text-[13px] text-muted transition-colors hover:text-coral disabled:opacity-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="text-[12px] leading-[18px] text-muted">
        Patrimoine déclaratif renseigné par le conseiller, à titre indicatif pour
        l'adéquation et la diversification. Hors avoirs souscrits via la gamme
        Private Corner (suivis dans l'onglet Souscriptions).
      </p>
    </div>
  );
}
