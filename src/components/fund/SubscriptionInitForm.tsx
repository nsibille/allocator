"use client";

import { useState, useTransition } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { TicketStepper } from "@/components/allocation/TicketStepper";
import { DoubleChevron } from "@/components/ui/DoubleChevron";
import { formatEuro } from "@/lib/funds";
import {
  initSubscription,
  type InitSubscriptionPayload,
} from "@/app/(app)/fonds/[slug]/souscrire/actions";

export interface InvestorOption {
  id: string;
  label: string;
}

/**
 * fund-subscribe-form — initialisation d'une souscription mono-fonds : choix de
 * l'investisseur (client existant ou nouvel investisseur), montant au pas du
 * ticket, puis création de la note d'allocation. Registre clair (écran de travail).
 */
export function SubscriptionInitForm({
  fundSlug,
  minTicket,
  investors,
}: {
  fundSlug: string;
  minTicket: number;
  investors: InvestorOption[];
}) {
  const hasInvestors = investors.length > 0;
  const [mode, setMode] = useState<"existing" | "new">(
    hasInvestors ? "existing" : "new",
  );
  const [clientId, setClientId] = useState<string>(investors[0]?.id ?? "");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState(minTicket);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canSubmit =
    amount >= minTicket &&
    (mode === "existing" ? clientId !== "" : reference.trim().length >= 2);

  function submit() {
    setError(null);
    const payload: InitSubscriptionPayload = {
      fundSlug,
      amount,
      ...(mode === "existing"
        ? { clientId }
        : { clientReference: reference.trim() }),
    };
    startTransition(async () => {
      const res = await initSubscription(payload);
      if (res && "error" in res) setError(res.error);
    });
  }

  return (
    <div className="rounded-card border border-black/10 bg-white p-6">
      {/* Investisseur */}
      <p className="text-[13px] text-slate">Pour le compte de</p>
      {hasInvestors && (
        <div className="mt-2.5">
          <Segmented<"existing" | "new">
            options={[
              { value: "existing", label: "Un investisseur du cabinet" },
              { value: "new", label: "Un nouvel investisseur" },
            ]}
            value={mode}
            onChange={setMode}
            registre="light"
          />
        </div>
      )}

      {mode === "existing" && hasInvestors ? (
        <label className="mt-4 block">
          <span className="mb-2.5 block text-[13px] text-slate">Investisseur</span>
          <span className="flex items-center rounded-field border border-black/15 bg-white px-4 py-3.5 transition-colors focus-within:border-coral">
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-transparent text-slate outline-none"
            >
              {investors.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.label}
                </option>
              ))}
            </select>
          </span>
        </label>
      ) : (
        <label className="mt-4 block">
          <span className="mb-2.5 block text-[13px] text-slate">
            Nom / référence de l'investisseur
          </span>
          <span className="flex items-center rounded-field border border-black/15 bg-white px-4 py-3.5 transition-colors focus-within:border-coral">
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex. Famille Durand"
              className="w-full bg-transparent text-slate outline-none placeholder:text-muted"
            />
          </span>
          <span className="mt-2 block text-[12px] text-muted">
            Un dossier prospect sera créé et rattaché à cette souscription.
          </span>
        </label>
      )}

      {/* Montant */}
      <div className="mt-6 border-t border-black/10 pt-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[13px] text-slate">Montant de la souscription</p>
            <p className="mt-1 text-[12px] text-muted">
              Ticket minimum {formatEuro(minTicket)}
            </p>
          </div>
          <p className="text-[30px] font-medium tracking-[-0.02em] text-slate">
            {formatEuro(amount)}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <TicketStepper
            value={amount}
            step={minTicket}
            max={minTicket * 500}
            onChange={setAmount}
          />
          <span className="text-[12px] text-muted">
            Pas de {formatEuro(minTicket)}
          </span>
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-field border border-coral bg-coral-wash px-4 py-3 text-[13px] text-coral">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit || pending}
        className="mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-pill bg-coral px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-coral-deep disabled:cursor-not-allowed disabled:bg-surface-disabled disabled:text-muted"
      >
        <span>{pending ? "Création en cours…" : "Créer la souscription"}</span>
        {!pending && <DoubleChevron />}
      </button>
      <p className="mt-3 text-center text-[12px] text-muted">
        La note d'allocation s'ouvre ensuite pour finaliser et générer le
        bulletin.
      </p>
    </div>
  );
}
