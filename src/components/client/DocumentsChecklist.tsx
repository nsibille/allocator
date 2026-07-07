"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  addDocument,
  deleteDocument,
  updateDocument,
} from "@/app/(app)/clients/actions";
import { DOCUMENT_STATUS } from "@/lib/status";
import type { ClientDocumentRow, DocumentStatus } from "@/types/domain";

/**
 * client-documents-checklist — checklist documentaire (métadonnées seules).
 * Ajout / changement de statut / suppression via server actions. Registre clair.
 */
const DOC_TYPES = [
  "Pièce d'identité",
  "Justificatif de domicile",
  "RIB",
  "Avis d'imposition",
  "Questionnaire signé",
  "KYC / LCB-FT",
  "Autre",
];

const STATUS_KEYS = Object.keys(DOCUMENT_STATUS) as DocumentStatus[];

export function DocumentsChecklist({
  clientId,
  documents,
}: {
  clientId: string;
  documents: ClientDocumentRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [status, setStatus] = useState<DocumentStatus>("manquant");

  function onAdd() {
    if (name.trim().length < 2) {
      setError("Nom du document requis.");
      return;
    }
    startTransition(async () => {
      const res = await addDocument(clientId, {
        name: name.trim(),
        doc_type: docType,
        status,
        note: null,
      });
      if (res && "error" in res) setError(res.error);
      else {
        setName("");
        setStatus("manquant");
        setError(null);
      }
    });
  }

  function onChangeStatus(doc: ClientDocumentRow, next: DocumentStatus) {
    startTransition(async () => {
      const res = await updateDocument(clientId, doc.id, {
        name: doc.name,
        doc_type: doc.doc_type,
        status: next,
        note: doc.note,
      });
      if (res && "error" in res) setError(res.error);
    });
  }

  function onDelete(doc: ClientDocumentRow) {
    startTransition(async () => {
      const res = await deleteDocument(clientId, doc.id);
      if (res && "error" in res) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-card border border-black/10 bg-white p-6 md:p-8">
        <h2 className="text-[20px] font-medium tracking-[-0.01em]">
          Ajouter un document
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <Field
            registre="light"
            label="Intitulé"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Carte d'identité recto-verso"
          />
          <label className="block">
            <span className="mb-2.5 block text-[13px] text-slate">Type</span>
            <span className="flex items-center rounded-field border border-black/15 bg-white px-4 py-3.5 focus-within:border-coral">
              <select
                className="w-full bg-transparent text-slate outline-none"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label className="block">
            <span className="mb-2.5 block text-[13px] text-slate">Statut</span>
            <span className="flex items-center rounded-field border border-black/15 bg-white px-4 py-3.5 focus-within:border-coral">
              <select
                className="w-full bg-transparent text-slate outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value as DocumentStatus)}
              >
                {STATUS_KEYS.map((s) => (
                  <option key={s} value={s}>
                    {DOCUMENT_STATUS[s].label}
                  </option>
                ))}
              </select>
            </span>
          </label>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button onClick={onAdd} disabled={pending}>
            Ajouter à la checklist
          </Button>
          {error && <span className="text-[14px] text-coral">{error}</span>}
        </div>
      </section>

      {documents.length === 0 ? (
        <EmptyState
          title="Aucun document enregistré."
          description="Constituez la checklist KYC du client : pièce d'identité, justificatif de domicile, RIB, avis d'imposition…"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {documents.map((doc) => {
            const st = DOCUMENT_STATUS[doc.status];
            return (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-black/10 bg-white px-6 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">{doc.name}</p>
                  <p className="mt-0.5 text-[13px] text-muted">{doc.doc_type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={st.tone}>{st.label}</Badge>
                  <select
                    aria-label={`Statut de ${doc.name}`}
                    className="rounded-field border border-black/15 bg-white px-3 py-2 text-[13px] text-slate outline-none focus:border-coral"
                    value={doc.status}
                    disabled={pending}
                    onChange={(e) =>
                      onChangeStatus(doc, e.target.value as DocumentStatus)
                    }
                  >
                    {STATUS_KEYS.map((s) => (
                      <option key={s} value={s}>
                        {DOCUMENT_STATUS[s].label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => onDelete(doc)}
                    disabled={pending}
                    className="text-[13px] text-muted transition-colors hover:text-coral disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
