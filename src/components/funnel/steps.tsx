"use client";

import { Field } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { Checkbox } from "@/components/ui/Checkbox";
import { formatEuro, formatPercent, PACING_LABEL } from "@/lib/funds";
import { DIVERSIFICATION_RANGE } from "@/lib/funds";
import { ENVELOPE_MIN, useFunnelStore } from "@/stores/funnel.store";
import type { Objective, PacingProfile } from "@/types/domain";

const ENVELOPE_PRESETS = [100000, 250000, 500000, 1000000, 2000000];

/** Bandeau indiquant qu'une valeur est reprise de la fiche et y sera réenregistrée. */
function FicheHint({ who }: { who?: string }) {
  return (
    <div className="rounded-card border border-black/10 bg-cream-2 px-5 py-4 text-[14px] text-muted">
      Repris de la fiche{who ? <> de {who}</> : ""}. Ajustez si besoin pendant
      l&apos;échange&nbsp;: la fiche sera mise à jour à la génération de
      l&apos;allocation.
    </div>
  );
}

/* funnel-step-cabinet */
export function StepCabinet() {
  const { clientReference, set } = useFunnelStore();
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-card border border-black/10 bg-cream-2 px-5 py-4 text-[14px] text-muted">
        Cabinet et conseiller sont rattachés à votre session. Renseignez une
        référence client anonymisée (ex. initiales + année).
      </div>
      <Field
        registre="light"
        name="clientReference"
        label="Référence client (anonymisée)"
        placeholder="Ex. M.D. 2026"
        value={clientReference}
        onChange={(e) => set("clientReference", e.target.value)}
      />
    </div>
  );
}

/* funnel-step-capital */
export function StepCapital() {
  const { patrimoine, envelope, clientReference, linkedClient, set } =
    useFunnelStore();
  const ratio = patrimoine && patrimoine > 0 ? envelope / patrimoine : null;
  return (
    <div className="flex flex-col gap-7">
      {linkedClient && <FicheHint who={clientReference} />}
      <Field
        registre="light"
        name="patrimoine"
        type="number"
        inputMode="numeric"
        label="Patrimoine financier net"
        placeholder="1 000 000"
        suffix="€"
        value={patrimoine ?? ""}
        onChange={(e) =>
          set("patrimoine", e.target.value ? Number(e.target.value) : null)
        }
      />

      <div>
        <div className="mb-2.5 flex items-end justify-between">
          <span className="text-[13px] text-slate">
            Enveloppe dédiée aux marchés privés
          </span>
          <span className="text-[26px] font-medium tracking-[-0.02em]">
            {formatEuro(envelope)}
          </span>
        </div>
        <input
          type="range"
          min={ENVELOPE_MIN}
          max={Math.max(patrimoine ?? 3000000, 3000000)}
          step={25000}
          value={envelope}
          onChange={(e) => set("envelope", Number(e.target.value))}
          className="w-full accent-coral"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {ENVELOPE_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => set("envelope", p)}
              className={[
                "rounded-pill border px-3.5 py-1.5 text-[13px] transition-colors",
                envelope === p
                  ? "border-coral bg-coral-wash text-coral"
                  : "border-black/15 text-slate hover:border-coral/50",
              ].join(" ")}
            >
              {formatEuro(p)}
            </button>
          ))}
        </div>
        {ratio != null && (
          <p className="mt-4 text-[14px] text-muted">
            Soit{" "}
            <span className="text-coral">{formatPercent(ratio)}</span> du
            patrimoine financier.
          </p>
        )}
      </div>
    </div>
  );
}

/* funnel-step-risk */
export function StepRisk() {
  const { riskProfile, experience, clientReference, linkedClient, set } =
    useFunnelStore();
  return (
    <div className="flex flex-col gap-7">
      {linkedClient && <FicheHint who={clientReference} />}
      <div>
        <p className="mb-3 text-[13px] text-slate">Profil d&apos;investisseur</p>
        <Segmented
          columns={2}
          value={riskProfile ?? ("" as never)}
          onChange={(v) => set("riskProfile", v)}
          options={[
            { value: "prudent", label: "Prudent", hint: "Préservation avant tout" },
            { value: "equilibre", label: "Équilibré", hint: "Performance mesurée" },
            { value: "dynamique", label: "Dynamique", hint: "Croissance affirmée" },
            { value: "offensif", label: "Offensif", hint: "Recherche de surperformance" },
          ]}
        />
      </div>
      <div>
        <p className="mb-3 text-[13px] text-slate">Expérience du non-coté</p>
        <Segmented
          value={experience ?? ("" as never)}
          onChange={(v) => set("experience", v)}
          options={[
            { value: "novice", label: "Novice" },
            { value: "initie", label: "Initié" },
            { value: "averti", label: "Averti" },
          ]}
        />
      </div>
    </div>
  );
}

