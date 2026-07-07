"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { PageShell } from "@/components/layout/PageShell";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Badge } from "@/components/ui/Badge";
import { Stat } from "@/components/ui/Stat";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { QuestionnaireForm } from "./QuestionnaireForm";
import { DocumentsChecklist } from "./DocumentsChecklist";
import { PatrimoineTab } from "./PatrimoineTab";
import { ClientTimeline } from "./ClientTimeline";
import { deleteInvestor, setClientStatus } from "@/app/(app)/clients/actions";
import {
  QUESTIONNAIRES,
  questionnaireCompletion,
} from "@/lib/client/questionnaires.config";
import {
  ALLOCATION_STATUS,
  BULLETIN_STATUS,
  CLIENT_STATUS,
  RISK_PROFILE_LABEL,
} from "@/lib/status";
import { formatEuro } from "@/lib/funds";
import type {
  AllocationStatus,
  BulletinStatus,
  ClientAssetRow,
  ClientDocumentRow,
  ClientEventRow,
  ClientRow,
  ClientStatus,
  QuestionnaireAnswers,
} from "@/types/domain";

export type ClientLead = {
  id: string;
  name: string;
  envelope_amount: number;
  risk_profile: string;
  status: AllocationStatus;
  updated_at: string;
};

export type ClientSubscription = {
  id: string;
  reference: string;
  amount: number;
  status: BulletinStatus;
  generated_at: string;
  fund_name: string | null;
};

type TabKey =
  | "profil"
  | "activite"
  | "patrimoine"
  | "qualification"
  | "documents"
  | "souscriptions"
  | "pistes";

const TABS: { key: TabKey; label: string }[] = [
  { key: "profil", label: "Profil" },
  { key: "activite", label: "Activité" },
  { key: "patrimoine", label: "Patrimoine" },
  { key: "qualification", label: "Qualification" },
  { key: "documents", label: "Documents" },
  { key: "souscriptions", label: "Souscriptions" },
  { key: "pistes", label: "Pistes d'investissement" },
];

function asAnswers(json: unknown): QuestionnaireAnswers {
  return (json && typeof json === "object" ? json : {}) as QuestionnaireAnswers;
}

