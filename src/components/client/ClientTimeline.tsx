"use client";

import { useMemo, useState, useTransition } from "react";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowDownToLine,
  Banknote,
  CalendarClock,
  Circle,
  ClipboardCheck,
  Contact,
  Download,
  Eye,
  FileCheck,
  FilePenLine,
  FilePlus,
  FileSignature,
  FileText,
  LogIn,
  Mail,
  Phone,
  RefreshCw,
  Send,
  Sparkles,
  StickyNote,
  UserCog,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { logManualEvent, deleteEvent } from "@/app/(app)/clients/actions";
import {
  ACTOR_LABEL,
  CATEGORY_META,
  EVENT_TYPES,
  FLOW_STATE_LABEL,
  MANUAL_EVENT_TYPES,
  type EventCategory,
} from "@/lib/client/events.config";
import { formatEuro } from "@/lib/funds";
import type { ClientEventRow, ClientEventType } from "@/types/domain";

/** client-activity-timeline — timeline relationnelle CRM (composeur + filtres + fil). */
const ICONS: Record<ClientEventType, LucideIcon> = {
  client_created: UserPlus,
  login: LogIn,
  fund_viewed: Eye,
  document_viewed: FileText,
  document_downloaded: Download,
  document_added: FilePlus,
  document_updated: FilePenLine,
  proposal_created: Sparkles,
  proposal_sent: Send,
  proposal_viewed: Eye,
  questionnaire_updated: ClipboardCheck,
  profile_updated: UserCog,
  status_changed: RefreshCw,
  contact_added: Contact,
  phone_call: Phone,
  meeting: CalendarClock,
  email: Mail,
  note: StickyNote,
  subscription_created: FileSignature,
  subscription_signed: FileCheck,
  capital_call: Banknote,
  distribution: ArrowDownToLine,
  other: Circle,
};

type EventData = { amount?: number; state?: string; status?: string } & Record<
  string,
  unknown
>;