/* funnel-step-horizon */
export function StepHorizon() {
  const { horizonYears, immobilisation, callCapacity, set } = useFunnelStore();
  return (
    <div className="flex flex-col gap-7">
      <div>
        <div className="mb-2.5 flex items-end justify-between">
          <span className="text-[13px] text-slate">Horizon de détention</span>
          <span className="text-[26px] font-medium tracking-[-0.02em]">
            {horizonYears} <span className="text-coral">ans</span>
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={15}
          step={1}
          value={horizonYears}
          onChange={(e) => set("horizonYears", Number(e.target.value))}
          className="w-full accent-coral"
        />
      </div>
      <div>
        <p className="mb-3 text-[13px] text-slate">
          Capacité d&apos;immobilisation
        </p>
        <Segmented
          value={immobilisation ?? ("" as never)}
          onChange={(v) => set("immobilisation", v)}
          options={[
            { value: "faible", label: "Faible" },
            { value: "moyenne", label: "Moyenne" },
            { value: "forte", label: "Forte" },
          ]}
        />
      </div>
      <Checkbox
        checked={callCapacity}
        onChange={(v) => set("callCapacity", v)}
        label="Le client peut honorer des appels de fonds échelonnés sur plusieurs années."
      />
    </div>
  );
}

const OBJECTIVES: { value: Objective; label: string; hint: string }[] = [
  { value: "croissance", label: "Croissance", hint: "Valorisation du capital" },
  { value: "diversification", label: "Diversification", hint: "Hors marchés cotés" },
  { value: "decorrelation", label: "Décorrélation", hint: "Réduction de la volatilité" },
  { value: "rendement", label: "Rendement", hint: "Distributions régulières" },
  { value: "impact", label: "Impact", hint: "Orientation durable" },
  { value: "acces", label: "Accès", hint: "Gérants d'exception" },
];

/* funnel-step-objectives */
export function StepObjectives() {
  const { objectives, strategies, esg, toggleObjective, toggleStrategy, set } =
    useFunnelStore();
  const pacings = Object.keys(PACING_LABEL) as PacingProfile[];
  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="mb-3 text-[13px] text-slate">
          Objectifs (multi-sélection)
        </p>
        <Segmented
          columns={3}
          multiple
          value={objectives}
          onChange={(v) => toggleObjective(v)}
          options={OBJECTIVES}
        />
      </div>
      <div>
        <p className="mb-3 text-[13px] text-slate">
          Stratégies souhaitées (optionnel)
        </p>
        <Segmented
          columns={3}
          multiple
          value={strategies}
          onChange={(v) => toggleStrategy(v)}
          options={pacings.map((p) => ({ value: p, label: PACING_LABEL[p] }))}
        />
      </div>
      <Checkbox
        checked={esg}
        onChange={(v) => set("esg", v)}
        label="Privilégier les compartiments à orientation durable."
      />
    </div>
  );
}

/* funnel-step-diversification */
export function StepDiversification() {
  const { diversification, riskProfile, envelope, horizonYears, objectives, set } =
    useFunnelStore();
  return (
    <div className="flex flex-col gap-7">
      <Segmented
        columns={3}
        value={diversification}
        onChange={(v) => set("diversification", v)}
        options={(["concentre", "equilibre", "large"] as const).map((d) => ({
          value: d,
          label:
            d === "concentre"
              ? "Concentré"
              : d === "equilibre"
                ? "Équilibré"
                : "Large",
          hint: `${DIVERSIFICATION_RANGE[d].min}–${DIVERSIFICATION_RANGE[d].max} fonds`,
        }))}
      />

      <div className="rounded-card border border-black/10 bg-cream-2 p-6">
        <p className="mb-4 text-[12px] uppercase tracking-[0.06em] text-muted">
          Récapitulatif
        </p>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[14px]">
          <dt className="text-muted">Enveloppe</dt>
          <dd className="text-right font-medium">{formatEuro(envelope)}</dd>
          <dt className="text-muted">Profil</dt>
          <dd className="text-right font-medium capitalize">
            {riskProfile ?? "—"}
          </dd>
          <dt className="text-muted">Horizon</dt>
          <dd className="text-right font-medium">{horizonYears} ans</dd>
          <dt className="text-muted">Objectifs</dt>
          <dd className="text-right font-medium">
            {objectives.length || "—"}
          </dd>
        </dl>
      </div>
    </div>
  );
}

export const STEP_COMPONENTS = [
  StepCabinet,
  StepCapital,
  StepRisk,
  StepHorizon,
  StepObjectives,
  StepDiversification,
];
