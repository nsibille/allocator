"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { TitleAccent } from "@/components/ui/TitleAccent";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { saveQuestionnaire } from "@/app/(app)/clients/actions";
import type { Question, QuestionnaireSection } from "@/lib/client/questionnaires.config";
import type { QuestionnaireAnswers } from "@/types/domain";

/**
 * client-questionnaire-form — rendu générique d'un questionnaire de qualification,
 * piloté par la config déclarative (`questionnaires.config.ts`). Registre clair.
 * Persiste la colonne JSONB via la server action `saveQuestionnaire`.
 */
export function QuestionnaireForm({
  clientId,
  section,
  initial,
}: {
  clientId: string;
  section: QuestionnaireSection;
  initial: QuestionnaireAnswers;
}) {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(initial);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    { tone: "ok" | "error"; message: string } | null
  >(null);

  function setValue(key: string, value: QuestionnaireAnswers[string]) {
    setAnswers((a) => ({ ...a, [key]: value }));
    setFeedback(null);
  }

  function toggleMulti(key: string, value: string) {
    setAnswers((a) => {
      const current = Array.isArray(a[key]) ? (a[key] as string[]) : [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...a, [key]: next };
    });
    setFeedback(null);
  }

  function onSubmit() {
    startTransition(async () => {
      const res = await saveQuestionnaire(clientId, {
        kind: section.kind,
        answers,
      });
      if (res && "error" in res) {
        setFeedback({ tone: "error", message: res.error });
      } else {
        setFeedback({ tone: "ok", message: "Questionnaire enregistré." });
      }
    });
  }

  return (
    <section className="rounded-card border border-black/10 bg-white p-6 md:p-8">
      <Eyebrow>{section.eyebrow}</Eyebrow>
      <TitleAccent
        as="h2"
        className="mt-3 text-[26px] font-medium leading-[32px] tracking-[-0.01em]"
        title={section.title}
        accentWord={section.accentWord}
      />
      <p className="mt-2 text-[15px] text-muted">{section.description}</p>

      <div className="mt-8 flex flex-col gap-7">
        {section.questions.map((q) => (
          <QuestionField
            key={q.key}
            question={q}
            value={answers[q.key]}
            onSetValue={(v) => setValue(q.key, v)}
            onToggleMulti={(v) => toggleMulti(q.key, v)}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button onClick={onSubmit} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {feedback && (
          <span
            className={[
              "text-[14px]",
              feedback.tone === "error" ? "text-coral" : "text-muted",
            ].join(" ")}
          >
            {feedback.message}
          </span>
        )}
      </div>
    </section>
  );
}

function QuestionField({
  question,
  value,
  onSetValue,
  onToggleMulti,
}: {
  question: Question;
  value: QuestionnaireAnswers[string];
  onSetValue: (value: QuestionnaireAnswers[string]) => void;
  onToggleMulti: (value: string) => void;
}) {
  const { type, label, options = [] } = question;

  if (type === "segmented") {
    const selected = question.multiple
      ? Array.isArray(value)
        ? (value as string[])
        : []
      : typeof value === "string"
        ? value
        : "";
    return (
      <div>
        <span className="mb-2.5 block text-[13px] text-slate">{label}</span>
        <Segmented
          registre="light"
          multiple={question.multiple}
          columns={question.columns}
          options={options}
          value={selected}
          onChange={(v) =>
            question.multiple ? onToggleMulti(v) : onSetValue(v)
          }
        />
      </div>
    );
  }

  if (type === "select") {
    return (
      <label className="block">
        <span className="mb-2.5 block text-[13px] text-slate">{label}</span>
        <span className="flex items-center rounded-field border border-black/15 bg-white px-4 py-3.5 transition-colors focus-within:border-coral">
          <select
            className="w-full bg-transparent text-slate outline-none"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onSetValue(e.target.value)}
          >
            <option value="">—</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </span>
      </label>
    );
  }

  // text / number / currency
  const isNumeric = type === "number" || type === "currency";
  return (
    <Field
      registre="light"
      label={label}
      type={isNumeric ? "number" : "text"}
      inputMode={isNumeric ? "decimal" : undefined}
      placeholder={question.placeholder}
      suffix={type === "currency" ? "€" : question.suffix}
      value={value == null ? "" : String(value)}
      onChange={(e) => {
        const raw = e.target.value;
        if (isNumeric) {
          onSetValue(raw === "" ? null : Number(raw));
        } else {
          onSetValue(raw);
        }
      }}
    />
  );
}
