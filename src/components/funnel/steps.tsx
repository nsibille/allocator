"use client";

import { useMemo } from "react";
import { Field } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { BucketDonut } from "@/components/allocation/BucketDonut";
import {
  BUCKET_LABEL,
  DIVERSIFICATION_RANGE,
  PACING_LABEL,
  VEHICLE_LABEL,
  formatEuro,
  formatPercent,
} from "@/lib/funds";
import { computeProfile } from "@/lib/allocation/profile";
import { eligibleFunds } from "@/lib/allocation/eligibility";
import { buildAllocation } from "@/lib/allocation/engine";
import { ENVELOPE_MIN, useFunnelStore } from "@/stores/funnel.store";
import { useFunnelFunds } from "./context";
import type {
  AllocationInput,
  Fund,
  MifidStatus,
  Objective,
  PacingProfile,
  QualificationInput,
  Vehicle,
} from "@/types/domain";

const ENVELOPE_PRESETS = [100000, 250000, 500000, 1000000, 2000000];

const VEHICLES: Vehicle[] = ["eltif", "fcpr", "fcpi", "fip", "feeder"];

/** Construit l'entrée de qualification (calcul de profil) à partir du store. */
function useQualificationInput(): QualificationInput | null {
  const s = useFunnelStore();
  if (!s.riskProfile) return null;
  return {
    patrimoine: s.patrimoine,
    envelope: s.envelope,
    riskProfile: s.riskProfile,
    experience: s.experience,
    horizonYears: s.horizonYears,
    immobilisation: s.immobilisation,
    callCapacity: s.callCapacity,
    objectives: s.objectives,
    esg: s.esg,
    revenusStability: s.revenusStability,
    lossCapacity: s.lossCapacity,
    reactionBaisse: s.reactionBaisse,
  };
}

/* funnel-step-cabinet */
export function StepCabinet() {
  const { clientReference, mifidStatus, acceptedVehicles, ticketMin, set, toggleVehicle } =
    useFunnelStore();
  return (
    <div className="flex flex-col gap-7">
      <div className="rounded-card border border-black/10 bg-cream-2 px-5 py-4 text-[14px] text-muted">
        Cabinet et conseiller sont rattachés à votre session. Renseignez une
        référence client anonymisée et la catégorisation réglementaire.
      </div>
      <Field
        registre="light"
        name="clientReference"
        label="Référence client (anonymisée)"
        placeholder="Ex. M.D. 2026"
        value={clientReference}
        onChange={(e) => set("clientReference", e.target.value)}
      />
      <div>
        <p className="mb-3 text-[13px] text-slate">Statut MiFID</p>
        <Segmented
          value={mifidStatus}
          onChange={(v) => set("mifidStatus", v as MifidStatus)}
          options={[
            { value: "non_professionnel", label: "Non-professionnel" },
            { value: "professionnel", label: "Professionnel" },
            { value: "contrepartie", label: "Contrepartie éligible" },
          ]}
        />
      </div>
      <div>
        <p className="mb-3 text-[13px] text-slate">
          Enveloppes éligibles (multi-sélection)
        </p>
        <Segmented
          columns={3}
          multiple
          value={acceptedVehicles}
          onChange={(v) => toggleVehicle(v as Vehicle)}
          options={VEHICLES.map((v) => ({ value: v, label: VEHICLE_LABEL[v] }))}
        />
      </div>
      <Field
        registre="light"
        name="ticketMin"
        type="number"
        inputMode="numeric"
        label="Ticket minimum accepté"
        placeholder="100 000"
        suffix="€"
        value={ticketMin || ""}
        onChange={(e) => set("ticketMin", e.target.value ? Number(e.target.value) : 0)}
      />
    </div>
  );
}

/* funnel-step-capital */
export function StepCapital() {
  const { patrimoine, envelope, revenusStability, set } = useFunnelStore();
  const ratio = patrimoine && patrimoine > 0 ? envelope / patrimoine : null;
  return (
    <div className="flex flex-col gap-7">
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

      <div>
        <p className="mb-3 text-[13px] text-slate">Stabilité des revenus</p>
        <Segmented
          columns={3}
          value={revenusStability ?? ("" as never)}
          onChange={(v) => set("revenusStability", v)}
          options={[
            { value: "stable", label: "Stables", hint: "Revenus récurrents" },
            { value: "variable", label: "Variables", hint: "Partiellement liés au marché" },
            { value: "irregulier", label: "Irréguliers", hint: "Faible visibilité" },
          ]}
        />
      </div>
    </div>
  );
}