export function ClientDetail({
  client,
  documents,
  assets,
  leads,
  subscriptions,
  events,
}: {
  client: ClientRow;
  documents: ClientDocumentRow[];
  assets: ClientAssetRow[];
  leads: ClientLead[];
  subscriptions: ClientSubscription[];
  events: ClientEventRow[];
}) {
  const [tab, setTab] = useState<TabKey>("profil");

  const fullName =
    [client.first_name, client.last_name].filter(Boolean).join(" ") ||
    client.reference;
  const status = CLIENT_STATUS[client.status];

  const completion = (["kyc", "adequacy", "esg", "tax"] as const).reduce(
    (acc, kind) => {
      const key = kind === "esg" ? client.esg_profile : client[kind];
      const c = questionnaireCompletion(kind, asAnswers(key));
      return { filled: acc.filled + c.filled, total: acc.total + c.total };
    },
    { filled: 0, total: 0 },
  );
  const completionPct =
    completion.total === 0
      ? 0
      : Math.round((completion.filled / completion.total) * 100);

  return (
    <PageShell className="py-14">
      <Link
        href="/clients"
        className="text-[13px] text-muted transition-opacity hover:opacity-70"
      >
        ← Retour aux clients
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div>
          <Eyebrow>Fiche investisseur</Eyebrow>
          <h1 className="mt-3 text-[42px] font-medium leading-[46px] tracking-[-0.01em]">
            {fullName}
          </h1>
          <p className="mt-2 text-[14px] text-muted">
            Réf. {client.reference}
            <span className="mx-2 opacity-40">·</span>
            <Badge tone={status.tone}>{status.label}</Badge>
          </p>
        </div>
        <Link href={`/clients/${client.id}/edit`}>
          <Button variant="secondary" className="!text-slate !border-black/20">
            Éditer l'identité
          </Button>
        </Link>
      </div>

      {/* client-kpi-strip */}
      <div className="mt-8 grid grid-cols-2 gap-6 rounded-card border border-black/10 bg-white p-6 md:grid-cols-4">
        <Stat
          size="sm"
          value={
            client.patrimoine_financier != null
              ? formatEuro(Number(client.patrimoine_financier))
              : "—"
          }
          label="Patrimoine"
        />
        <Stat size="sm" value={String(leads.length)} label="Pistes" />
        <Stat
          size="sm"
          value={String(subscriptions.length)}
          label="Souscriptions"
        />
        <Stat
          size="sm"
          value={String(completionPct)}
          unit="%"
          label="Qualification"
        />
      </div>

      {/* client-detail-tabs */}
      <div className="mt-10 flex gap-6 overflow-x-auto border-b border-black/15">
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={[
                "whitespace-nowrap border-b-2 pb-3 text-[14px] transition-colors",
                active
                  ? "border-coral text-slate"
                  : "border-transparent text-muted hover:text-slate",
              ].join(" ")}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {tab === "profil" && (
          <ProfilTab client={client} fullName={fullName} />
        )}
        {tab === "activite" && (
          <ClientTimeline clientId={client.id} events={events} />
        )}
        {tab === "patrimoine" && (
          <PatrimoineTab clientId={client.id} assets={assets} />
        )}
        {tab === "qualification" && (
          <div className="flex flex-col gap-6">
            <QuestionnaireForm
              clientId={client.id}
              section={QUESTIONNAIRES.adequacy}
              initial={asAnswers(client.adequacy)}
            />
            <QuestionnaireForm
              clientId={client.id}
              section={QUESTIONNAIRES.esg}
              initial={asAnswers(client.esg_profile)}
            />
            <QuestionnaireForm
              clientId={client.id}
              section={QUESTIONNAIRES.tax}
              initial={asAnswers(client.tax)}
            />
          </div>
        )}
        {tab === "documents" && (
          <DocumentsChecklist clientId={client.id} documents={documents} />
        )}
        {tab === "souscriptions" && (
          <SubscriptionsTab subscriptions={subscriptions} />
        )}
        {tab === "pistes" && (
          <LeadsTab clientId={client.id} leads={leads} />
        )}
      </div>
    </PageShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] uppercase tracking-[0.06em] text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-[15px] text-slate">{value || "—"}</dd>
    </div>
  );
}

function ProfilTab({
  client,
  fullName,
}: {
  client: ClientRow;
  fullName: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-card border border-black/10 bg-white p-6 md:p-8">
        <h2 className="text-[20px] font-medium tracking-[-0.01em]">
          Informations de base
        </h2>
        <dl className="mt-6 grid gap-6 md:grid-cols-3">
          <InfoRow label="Nom complet" value={fullName} />
          <InfoRow label="Email" value={client.email ?? ""} />
          <InfoRow label="Téléphone" value={client.phone ?? ""} />
          <InfoRow label="Adresse" value={client.address ?? ""} />
          <InfoRow
            label="Date de naissance"
            value={
              client.birth_date
                ? format(new Date(client.birth_date), "d MMM yyyy", {
                    locale: fr,
                  })
                : ""
            }
          />
          <InfoRow label="Nationalité" value={client.nationality ?? ""} />
          <InfoRow
            label="Patrimoine financier"
            value={
              client.patrimoine_financier != null
                ? formatEuro(Number(client.patrimoine_financier))
                : ""
            }
          />
          <InfoRow
            label="Profil de risque"
            value={
              client.risk_profile
                ? (RISK_PROFILE_LABEL[client.risk_profile] ??
                  client.risk_profile)
                : ""
            }
          />
          <InfoRow
            label="Horizon"
            value={client.horizon_years ? `${client.horizon_years} ans` : ""}
          />
        </dl>
        {client.notes && (
          <div className="mt-6 border-t border-black/10 pt-6">
            <p className="text-[12px] uppercase tracking-[0.06em] text-muted">
              Notes
            </p>
            <p className="mt-2 text-[15px] leading-[24px] text-slate">
              {client.notes}
            </p>
          </div>
        )}
      </section>

      <QuestionnaireForm
        clientId={client.id}
        section={QUESTIONNAIRES.kyc}
        initial={asAnswers(client.kyc)}
      />

      <DangerZone clientId={client.id} status={client.status} />
    </div>
  );
}

