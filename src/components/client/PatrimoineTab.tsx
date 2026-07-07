"use client";

import { useState, useTransition } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { deleteAsset } from "@/app/(app)/clients/actions";
import { PatrimoineConsolidation } from "./PatrimoineConsolidation";
import { PatrimoineFunnel } from "./PatrimoineFunnel";
import { formatEuro } from "@/lib/funds";
import {
  ASSET_CLASSES,
  envelopeLabel,
  supportLabel,
} from "@/lib/client/patrimoine.config";
import { consolidatePatrimoine, type PcHolding } from "@/lib/client/wealth";
import type { ClientAssetRow } from "@/types/domain";

/**
 * client-patrimoine — onglet Patrimoine : vue consolidée (déclaré + Private
 * Corner transparisé), saisie en funnel par classe d'actif, liste des avoirs
 * groupée par classe.
 */
export function PatrimoineTab({
  clientId,
  assets,
  pcHoldings,
}: {
  clientId: string;
  assets: ClientAssetRow[];
  pcHoldings: PcHolding[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ClientAssetRow | null>(null);

  const consolidation = consolidatePatrimoine(assets, pcHoldings);
  const declaredTotal = assets.reduce((s, a) => s + Number(a.value), 0);
  const groups = ASSET_CLASSES.map((c) => ({
    ...c,
    items: assets.filter((a) => a.category === c.key),
  })).filter((g) => g.items.length > 0);

  function onDelete(a: ClientAssetRow) {
    startTransition(async () => {
      const res = await deleteAsset(clientId, a.id);
      if (res && "error" in res) setError(res.error);
      else if (editing?.id === a.id) setEditing(null);
    });
  }

  function subline(a: ClientAssetRow): string {
    return [envelopeLabel(a.envelope), supportLabel(a.support), a.geography, a.note]
      .filter(Boolean)
      .join(" · ");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Vue patrimoniale consolidée (déclaré + Private Corner transparisé) */}
      <PatrimoineConsolidation consolidation={consolidation} />

      {/* Saisie en funnel par classe d'actif */}
      <PatrimoineFunnel
        clientId={clientId}
        editing={editing}
        onDone={() => setEditing(null)}
      />

      {/* Liste des avoirs déclarés, groupée par classe d'actif */}
      {assets.length === 0 ? (
        <EmptyState
          title="Aucun avoir renseigné."
          description="Constituez la photographie patrimoniale du client : immobilier (résidence principale, locatif), PEA, PER, assurance-vie, autres fonds de Private Equity, comptes-titres…"
        />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[16px] font-medium tracking-[-0.01em] text-slate">
              Avoirs déclarés
            </h2>
            <p className="text-[14px] text-muted">
              Total déclaré ·{" "}
              <span className="font-medium text-slate">
                {formatEuro(declaredTotal)}
              </span>
            </p>
          </div>
          {error && <p className="text-[14px] text-coral">{error}</p>}

          {groups.map((g) => (
            <section key={g.key}>
              <h3 className="text-[13px] font-medium uppercase tracking-[0.06em] text-slate">
                {g.glyph} {g.label}
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
                        {subline(a)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[17px] font-medium tracking-[-0.02em]">
                        {formatEuro(Number(a.value))}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditing(a)}
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
        Private Corner (suivis dans l'onglet Souscriptions et intégrés à la vue
        consolidée ci-dessus).
      </p>
    </div>
  );
}