/* funnel-step-risk */
export function StepRisk() {
  const { riskProfile, experience, lossCapacity, reactionBaisse, set } =
    useFunnelStore();
  return (
    <div className="flex flex-col gap-7">
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
          columns={3}
          value={experience ?? ("" as never)}
          onChange={(v) => set("experience", v)}
          options={[
            { value: "novice", label: "Novice" },
            { value: "initie", label: "Initié" },
            { value: "averti", label: "Averti" },
          ]}
        />
      </div>
      <div>
        <p className="mb-3 text-[13px] text-slate">
          Capacité de perte (part du patrimoine mobilisable)
        </p>
        <Segmented
          columns={4}
          value={lossCapacity ?? ("" as never)}
          onChange={(v) => set("lossCapacity", v)}
          options={[
            { value: "lt_10", label: "< 10 %" },
            { value: "10_25", label: "10–25 %" },
            { value: "25_50", label: "25–50 %" },
            { value: "gt_50", label: "> 50 %" },
          ]}
        />
      </div>
      <div>
        <p className="mb-3 text-[13px] text-slate">
          Réaction à une baisse de −20 % du portefeuille
        </p>
        <Segmented
          columns={1}
          value={reactionBaisse ?? ("" as never)}
          onChange={(v) => set("reactionBaisse", v)}
          options={[
            { value: "vendre", label: "Je vends pour limiter la perte" },
            { value: "attendre", label: "J'attends un retour à l'équilibre" },
            { value: "renforcer", label: "Je renforce mes positions" },
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
          columns={3}
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
  const { diversification, set } = useFunnelStore();
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
      <p className="text-[14px] text-muted">
        Le nombre de compartiments cible borne la sélection automatique et sert de
        repère pour une sélection manuelle.
      </p>
    </div>
  );
}

/* funnel-step-profile — récapitulatif : profil type + score de dynamisme. */
export function StepProfile() {
  const input = useQualificationInput();
  const profile = useMemo(
    () => (input ? computeProfile(input) : null),
    [input],
  );

  if (!input || !profile) {
    return (
      <p className="text-[14px] text-muted">
        Renseignez le profil de risque pour générer la synthèse.
      </p>
    );
  }

  // Donut d'allocation recommandée : montants synthétiques par poche.
  const recoAmounts: Record<string, number> = {};
  const recoFunds = new Map<string, Fund>();
  for (const b of profile.recommendedBuckets) {
    const id = `reco-${b.bucket}`;
    recoAmounts[id] = Math.round(b.weight * 100);
    recoFunds.set(id, { bucket: b.bucket } as Fund);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profil investisseur + score */}
        <div className="rounded-card border border-black/10 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[12px] uppercase tracking-[0.06em] text-muted">
                Profil investisseur
              </p>
              <div className="mt-2">
                <Badge tone="active">{profile.profileLabel}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[44px] font-medium leading-none tracking-[-0.02em] text-coral">
                {profile.dynamismScore}
              </div>
              <p className="mt-1 text-[12px] text-muted">Score de dynamisme</p>
            </div>
          </div>

          <ul className="mt-6 flex flex-col gap-3.5">
            {profile.subScores.map((s) => (
              <li key={s.key}>
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className="text-slate">{s.label}</span>
                  <span className="font-medium text-slate">{s.value}/100</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-pill bg-black/10">
                  <div
                    className="h-full rounded-pill bg-coral"
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Allocation stratégique recommandée */}
        <div className="flex flex-col gap-4">
          <BucketDonut amounts={recoAmounts} fundsById={recoFunds} />
          <div className="rounded-card border border-black/10 bg-cream-2 p-5 text-[13px] leading-[20px] text-muted">
            {profile.coherent ? (
              <>
                Le profil calculé <span className="text-slate">({profile.profileLabel})</span>{" "}
                est cohérent avec le profil déclaré. L&apos;allocation stratégique
                ci-contre servira de cadre à la sélection.
              </>
            ) : (
              <>
                Le profil calculé{" "}
                <span className="text-coral">({profile.profileLabel})</span> diffère
                du profil déclaré : vérifiez l&apos;adéquation avant de poursuivre.
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* funnel-step-selection — auto ou sélection manuelle parmi les fonds éligibles. */
export function StepSelection() {
  const funds = useFunnelFunds();
  const {
    autoSelect,
    selectedFundIds,
    mifidStatus,
    acceptedVehicles,
    envelope,
    riskProfile,
    objectives,
    strategies,
    esg,
    diversification,
    set,
    toggleFund,
  } = useFunnelStore();

  const eligible = useMemo(() => {
    if (!riskProfile) return [];
    return eligibleFunds(funds, {
      envelope,
      acceptedVehicles,
      professional: mifidStatus !== "non_professionnel",
      riskProfile,
    });
  }, [funds, envelope, acceptedVehicles, mifidStatus, riskProfile]);

  const range = DIVERSIFICATION_RANGE[diversification];

  function prefillFromEngine() {
    if (!riskProfile) return;
    const input: AllocationInput = {
      envelope,
      riskProfile,
      objectives,
      strategies,
      esg,
      diversification,
    };
    const picks = buildAllocation(input, eligible).map((l) => l.fundId);
    set("selectedFundIds", picks);
  }

  return (
    <div className="flex flex-col gap-6">
      <Checkbox
        checked={autoSelect}
        onChange={(v) => set("autoSelect", v)}
        label="Choisir automatiquement les fonds selon le profil (recommandé)."
      />

      {autoSelect ? (
        <div className="rounded-card border border-black/10 bg-cream-2 p-6 text-[14px] leading-[22px] text-muted">
          Le moteur d&apos;allocation composera le portefeuille parmi les{" "}
          <span className="text-slate">{eligible.length} fonds éligibles</span> à la
          catégorisation de l&apos;investisseur, en visant{" "}
          <span className="text-slate">
            {range.min}–{range.max} compartiments
          </span>
          . Vous pourrez ensuite ajuster la répartition et l&apos;exposition.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-muted">
              {selectedFundIds.length} sélectionné
              {selectedFundIds.length > 1 ? "s" : ""} · cible {range.min}–{range.max}{" "}
              · {eligible.length} éligibles
            </p>
            <button
              type="button"
              onClick={prefillFromEngine}
              className="text-[13px] font-medium text-coral transition-opacity hover:opacity-70"
            >
              Pré-remplir avec la reco
            </button>
          </div>

          {eligible.length === 0 ? (
            <p className="rounded-card border border-black/10 bg-cream-2 p-5 text-[14px] text-muted">
              Aucun fonds éligible avec cette catégorisation. Élargissez les
              enveloppes acceptées ou le profil de risque.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {eligible.map((f) => {
                const on = selectedFundIds.includes(f.id);
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleFund(f.id)}
                      className={[
                        "flex w-full flex-col gap-2 rounded-card border p-4 text-left transition-colors",
                        on
                          ? "border-coral bg-coral-wash"
                          : "border-black/12 bg-white hover:border-coral/50",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[14px] font-medium leading-tight text-slate">
                          {f.name}
                        </span>
                        {on && (
                          <span className="mt-0.5 shrink-0 text-[12px] font-medium text-coral">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge tone="neutral">{BUCKET_LABEL[f.bucket]}</Badge>
                        <Badge tone="neutral">{PACING_LABEL[f.pacing]}</Badge>
                        <Badge tone="neutral">{VEHICLE_LABEL[f.vehicle as Vehicle]}</Badge>
                        {(f.esg_score ?? 0) > 0 && <Badge tone="outline">ESG</Badge>}
                      </div>
                      <div className="flex items-center justify-between text-[12px] text-muted">
                        <span>{f.manager}</span>
                        <span>
                          Risque {f.risk_score ?? "—"}/5 · {formatEuro(f.min_ticket)}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
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
  StepProfile,
  StepSelection,
];