function DangerZone({
  clientId,
  status,
}: {
  clientId: string;
  status: ClientStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggleArchive() {
    const next: ClientStatus = status === "archive" ? "actif" : "archive";
    startTransition(async () => {
      const res = await setClientStatus(clientId, next);
      if (res && "error" in res) setError(res.error);
    });
  }

  function onDelete() {
    if (
      !window.confirm(
        "Supprimer définitivement ce client ? Ses pistes d'investissement seront conservées mais détachées.",
      )
    )
      return;
    startTransition(async () => {
      const res = await deleteInvestor(clientId);
      if (res && "error" in res) setError(res.error);
    });
  }

  return (
    <section className="rounded-card border border-black/10 bg-cream-2 p-6 md:p-8">
      <h2 className="text-[16px] font-medium tracking-[-0.01em]">
        Administration
      </h2>
      <p className="mt-1 text-[14px] text-muted">
        Archiver retire le client des listes actives ; la suppression est
        définitive.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Button
          variant="secondary"
          hideChevron
          disabled={pending}
          onClick={toggleArchive}
          className="!text-slate !border-black/20"
        >
          {status === "archive" ? "Réactiver le client" : "Archiver le client"}
        </Button>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="text-[14px] text-coral transition-opacity hover:opacity-70 disabled:opacity-50"
        >
          Supprimer définitivement
        </button>
        {error && <span className="text-[14px] text-coral">{error}</span>}
      </div>
    </section>
  );
}

function SubscriptionsTab({
  subscriptions,
}: {
  subscriptions: ClientSubscription[];
}) {
  if (subscriptions.length === 0) {
    return (
      <EmptyState
        title="Aucune souscription."
        description="Les bulletins de souscription générés à partir des pistes d'investissement du client apparaîtront ici."
      />
    );
  }
  const total = subscriptions.reduce((s, x) => s + Number(x.amount), 0);
  return (
    <>
      <ul className="flex flex-col gap-3">
        {subscriptions.map((sub) => {
          const st = BULLETIN_STATUS[sub.status];
          return (
            <li
              key={sub.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-black/10 bg-white px-6 py-5"
            >
              <div className="min-w-0">
                <p className="font-medium">{sub.fund_name ?? "—"}</p>
                <p className="mt-0.5 text-[13px] text-muted">
                  Réf. {sub.reference} · généré le{" "}
                  {format(new Date(sub.generated_at), "d MMM yyyy", {
                    locale: fr,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[17px] font-medium tracking-[-0.02em]">
                  {formatEuro(Number(sub.amount))}
                </span>
                <Badge tone={st.tone}>{st.label}</Badge>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-right text-[14px] text-muted">
        Total souscrit ·{" "}
        <span className="font-medium text-slate">{formatEuro(total)}</span>
      </p>
    </>
  );
}

function LeadsTab({
  clientId,
  leads,
}: {
  clientId: string;
  leads: ClientLead[];
}) {
  return (
    <div>
      <div className="flex justify-end">
        <Link href={`/allocations/new?client=${clientId}`}>
          <Button>Nouvelle piste</Button>
        </Link>
      </div>
      {leads.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="Aucune piste d'investissement."
          description="Lancez une qualification pour composer une allocation ou une simulation rattachée à ce client."
        />
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {leads.map((a) => {
            const st = ALLOCATION_STATUS[a.status];
            return (
              <li key={a.id}>
                <Link
                  href={`/allocations/${a.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-black/10 bg-white px-6 py-5 transition-colors hover:border-coral"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{a.name}</p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {RISK_PROFILE_LABEL[a.risk_profile] ?? a.risk_profile} ·
                      modifiée le{" "}
                      {format(new Date(a.updated_at), "d MMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[17px] font-medium tracking-[-0.02em]">
                      {formatEuro(Number(a.envelope_amount))}
                    </span>
                    <Badge tone={st.tone}>{st.label}</Badge>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
