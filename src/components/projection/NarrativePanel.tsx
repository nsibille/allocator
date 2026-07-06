import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * proj-narrative-panel — discours d'accompagnement, registre sombre hero-gradient.
 */
export function NarrativePanel({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div
      className="rounded-card border border-line p-8 text-white"
      style={{ background: "var(--hero-gradient)" }}
    >
      <Eyebrow>Discours d&apos;accompagnement</Eyebrow>
      <div className="mt-5 flex flex-col gap-4">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-[15px] leading-[25px] text-mist">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