export function ClientTimeline({
  clientId,
  events,
}: {
  clientId: string;
  events: ClientEventRow[];
}) {
  const [filter, setFilter] = useState<EventCategory | "all">("all");

  // Catégories réellement présentes (pour n'afficher que des filtres utiles).
  const presentCategories = useMemo(() => {
    const set = new Set<EventCategory>();
    for (const e of events) set.add(EVENT_TYPES[e.type].category);
    return [...set].sort(
      (a, b) => CATEGORY_META[a].order - CATEGORY_META[b].order,
    );
  }, [events]);

  const visible = useMemo(
    () =>
      filter === "all"
        ? events
        : events.filter((e) => EVENT_TYPES[e.type].category === filter),
    [events, filter],
  );

  return (
    <div className="flex flex-col gap-6">
      <EventComposer clientId={clientId} />

      {events.length === 0 ? (
        <EmptyState
          title="Aucune activité pour l'instant."
          description="Les événements du cycle de vie (consultations, échanges, souscriptions, flux, mises à jour) s'afficheront ici au fil de l'eau. Vous pouvez aussi journaliser un échange manuellement ci-dessus."
        />
      ) : (
        <>
          {presentCategories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={filter === "all"}
                onClick={() => setFilter("all")}
                label={`Tout (${events.length})`}
              />
              {presentCategories.map((cat) => (
                <FilterChip
                  key={cat}
                  active={filter === cat}
                  onClick={() => setFilter(cat)}
                  label={CATEGORY_META[cat].label}
                />
              ))}
            </div>
          )}

          <ol className="relative flex flex-col">
            {visible.map((event, i) => (
              <TimelineItem
                key={event.id}
                clientId={clientId}
                event={event}
                previous={visible[i - 1]}
                isLast={i === visible.length - 1}
              />
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-pill border px-3.5 py-1.5 text-[13px] transition-colors",
        active
          ? "border-coral bg-coral-wash text-coral"
          : "border-black/15 text-slate hover:border-coral/50",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function TimelineItem({
  clientId,
  event,
  previous,
  isLast,
}: {
  clientId: string;
  event: ClientEventRow;
  previous?: ClientEventRow;
  isLast: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const meta = EVENT_TYPES[event.type];
  const Icon = ICONS[event.type];
  const data = (event.data ?? {}) as EventData;
  const occurred = new Date(event.occurred_at);

  const showDayHeader =
    !previous || !isSameDay(new Date(previous.occurred_at), occurred);

  function onDelete() {
    startTransition(async () => {
      await deleteEvent(clientId, event.id);
    });
  }

  return (
    <li className="group relative pl-11">
      {showDayHeader && (
        <p className="mb-2 pt-4 text-[11px] uppercase tracking-[0.06em] text-muted first:pt-0">
          {format(occurred, "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      )}

      {/* Rail vertical */}
      {!isLast && (
        <span className="absolute left-[15px] top-7 bottom-0 w-px bg-black/10" />
      )}

      {/* Pastille icône */}
      <span
        className={[
          "absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-pill border",
          meta.accent
            ? "border-coral/40 bg-coral-wash text-coral"
            : "border-black/10 bg-white text-slate",
        ].join(" ")}
      >
        <Icon size={16} strokeWidth={1.5} />
      </span>

      <div className="flex flex-wrap items-start justify-between gap-2 pb-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-medium text-slate">
              {event.title || meta.label}
            </span>
            <span className="text-[12px] text-muted">· {meta.label}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-muted">
            <span>{format(occurred, "HH:mm", { locale: fr })}</span>
            <span className="opacity-40">·</span>
            <span>{ACTOR_LABEL[event.actor]}</span>
            {data.amount != null && (
              <span className="rounded-pill bg-coral-wash px-2 py-0.5 text-coral">
                {formatEuro(Number(data.amount))}
              </span>
            )}
            {data.state && FLOW_STATE_LABEL[String(data.state)] && (
              <span className="rounded-pill border border-black/10 px-2 py-0.5 text-slate">
                {FLOW_STATE_LABEL[String(data.state)]}
              </span>
            )}
          </div>
          {event.body && (
            <p className="mt-2 max-w-2xl text-[14px] leading-[22px] text-slate">
              {event.body}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="shrink-0 text-[12px] text-muted opacity-0 transition-opacity hover:text-coral group-hover:opacity-100 disabled:opacity-30"
          aria-label="Supprimer l'événement"
        >
          Supprimer
        </button>
      </div>
    </li>
  );
}

function EventComposer({ clientId }: { clientId: string }) {
  const [type, setType] = useState<ClientEventType>("note");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [occurredAt, setOccurredAt] = useState("");
  const [amount, setAmount] = useState("");
  const [state, setState] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const meta = EVENT_TYPES[type];
  const isFlux = meta.category === "flux";

  function reset() {
    setTitle("");
    setBody("");
    setOccurredAt("");
    setAmount("");
    setState("");
  }

  function onSubmit() {
    startTransition(async () => {
      const res = await logManualEvent(clientId, {
        type,
        title: title || undefined,
        body: body || undefined,
        occurred_at: occurredAt || undefined,
        amount: amount ? Number(amount) : null,
        state: state || undefined,
      });
      if (res && "error" in res) setError(res.error);
      else {
        setError(null);
        reset();
      }
    });
  }

  return (
    <section className="rounded-card border border-black/10 bg-white p-6 md:p-8">
      <h2 className="text-[20px] font-medium tracking-[-0.01em]">
        Journaliser un événement
      </h2>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2.5 block text-[13px] text-slate">Type</span>
          <span className="flex items-center rounded-field border border-black/15 bg-white px-4 py-3.5 focus-within:border-coral">
            <select
              className="w-full bg-transparent text-slate outline-none"
              value={type}
              onChange={(e) => setType(e.target.value as ClientEventType)}
            >
              {MANUAL_EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {CATEGORY_META[EVENT_TYPES[t].category].label} —{" "}
                  {EVENT_TYPES[t].label}
                </option>
              ))}
            </select>
          </span>
        </label>
        <Field
          registre="light"
          label="Date & heure"
          type="datetime-local"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
        />
        <Field
          registre="light"
          label="Intitulé (optionnel)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={meta.label}
        />
        {meta.financial && (
          <Field
            registre="light"
            label="Montant"
            type="number"
            inputMode="decimal"
            suffix="€"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
        )}
        {isFlux && (
          <label className="block">
            <span className="mb-2.5 block text-[13px] text-slate">État</span>
            <span className="flex items-center rounded-field border border-black/15 bg-white px-4 py-3.5 focus-within:border-coral">
              <select
                className="w-full bg-transparent text-slate outline-none"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="">—</option>
                {Object.entries(FLOW_STATE_LABEL).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            </span>
          </label>
        )}
      </div>
      <label className="mt-5 block">
        <span className="mb-2.5 block text-[13px] text-slate">
          Détail (optionnel)
        </span>
        <textarea
          className="w-full rounded-field border border-black/15 bg-white px-4 py-3.5 text-slate outline-none transition-colors focus:border-coral"
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Compte rendu de l'échange, contexte…"
        />
      </label>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button onClick={onSubmit} disabled={pending}>
          Ajouter à la timeline
        </Button>
        {error && <span className="text-[14px] text-coral">{error}</span>}
      </div>
    </section>
  );
}
